import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMaintenanceEvents, useProperties, useSystems } from '../hooks/useApi';
import { db } from '../types/models';
import { Card, Stack, TextInput, Group, Button, Loader, Center, Modal, Text, LoadingOverlay, NumberInput, Textarea, Select } from '@mantine/core';
import { IconCheck, IconTrash } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

interface MaintenanceDetailProps {
  id?: string | null;
}

export function MaintenanceDetail({ id }: MaintenanceDetailProps) {
  const navigate = useNavigate();
  const { save, delete_ } = useMaintenanceEvents();
  const { properties } = useProperties();
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const { systems } = useSystems(selectedPropertyId || undefined);
  
  const [event, setEvent] = useState<db.MaintenanceEvent | null>(null);
  const [loading, setLoading] = useState(id ? true : false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!event?.property_id?.trim()) newErrors.property_id = 'Property is required';
    if (!event?.system_id?.trim()) newErrors.system_id = 'System is required';
    if (!event?.description?.trim()) newErrors.description = 'Description is required';
    if (!event?.type?.trim()) newErrors.type = 'Type is required';
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
      if (id && id !== 'new') {
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
    if (!id || id === 'new') return;
    setIsDeleting(true);

    try {
      await delete_(id);
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
    if (id && id !== 'new') {
      setLoading(false);
      setEvent({
        id: id.toString(),
        property_id: '',
        system_id: '',
        description: '',
        type: '',
        repeat_type: 'once',
        repeat_interval_days: undefined,
        first_due_date: new Date().toISOString().split('T')[0],
        next_due_date: new Date().toISOString().split('T')[0],
        last_completed_date: undefined,
        completed_count: 0,
        notify_days_before: 7,
        assigned_provider_id: undefined,
        estimated_cost: 0,
        notes: '',
      });
    } else {
      setEvent({
        id: undefined,
        property_id: '',
        system_id: '',
        description: '',
        type: '',
        repeat_type: 'once',
        repeat_interval_days: undefined,
        first_due_date: new Date().toISOString().split('T')[0],
        next_due_date: new Date().toISOString().split('T')[0],
        last_completed_date: undefined,
        completed_count: 0,
        notify_days_before: 7,
        assigned_provider_id: undefined,
        estimated_cost: 0,
        notes: '',
      });
    }
  }, [id]);

  // When property is selected, update state and clear system selection
  const handlePropertyChange = (value: string | null) => {
    if (value) {
      setSelectedPropertyId(value);
      setEvent({ ...event!, property_id: value, system_id: '' });
      setIsDirty(true);
      if (errors.property_id) setErrors({ ...errors, property_id: '' });
    }
  };

  if ((id && id !== 'new' && loading) || !event) {
    return (
      <Center h={400}>
        <Loader />
      </Center>
    );
  }

  const propertyOptions = (properties || []).map(p => ({ value: p.id || '', label: p.name || '' })).filter(opt => opt.value && opt.label);
  const systemOptions = (systems || []).map(s => ({ value: s.id || '', label: s.name || '' })).filter(opt => opt.value && opt.label);

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
            {id && id !== 'new' && (
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
            <Select
              label="Property *"
              placeholder="Select property"
              data={propertyOptions}
              value={event.property_id || null}
              onChange={handlePropertyChange}
              error={errors.property_id}
              disabled={isSaving}
              searchable
            />
            <Select
              label="System *"
              placeholder="Select system"
              data={systemOptions}
              value={event.system_id || null}
              onChange={(value) => {
                if (value) {
                  setEvent({ ...event, system_id: value });
                  setIsDirty(true);
                  if (errors.system_id) setErrors({ ...errors, system_id: '' });
                }
              }}
              error={errors.system_id}
              disabled={isSaving || !event.property_id}
              searchable
            />
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
              label="Type *"
              value={event.type || ''}
              onChange={(e) => {
                setEvent({ ...event, type: e.currentTarget.value });
                setIsDirty(true);
                if (errors.type) setErrors({ ...errors, type: '' });
              }}
              error={errors.type}
              disabled={isSaving}
            />
            <Select
              label="Repeat Type"
              data={[
                { value: 'once', label: 'Once' },
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' },
                { value: 'yearly', label: 'Yearly' },
              ]}
              value={event.repeat_type || 'once'}
              onChange={(value) => {
                setEvent({ ...event, repeat_type: value || 'once' });
                setIsDirty(true);
              }}
              disabled={isSaving}
            />
            {event.repeat_type && event.repeat_type !== 'once' && (
              <NumberInput
                label="Repeat Interval (days)"
                value={Number(event.repeat_interval_days) || 0}
                onChange={(value) => {
                  setEvent({ ...event, repeat_interval_days: Number(value) || undefined });
                  setIsDirty(true);
                }}
                disabled={isSaving}
              />
            )}
            <TextInput
              label="First Due"
              type="date"
              value={event.first_due_date?.split('T')[0] || ''}
              onChange={(e) => {
                setEvent({ ...event, first_due_date: e.currentTarget.value });
                setIsDirty(true);
              }}
              disabled={isSaving}
            />
            <TextInput
              label="Next Due"
              type="date"
              value={event.next_due_date?.split('T')[0] || ''}
              onChange={(e) => {
                setEvent({ ...event, next_due_date: e.currentTarget.value });
                setIsDirty(true);
              }}
              disabled={isSaving}
            />
            <NumberInput
              label="Notify Days Before"
              value={Number(event.notify_days_before) || 7}
              onChange={(value) => {
                setEvent({ ...event, notify_days_before: Number(value) || 7 });
                setIsDirty(true);
              }}
              disabled={isSaving}
              min={0}
            />
            <NumberInput
              label="Estimated Cost"
              value={Number(event.estimated_cost) || 0}
              onChange={(value) => {
                setEvent({ ...event, estimated_cost: Number(value) || 0 });
                setIsDirty(true);
              }}
              disabled={isSaving}
              decimalScale={2}
              min={0}
            />
            <Textarea
              label="Notes"
              value={event.notes || ''}
              onChange={(e) => {
                setEvent({ ...event, notes: e.currentTarget.value });
                setIsDirty(true);
              }}
              disabled={isSaving}
              minRows={2}
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
