import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useServiceProviders } from '../hooks/useApi';
import { db } from '../types/models';
import { Card, Stack, TextInput, Group, Button, Loader, Center, Modal, Text, LoadingOverlay } from '@mantine/core';
import { IconCheck, IconTrash } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

interface ProvidersDetailProps {
  id?: string | null;
}

export function ProvidersDetail({ id }: ProvidersDetailProps) {
  const navigate = useNavigate();
  const { save, delete_ } = useServiceProviders();
  const [provider, setProvider] = useState<db.ServiceProvider | null>(null);
  const [loading, setLoading] = useState(id ? true : false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!provider?.name?.trim()) newErrors.name = 'Name is required';
    if (!provider?.specialty?.trim()) newErrors.specialty = 'Specialty is required';
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

    if (!provider) return;
    setIsSaving(true);

    try {
      if (id) {
        await save(provider);
        notifications.show({
          title: 'Success',
          message: 'Service provider updated successfully',
          color: 'green',
        });
      } else {
        const newProvider = { ...provider, id: `prov_${Date.now()}` };
        await save(newProvider);
        notifications.show({
          title: 'Success',
          message: 'Service provider created successfully',
          color: 'green',
        });
        navigate('/providers');
      }
      setIsDirty(false);
    } catch (err) {
      notifications.show({
        title: 'Error',
        message: err instanceof Error ? err.message : 'Failed to save service provider',
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
      await delete_(id);
      notifications.show({
        title: 'Success',
        message: 'Service provider deleted successfully',
        color: 'green',
      });
      navigate('/providers');
    } catch (err) {
      notifications.show({
        title: 'Error',
        message: err instanceof Error ? err.message : 'Failed to delete service provider',
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
      setProvider({
        id: id.toString(),
        name: '',
        specialty: '',
        phone: '',
        email: '',
      });
    } else {
      setProvider({
        id: undefined,
        name: '',
        specialty: '',
        phone: '',
        email: '',
      });
    }
  }, [id]);

  if ((id && loading) || !provider) {
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
          <h2>{provider.name || 'Service Provider'}</h2>
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
              value={provider.name || ''}
              onChange={(e) => {
                setProvider({ ...provider, name: e.currentTarget.value });
                setIsDirty(true);
                if (errors.name) setErrors({ ...errors, name: '' });
              }}
              error={errors.name}
              disabled={isSaving}
            />
            <TextInput
              label="Specialty *"
              value={provider.specialty || ''}
              onChange={(e) => {
                setProvider({ ...provider, specialty: e.currentTarget.value });
                setIsDirty(true);
                if (errors.specialty) setErrors({ ...errors, specialty: '' });
              }}
              error={errors.specialty}
              disabled={isSaving}
            />
            <TextInput
              label="Phone"
              value={provider.phone || ''}
              onChange={(e) => {
                setProvider({ ...provider, phone: e.currentTarget.value });
                setIsDirty(true);
              }}
              disabled={isSaving}
            />
            <TextInput
              label="Email"
              type="email"
              value={provider.email || ''}
              onChange={(e) => {
                setProvider({ ...provider, email: e.currentTarget.value });
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
            Are you sure you want to delete <strong>{provider.name}</strong>? This action cannot be undone.
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
