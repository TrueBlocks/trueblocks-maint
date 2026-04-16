import {
  Container,
  Title,
  Text,
  Table,
  Card,
  Stack,
  Group,
  Button,
  Modal,
  TextInput,
  Textarea,
  Loader,
  Center,
  ActionIcon,
  Tabs,
  Grid,
} from '@mantine/core';
import { IconPlus, IconEdit, IconTrash, IconX } from '@tabler/icons-react';
import { useProperties, useProperty, useSystems } from '../hooks/useApi';
import { db } from '../types/models';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function PropertiesList() {
  const { properties, loading, save, delete: deleteProperty } = useProperties() as any;
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<db.Property>>({});

  const handleOpenModal = (property?: db.Property) => {
    if (property) {
      setEditingId(property.id || null);
      setFormData(property);
    } else {
      setEditingId(null);
      setFormData({});
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      await save(formData as db.Property);
      setModalOpen(false);
      setFormData({});
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure?')) {
      try {
        await deleteProperty(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading) {
    return (
      <Center h={400}>
        <Loader />
      </Center>
    );
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={3}>Properties</Title>
          <Text c="dimmed">Manage your properties and their associated systems.</Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={() => handleOpenModal()}>
          Add Property
        </Button>
      </Group>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Property</Table.Th>
              <Table.Th>Address</Table.Th>
              <Table.Th>City, State</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {properties.map((prop: db.Property) => (
              <Table.Tr key={prop.id}>
                <Table.Td>
                  <Text fw={500}>{prop.name}</Text>
                </Table.Td>
                <Table.Td>{prop.address}</Table.Td>
                <Table.Td>
                  {prop.city}, {prop.state}
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon
                      color="blue"
                      variant="light"
                      onClick={() => navigate(`/properties/${prop.id}`)}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      color="red"
                      variant="light"
                      onClick={() => handleDelete(prop.id || '')}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>

      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title="Add Property">
        <Stack gap="md">
          <TextInput
            label="Name"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.currentTarget.value })}
          />
          <TextInput
            label="Address"
            value={formData.address || ''}
            onChange={(e) => setFormData({ ...formData, address: e.currentTarget.value })}
          />
          <TextInput
            label="City"
            value={formData.city || ''}
            onChange={(e) => setFormData({ ...formData, city: e.currentTarget.value })}
          />
          <TextInput
            label="State"
            value={formData.state || ''}
            onChange={(e) => setFormData({ ...formData, state: e.currentTarget.value })}
          />
          <TextInput
            label="Zip"
            value={formData.zip || ''}
            onChange={(e) => setFormData({ ...formData, zip: e.currentTarget.value })}
          />
          <Textarea
            label="Notes"
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.currentTarget.value })}
          />
          <Group justify="flex-end">
            <Button variant="light" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const { property, loading, save } = useProperty(id);
  const { systems, loading: systemsLoading } = useSystems(id);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<db.Property | null>(null);

  if (loading) {
    return (
      <Center h={400}>
        <Loader />
      </Center>
    );
  }

  if (!property) {
    return <Text>Property not found</Text>;
  }

  const currentData = editMode && formData ? formData : property;

  const handleSave = async () => {
    if (formData) {
      try {
        await save(formData);
        setEditMode(false);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={3}>{currentData.name}</Title>
          <Text c="dimmed">
            {currentData.address}, {currentData.city}, {currentData.state} {currentData.zip}
          </Text>
        </div>
        {editMode ? (
          <Group>
            <Button variant="light" onClick={() => setEditMode(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </Group>
        ) : (
          <Button onClick={() => {
            setFormData(property);
            setEditMode(true);
          }}>
            Edit
          </Button>
        )}
      </Group>

      {editMode ? (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <TextInput
              label="Name"
              value={formData?.name || ''}
              onChange={(e) => setFormData(formData ? { ...formData, name: e.currentTarget.value } : null)}
            />
            <TextInput
              label="Address"
              value={formData?.address || ''}
              onChange={(e) =>
                setFormData(formData ? { ...formData, address: e.currentTarget.value } : null)
              }
            />
            <TextInput
              label="City"
              value={formData?.city || ''}
              onChange={(e) =>
                setFormData(formData ? { ...formData, city: e.currentTarget.value } : null)
              }
            />
            <TextInput
              label="State"
              value={formData?.state || ''}
              onChange={(e) =>
                setFormData(formData ? { ...formData, state: e.currentTarget.value } : null)
              }
            />
            <TextInput
              label="Zip"
              value={formData?.zip || ''}
              onChange={(e) =>
                setFormData(formData ? { ...formData, zip: e.currentTarget.value } : null)
              }
            />
            <Textarea
              label="Notes"
              value={formData?.notes || ''}
              onChange={(e) =>
                setFormData(formData ? { ...formData, notes: e.currentTarget.value } : null)
              }
            />
          </Stack>
        </Card>
      ) : (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <div>
              <Text fw={500} size="sm" c="dimmed">
                Address
              </Text>
              <Text>{currentData.address}</Text>
            </div>
            <div>
              <Text fw={500} size="sm" c="dimmed">
                City, State, Zip
              </Text>
              <Text>
                {currentData.city}, {currentData.state} {currentData.zip}
              </Text>
            </div>
            {currentData.notes && (
              <div>
                <Text fw={500} size="sm" c="dimmed">
                  Notes
                </Text>
                <Text>{currentData.notes}</Text>
              </div>
            )}
          </Stack>
        </Card>
      )}

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Title order={4}>Systems ({systems.length})</Title>
          {systemsLoading ? (
            <Loader />
          ) : systems.length === 0 ? (
            <Text c="dimmed">No systems yet</Text>
          ) : (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>System</Table.Th>
                  <Table.Th>Type</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {systems.map((sys) => (
                  <Table.Tr key={sys.id}>
                    <Table.Td>{sys.name}</Table.Td>
                    <Table.Td>{sys.type}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Stack>
      </Card>
    </Stack>
  );
}

export function Properties() {
  const { id } = useParams<{ id: string }>();

  if (id) {
    return (
      <Container size="xl" py="xl">
        <PropertyDetail />
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <PropertiesList />
    </Container>
  );
}
