import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHotkeys } from '@mantine/hooks';
import { useNavigation } from '@trueblocks/scaffold';
import { useServiceProvider, useServiceProviders } from '../hooks/useApi';
import { db } from '../types/models';
import { Card, Stack, TextInput, Group, Button, Loader, Center, Modal, Text, LoadingOverlay } from '@mantine/core';
import { IconCheck, IconTrash } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

interface ProvidersDetailProps {
  id?: string | null;
  filteredProviders?: db.ServiceProvider[];
}

export function ProvidersDetail({ id, filteredProviders = [] }: ProvidersDetailProps) {
  const navigate = useNavigate();
  const { stack, currentLevel, currentIndex, hasPrev, hasNext, setItems, setCurrentId } = useNavigation();
  const { save, delete_ } = useServiceProviders();
  
  // Load single provider when editing
  const isEditing = id && id !== 'new';
  const { provider: loadedProvider, loading: providerLoading } = useServiceProvider(isEditing ? id : undefined);
  
  const [provider, setProvider] = useState<db.ServiceProvider | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Set up navigation stack from filtered providers
  const stackLength = stack.length;
  useEffect(() => {
    if (stackLength === 0 && filteredProviders.length > 0 && id && id !== 'new') {
      const currentIndex = filteredProviders.findIndex((p) => p.id === id);
      const items = filteredProviders.map((_, idx) => ({ id: idx }));
      if (currentIndex >= 0) {
        setItems('provider', items, currentIndex);
      }
    }
  }, [stackLength, filteredProviders, id, setItems]);

  // Keep current ID in sync
  useEffect(() => {
    if (id && id !== 'new') {
      const currentIndex = filteredProviders.findIndex((p) => p.id === id);
      if (currentIndex >= 0) {
        setCurrentId(currentIndex);
      }
    }
  }, [id, filteredProviders, setCurrentId]);

  // Navigation handlers - use index from navigation, map to actual ID from filtered list
  const navigateToProvider = useCallback(
    (navIndex: number) => {
      if (navIndex >= 0 && navIndex < filteredProviders.length) {
        const providerId = filteredProviders[navIndex].id;
        if (providerId) {
          navigate(`/providers/${providerId}`);
        }
      }
    },
    [navigate, filteredProviders]
  );

  const handlePrev = useCallback(() => {
    if (!hasPrev || !currentLevel) return;
    const prevIndex = currentIndex - 1;
    navigateToProvider(prevIndex);
  }, [hasPrev, currentIndex, currentLevel, navigateToProvider]);

  const handleNext = useCallback(() => {
    if (!hasNext || !currentLevel) return;
    const nextIndex = currentIndex + 1;
    navigateToProvider(nextIndex);
  }, [hasNext, currentIndex, currentLevel, navigateToProvider]);

  const handleHome = useCallback(() => {
    if (!currentLevel || currentLevel.items.length === 0) return;
    navigateToProvider(0);
  }, [currentLevel, navigateToProvider]);

  const handleEnd = useCallback(() => {
    if (!currentLevel || currentLevel.items.length === 0) return;
    navigateToProvider(currentLevel.items.length - 1);
  }, [currentLevel, navigateToProvider]);

  const handleReturnToList = useCallback(() => navigate('/providers'), [navigate]);

  // Keyboard shortcuts
  useHotkeys([
    ['ArrowRight', (e) => {
      const t = e.target as HTMLElement;
      if (t.tagName !== 'INPUT' && t.tagName !== 'TEXTAREA') handleNext();
    }, { preventDefault: false }],
    ['ArrowLeft', (e) => {
      const t = e.target as HTMLElement;
      if (t.tagName !== 'INPUT' && t.tagName !== 'TEXTAREA') handlePrev();
    }, { preventDefault: false }],
    ['Home', handleHome],
    ['End', handleEnd],
    ['mod+shift+ArrowLeft', handleReturnToList],
  ]);

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
      const errorMessage = err instanceof Error 
        ? `Saving service provider failed: ${err.message}`
        : `Saving service provider failed: ${JSON.stringify(err)}`;
      console.error('Error saving service provider:', err);
      notifications.show({
        title: 'Error',
        message: errorMessage,
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
      const errorMessage = err instanceof Error 
        ? `Deleting service provider failed: ${err.message}`
        : `Deleting service provider failed: ${JSON.stringify(err)}`;
      console.error('Error deleting service provider:', err);
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };

  useEffect(() => {
    // Initialize provider from loaded data when editing or create new
    if (isEditing && loadedProvider) {
      setProvider(loadedProvider);
      setIsDirty(false);
    } else if (!isEditing) {
      // Creating new provider - initialize with defaults
      const defaultProvider: db.ServiceProvider = {
        id: undefined,
        name: '',
        specialty: '',
        phone: '',
        email: '',
      };
      setProvider(defaultProvider);
      setIsDirty(false);
    }
  }, [isEditing, loadedProvider]);

  if (!id) {
    return (
      <Center h={400}>
        <Text c="dimmed">Select a provider to view details</Text>
      </Center>
    );
  }

  if ((isEditing && providerLoading) || !provider) {
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
