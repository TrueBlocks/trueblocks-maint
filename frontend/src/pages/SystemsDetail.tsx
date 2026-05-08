import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSystem, useAllSystems } from '../hooks/useApi';
import { useDetailPageNavigation } from '@trueblocks/scaffold';
import { db } from '../types/models';
import { Card, Stack, TextInput, Group, Button, Loader, Center, Modal, Text, LoadingOverlay } from '@mantine/core';
import { IconCheck, IconTrash } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

interface SystemsDetailProps {
  id?: string | null;
  filteredSystems?: db.System[];
}

export function SystemsDetail({ id, filteredSystems = [] }: SystemsDetailProps) {
  const navigate = useNavigate();
  const { save, delete_ } = useAllSystems();

  // Load single system when editing
  const isEditing = id && id !== 'new';
  const { system: loadedSystem, loading: systemLoading } = useSystem(isEditing ? id : undefined);

  const [system, setSystem] = useState<db.System | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useDetailPageNavigation({
    entityType: 'system',
    items: filteredSystems,
    currentId: isEditing ? id : undefined,
    getId: (s) => s.id ?? '',
    onNavigate: (nextId) => navigate(`/systems/${nextId}`),
    onReturnToList: useCallback(() => navigate('/systems'), [navigate]),
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!system?.name?.trim()) newErrors.name = 'Name is required';
    if (!system?.type?.trim()) newErrors.type = 'Type is required';
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

    if (!system) return;
    setIsSaving(true);

    try {
      if (id && id !== 'new') {
        await save(system);
        notifications.show({
          title: 'Success',
          message: 'System updated successfully',
          color: 'green',
        });
      } else {
        const newSystem = { ...system, id: `sys_${Date.now()}` };
        await save(newSystem);
        notifications.show({
          title: 'Success',
          message: 'System created successfully',
          color: 'green',
        });
        navigate(`/systems/${newSystem.id}`);
      }
      setIsDirty(false);
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? `Saving system failed: ${err.message}`
        : `Saving system failed: ${JSON.stringify(err)}`;
      console.error('Error saving system:', err);
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
        message: 'System deleted successfully',
        color: 'green',
      });
      navigate('/systems');
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? `Deleting system failed: ${err.message}`
        : `Deleting system failed: ${JSON.stringify(err)}`;
      console.error('Error deleting system:', err);
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
    // Initialize system from loaded data when editing or create new
    if (isEditing && loadedSystem) {
      setSystem(loadedSystem);
      setIsDirty(false);
    } else if (!isEditing) {
      // Creating new system - initialize with defaults
      const defaultSystem: db.System = {
        id: undefined,
        name: '',
        type: '',
      };
      setSystem(defaultSystem);
      setIsDirty(false);
    }
  }, [isEditing, loadedSystem]);

  if (!id) {
    return (
      <Center h={400}>
        <Text c="dimmed">Select a system to view details</Text>
      </Center>
    );
  }

  if ((isEditing && systemLoading) || !system) {
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
          <Group gap="md">
            <Button
              variant="subtle"
              onClick={() => navigate('/systems')}
              size="sm"
            >
              ← Back
            </Button>
            <h3>{system.name || 'System'}</h3>
          </Group>
          <Group gap="xs">
            <Button
              leftSection={<IconCheck size={16} />}
              onClick={handleSave}
              disabled={!isDirty}
              loading={isSaving}
              size="sm"
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
                size="sm"
              >
                Delete
              </Button>
            )}
          </Group>
        </Group>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <TextInput
              label="System Name *"
              value={system.name || ''}
              onChange={(e) => {
                setSystem({ ...system, name: e.currentTarget.value });
                setIsDirty(true);
                if (errors.name) setErrors({ ...errors, name: '' });
              }}
              error={errors.name}
              disabled={isSaving}
            />
            <TextInput
              label="Type *"
              placeholder="e.g., HVAC, Plumbing, Electrical"
              value={system.type || ''}
              onChange={(e) => {
                setSystem({ ...system, type: e.currentTarget.value });
                setIsDirty(true);
                if (errors.type) setErrors({ ...errors, type: '' });
              }}
              error={errors.type}
              disabled={isSaving}
            />
            <TextInput
              label="Model"
              value={system.model || ''}
              onChange={(e) => {
                setSystem({ ...system, model: e.currentTarget.value });
                setIsDirty(true);
              }}
              disabled={isSaving}
            />
            <TextInput
              label="Serial"
              value={system.serial || ''}
              onChange={(e) => {
                setSystem({ ...system, serial: e.currentTarget.value });
                setIsDirty(true);
              }}
              disabled={isSaving}
            />
            <TextInput
              label="Age"
              value={system.age || ''}
              onChange={(e) => {
                setSystem({ ...system, age: e.currentTarget.value });
                setIsDirty(true);
              }}
              disabled={isSaving}
            />
            <TextInput
              label="Notes"
              placeholder="Additional notes about this system"
              value={system.notes || ''}
              onChange={(e) => {
                setSystem({ ...system, notes: e.currentTarget.value });
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
            Are you sure you want to delete <strong>{system.name}</strong>? This action cannot be undone.
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
