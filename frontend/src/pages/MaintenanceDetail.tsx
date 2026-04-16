import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMaintenanceEvents } from '../hooks/useApi';
import { db } from '../types/models';
import { Card, Stack, TextInput, Group, Button, Loader, Center, Modal, Text, LoadingOverlay, NumberInput, Textarea } from '@mantine/core';
import { IconCheck, IconTrash } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

interface MaintenanceDetailProps {
  id?: number | null;
}

export function MaintenanceDetail({ id }: MaintenanceDetailProps) {
  const navigate = useNavigate();
  const { save, delete_ } = useMaintenanceEvents();
  const [event, setEvent] = useState<db.MaintenanceEvent | null>(null);
  const [loading, setLoading] = useState(id ? true : false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!event?.description?.trim()) newErrors.description = 'Description is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      notifications.show({
        title: 'Validation Error',
        message: 'Please fill in all required fields',
        color: 'red',
      });
      return;
    }

    if (!event) return;
    setIsSaving(true);

    try {
      if (id) {
        await save(event);
        notifications.show({
          title: 'Success',
          message: 'Maintenance event updated successfully',
          color: 'green',
        });
      } else {
        const newEvent = { ...event, id: `evt_${Date.now()}` };
        await save(newEvent);
        notifications.show({
          title: 'Success',
          message: 'Maintenance event created successfully',
          color: 'green',
        });
        navigate('/maintenance');
      }
      setIsDirty(false);
    } catch (err) {
      notifications.show({
        title: 'Error',
        message: err instanceof Error ? err.message : 'Failed to save maintenance event',
        color: 'red',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);

    try {
      await delete_(id.toString());
      notifications.show({
        title: 'Success',
        message: 'Maintenance event deleted successfully',
        color: 'green',
      });
      navigate('/maintenance');
    } catch (err) {
      notifications.show({
        title: 'Error',
        message: err instanceof Error ? err.message : 'Failed to delete maintenance event',
        color: 'red',
      });
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };

  useEffect(() => {
    if (id) {
      setLoading(false);
      setEvent({
        id: id.toString(),
        description: '',
        type: '',
        firstDue: new Date().toISOString(),
        nextDue: new Date().toISOString(),
        estimatedCost: 0,
      });
    } else {
      setEvent({
        id: undefined,
        description: '',
        type: '',
        firstDue: new Date().toISOString(),
        nextDue: new Date().toISOString(),
        estimatedCost: 0,
      });
    }
  }, [id]);

  if ((id && loading) || !event) {
    return (
      <Center h={400}>
        <Loader />
      </Center>
    );
  }

  return (
    <>
      <Stack gap="lg" style={{ position: 'relative' }}>
        <LoadingOverlay visible={isSaving} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />

        <Group justify="space-between">
          <h2>{event.description || 'Maintenance Event'}</h2>
          <Group gap="xs">
            <Button
              leftSection={<IconCheck size={16} />}
              onClick={handleSave}
              disabled={!isDirty}
              loading={isSaving}
            >
              Save
            </Button>
            {id && (
              <Button
                color="red"
                variant="light"
                leftSection={<IconTrash size={16} />}
                onClick={() => setDeleteConfirmOpen(true)}
                disabled={isSaving}
              >
                Delete
              </Button>
            )}
          </Group>
        </Group>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Textarea
              label="Description *"
              value={event.description || ''}
              onChange={(e) => {
                setEvent({ ...event, description: e.currentTarget.value });
                setIsDirty(true);
                if (errors.description) setErrors({ ...errors, description: '' });
              }}
              error={errors.description}
              disabled={isSaving}
              minRows={3}
            />
            <TextInput
              label="Type"
              value={event.type || ''}
              onChange={(e) => {
                setEvent({ ...event, type: e.currentTarget.value });
                setIsDirty(true);
              }}
              disabled={isSaving}
            />
            <TextInput
              label="First Due"
              type="date"
              value={event.firstDue?.split('T')[0] || ''}
              onChange={(e) => {
                setEvent({ ...event, firstDue: new Date(e.currentTarget.value).toISOString() });
                setIsDirty(true);
              }}
              disabled={isSaving}
            />
            <TextInput
              label="Next Due"
              type="date"
              value={event.nextDue?.split('T')[0] || ''}
              onChange={(e) => {
                setEvent({ ...event, nextDue: new Date(e.currentTarget.value).toISOString() });
                setIsDirty(true);
              }}
              disabled={isSaving}
            />
            <NumberInput
              label="Estimated Cost"
              value={event.estimatedCost || 0}
              onChange={(value) => {
                setEvent({ ...event, estimatedCost: Number(value) || 0 });
                setIsDirty(true);
              }}
              disabled={isSaving}
              decimalScale={2}
              min={0}
            />
          </Stack>
        </Card>
      </Stack>

      <Modal
        opened={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Confirm Delete"
        centered
      >
        <Stack gap="md">
          <Text>
            Are you sure you want to delete this maintenance event? This action cannot be undone.
          </Text>
          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => setDeleteConfirmOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button color="red" onClick={handleDelete} loading={isDeleting}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
