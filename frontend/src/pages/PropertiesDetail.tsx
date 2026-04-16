import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProperty, useProperties } from '../hooks/useApi';
import { db } from '../types/models';
import { Card, Stack, TextInput, Group, Button, Loader, Center, Modal, Text, LoadingOverlay } from '@mantine/core';
import { IconCheck, IconTrash } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

interface PropertiesDetailProps {
  id?: string | null;
}

export function PropertiesDetail({ id }: PropertiesDetailProps) {
  const navigate = useNavigate();
  const existingHook = useProperty(id || undefined);
  const createHook = useProperties();
  const [formData, setFormData] = useState<db.Property | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const property = id ? existingHook.property : null;
  const loading = id ? existingHook.loading : false;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData?.name?.trim()) newErrors.name = 'Name is required';
    if (!formData?.address?.trim()) newErrors.address = 'Address is required';
    if (!formData?.city?.trim()) newErrors.city = 'City is required';
    if (!formData?.state?.trim()) newErrors.state = 'State is required';
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

    if (!formData) return;
    setIsSaving(true);

    try {
      if (id) {
        await existingHook.save(formData);
        notifications.show({
          title: 'Success',
          message: 'Property updated successfully',
          color: 'green',
        });
      } else {
        const newProperty = { ...formData, id: `prop_${Date.now()}` };
        await createHook.save(newProperty);
        notifications.show({
          title: 'Success',
          message: 'Property created successfully',
          color: 'green',
        });
        navigate('/properties');
      }
      setIsDirty(false);
    } catch (err) {
      notifications.show({
        title: 'Error',
        message: err instanceof Error ? err.message : 'Failed to save property',
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
      await createHook.delete_(id);
      notifications.show({
        title: 'Success',
        message: 'Property deleted successfully',
        color: 'green',
      });
      navigate('/properties');
    } catch (err) {
      notifications.show({
        title: 'Error',
        message: err instanceof Error ? err.message : 'Failed to delete property',
        color: 'red',
      });
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };

  useEffect(() => {
    if (id) {
      if (property) setFormData(property);
    } else {
      setFormData({
        id: undefined,
        name: '',
        address: '',
        city: '',
        state: '',
        zip: '',
      });
    }
  }, [property, id]);

  if ((id && loading) || !formData) {
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
          <h2>{formData.name || 'Property Details'}</h2>
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
            <TextInput
              label="Name *"
              value={formData.name || ''}
              onChange={(e) => {
                setFormData({ ...formData, name: e.currentTarget.value });
                setIsDirty(true);
                if (errors.name) setErrors({ ...errors, name: '' });
              }}
              error={errors.name}
              disabled={isSaving}
            />
            <TextInput
              label="Address *"
              value={formData.address || ''}
              onChange={(e) => {
                setFormData({ ...formData, address: e.currentTarget.value });
                setIsDirty(true);
                if (errors.address) setErrors({ ...errors, address: '' });
              }}
              error={errors.address}
              disabled={isSaving}
            />
            <TextInput
              label="City *"
              value={formData.city || ''}
              onChange={(e) => {
                setFormData({ ...formData, city: e.currentTarget.value });
                setIsDirty(true);
                if (errors.city) setErrors({ ...errors, city: '' });
              }}
              error={errors.city}
              disabled={isSaving}
            />
            <TextInput
              label="State *"
              value={formData.state || ''}
              onChange={(e) => {
                setFormData({ ...formData, state: e.currentTarget.value });
                setIsDirty(true);
                if (errors.state) setErrors({ ...errors, state: '' });
              }}
              error={errors.state}
              disabled={isSaving}
            />
            <TextInput
              label="Zip"
              value={formData.zip || ''}
              onChange={(e) => {
                setFormData({ ...formData, zip: e.currentTarget.value });
                setIsDirty(true);
              }}
              disabled={isSaving}
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
            Are you sure you want to delete <strong>{formData.name}</strong>? This action cannot be undone.
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
