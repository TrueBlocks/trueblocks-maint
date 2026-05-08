import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDetailPageNavigation } from '@trueblocks/scaffold';
import { useProperty, useProperties, useSystems } from '../hooks/useApi';
import { db } from '../types/models';
import { Card, Stack, TextInput, Group, Button, Loader, Center, Modal, Text, LoadingOverlay } from '@mantine/core';
import { IconCheck, IconTrash, IconPlus, IconEdit } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { DataTable } from '../components/DataTable';

interface PropertiesDetailProps {
  id?: string | null;
  filteredProperties?: db.Property[];
}

export function PropertiesDetail({ id, filteredProperties = [] }: PropertiesDetailProps) {
  const navigate = useNavigate();
  const existingHook = useProperty(id && id !== 'new' ? id : undefined);
  const createHook = useProperties();
  const systemsHook = useSystems(id && id !== 'new' ? id : undefined);
  const [formData, setFormData] = useState<db.Property | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [systemsData, setSystemsData] = useState<db.System[]>([]);

  const isCreating = id === 'new';
  const property = id && id !== 'new' ? existingHook.property : null;
  const loading = id && id !== 'new' ? existingHook.loading : false;

  useDetailPageNavigation({
    entityType: 'property',
    items: filteredProperties,
    currentId: !isCreating && id ? id : undefined,
    getId: (p) => p.id ?? '',
    onNavigate: (nextId) => navigate(`/properties/${nextId}`),
    onReturnToList: useCallback(() => navigate('/properties'), [navigate]),
  });

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
      if (id && id !== 'new') {
        await existingHook.save(formData);
        notifications.show({
          title: 'Success',
          message: 'Property updated successfully',
          color: 'green',
        });
        setEditModalOpen(false);
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
      let errorMessage = 'Failed to save property';
      if (err instanceof Error) {
        if (err.message.includes('UNIQUE')) {
          errorMessage = 'A property with this name already exists';
        } else {
          errorMessage = `Saving property failed: ${err.message}`;
        }
      } else {
        errorMessage = `Saving property failed: ${JSON.stringify(err)}`;
      }
      console.error('Error saving property:', err);
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
    if (!id || id === 'new') return;
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
      const errorMessage = err instanceof Error 
        ? `Deleting property failed: ${err.message}`
        : `Deleting property failed: ${JSON.stringify(err)}`;
      console.error('Error deleting property:', err);
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
    if (isCreating) {
      setFormData({
        id: undefined,
        name: '',
        address: '',
        city: '',
        state: '',
        zip: '',
      });
    } else if (id && property) {
      setFormData(property);
    }
  }, [property, id, isCreating]);

  useEffect(() => {
    if (systemsHook.systems) {
      setSystemsData(systemsHook.systems);
    }
  }, [systemsHook.systems]);

  if (!id) {
    return (
      <Center h={400}>
        <Text c="dimmed">Select a property to view details</Text>
      </Center>
    );
  }

  if ((id && id !== 'new' && loading) || !formData) {
    return (
      <Center h={400}>
        <Loader />
      </Center>
    );
  }

  return (
    <>
      <Stack gap="md" style={{ position: 'relative', height: '100%' }}>
        <LoadingOverlay visible={isSaving} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />

        {/* Creating New Property - Show form directly */}
        {isCreating ? (
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack gap="md">
              <h3>New Property</h3>
              <TextInput
                label="Name *"
                placeholder="Property name"
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
                placeholder="Street address"
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
                placeholder="City"
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
                placeholder="State"
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
                placeholder="Zip code"
                value={formData.zip || ''}
                onChange={(e) => {
                  setFormData({ ...formData, zip: e.currentTarget.value });
                  setIsDirty(true);
                }}
                disabled={isSaving}
              />
              <Group justify="flex-end" mt="lg">
                <Button
                  variant="subtle"
                  onClick={() => navigate('/properties')}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  leftSection={<IconCheck size={16} />}
                  onClick={handleSave}
                  disabled={!isDirty}
                  loading={isSaving}
                >
                  Create Property
                </Button>
              </Group>
            </Stack>
          </Card>
        ) : (
          <>
            {/* Property Info - Compact Text Display */}
            {id && id !== 'new' && (
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between" align="flex-start">
                  <Stack gap="xs" style={{ flex: 1 }}>
                    <Text fw={700} size="lg">
                      {formData.name}
                    </Text>
                    <Text size="sm" c="dimmed">
                      {formData.address}
                    </Text>
                    <Text size="sm" c="dimmed">
                      {formData.city}, {formData.state} {formData.zip}
                    </Text>
                  </Stack>
                  <Group gap="xs">
                    <Button
                      leftSection={<IconEdit size={16} />}
                      onClick={() => setEditModalOpen(true)}
                      size="sm"
                      variant="light"
                    >
                      Edit
                    </Button>
                    {id && (
                      <Button
                        color="red"
                        variant="light"
                        leftSection={<IconTrash size={16} />}
                        onClick={() => setDeleteConfirmOpen(true)}
                        size="sm"
                      >
                        Delete
                      </Button>
                    )}
                  </Group>
                </Group>
              </Card>
            )}

            {/* Systems Section */}
            {id && id !== 'new' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Group justify="space-between" mb="lg">
                  <h3 style={{ margin: 0 }}>Systems</h3>
                  <Button
                    leftSection={<IconPlus size={16} />}
                    onClick={() => navigate(`/properties/${id}/systems/new`)}
                    size="sm"
                  >
                    Add System
                  </Button>
                </Group>
                {systemsHook.loading ? (
                  <Loader />
                ) : (
                  <div style={{ flex: 1, overflow: 'auto' }}>
                    <DataTable
                      tableName={`systems-${id}`}
                      columns={[
                        { key: 'name', label: 'System' },
                        { key: 'type', label: 'Type' },
                        { key: 'model', label: 'Model' },
                      ]}
                      data={systemsData}
                      getRowKey={(item) => item.id?.toString() || ''}
                      onRowClick={(system) => navigate(`/properties/${id}/systems/${system.id}`)}
                    />
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </Stack>

      {/* Edit Modal */}
      <Modal
        opened={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setIsDirty(false);
        }}
        title="Edit Property"
        size="lg"
      >
        <Stack gap="md">
          <TextInput
            label="Name *"
            value={formData?.name || ''}
            onChange={(e) => {
              setFormData({ ...formData!, name: e.currentTarget.value });
              setIsDirty(true);
              if (errors.name) setErrors({ ...errors, name: '' });
            }}
            error={errors.name}
            disabled={isSaving}
          />
          <TextInput
            label="Address *"
            value={formData?.address || ''}
            onChange={(e) => {
              setFormData({ ...formData!, address: e.currentTarget.value });
              setIsDirty(true);
              if (errors.address) setErrors({ ...errors, address: '' });
            }}
            error={errors.address}
            disabled={isSaving}
          />
          <TextInput
            label="City *"
            value={formData?.city || ''}
            onChange={(e) => {
              setFormData({ ...formData!, city: e.currentTarget.value });
              setIsDirty(true);
              if (errors.city) setErrors({ ...errors, city: '' });
            }}
            error={errors.city}
            disabled={isSaving}
          />
          <TextInput
            label="State *"
            value={formData?.state || ''}
            onChange={(e) => {
              setFormData({ ...formData!, state: e.currentTarget.value });
              setIsDirty(true);
              if (errors.state) setErrors({ ...errors, state: '' });
            }}
            error={errors.state}
            disabled={isSaving}
          />
          <TextInput
            label="Zip"
            value={formData?.zip || ''}
            onChange={(e) => {
              setFormData({ ...formData!, zip: e.currentTarget.value });
              setIsDirty(true);
            }}
            disabled={isSaving}
          />
          <Group justify="flex-end" mt="lg">
            <Button
              variant="subtle"
              onClick={() => {
                setEditModalOpen(false);
                setIsDirty(false);
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              leftSection={<IconCheck size={16} />}
              onClick={handleSave}
              disabled={!isDirty}
              loading={isSaving}
            >
              Save
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Confirm Delete"
        centered
      >
        <Stack gap="md">
          <Text>
            Are you sure you want to delete <strong>{formData?.name}</strong>? This action cannot be undone.
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
