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
} from '@mantine/core';
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import { useServiceProviders } from '../hooks/useApi';
import { db } from '../types/models';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Wails API bindings
const AppAPI: any = (window as any).go?.app?.App || {};

function ProvidersList() {
  const { providers, loading, save, delete: deleteProvider } = useServiceProviders() as any;
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<db.ServiceProvider>>({});

  const handleOpenModal = (provider?: db.ServiceProvider) => {
    if (provider) {
      setEditingId(provider.id || null);
      setFormData(provider);
    } else {
      setEditingId(null);
      setFormData({});
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      await save(formData as db.ServiceProvider);
      setModalOpen(false);
      setFormData({});
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure?')) {
      try {
        await deleteProvider(id);
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
          <Title order={3}>Service Providers</Title>
          <Text c="dimmed">Manage service providers and contractors.</Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={() => handleOpenModal()}>
          Add Provider
        </Button>
      </Group>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Provider</Table.Th>
              <Table.Th>Specialty</Table.Th>
              <Table.Th>Phone</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {providers.map((provider: db.ServiceProvider) => (
              <Table.Tr key={provider.id}>
                <Table.Td>
                  <Text fw={500}>{provider.name}</Text>
                </Table.Td>
                <Table.Td>{provider.specialty}</Table.Td>
                <Table.Td>{provider.phone}</Table.Td>
                <Table.Td>{provider.email}</Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon
                      color="blue"
                      variant="light"
                      onClick={() => navigate(`/providers/${provider.id}`)}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      color="red"
                      variant="light"
                      onClick={() => handleDelete(provider.id || '')}
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

      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title="Add Service Provider">
        <Stack gap="md">
          <TextInput
            label="Name"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.currentTarget.value })}
          />
          <TextInput
            label="Specialty"
            value={formData.specialty || ''}
            onChange={(e) => setFormData({ ...formData, specialty: e.currentTarget.value })}
          />
          <TextInput
            label="Phone"
            value={formData.phone || ''}
            onChange={(e) => setFormData({ ...formData, phone: e.currentTarget.value })}
          />
          <TextInput
            label="Email"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.currentTarget.value })}
          />
          <TextInput
            label="Website"
            value={formData.website || ''}
            onChange={(e) => setFormData({ ...formData, website: e.currentTarget.value })}
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

function ProviderDetail() {
  const { id } = useParams<{ id: string }>();
  const [provider, setProvider] = useState<db.ServiceProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<db.ServiceProvider | null>(null);
  const navigate = useNavigate();

  useState(() => {
    const load = async () => {
      if (id) {
        try {
          const data = await AppAPI.GetServiceProvider(id);
          setProvider(data);
          setFormData(data);
        } finally {
          setLoading(false);
        }
      }
    };
    load();
  });

  if (loading) {
    return (
      <Center h={400}>
        <Loader />
      </Center>
    );
  }

  if (!provider) {
    return <Text>Provider not found</Text>;
  }

  const handleSave = async () => {
    if (formData) {
      try {
        await AppAPI.SaveServiceProvider(formData);
        setEditMode(false);
        setProvider(formData);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const currentData = editMode && formData ? formData : provider;

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={3}>{currentData.name}</Title>
          <Text c="dimmed">{currentData.specialty}</Text>
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
            setFormData(provider);
            setEditMode(true);
          }}>
            Edit
          </Button>
        )}
      </Group>

      {editMode && formData ? (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <TextInput
              label="Name"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.currentTarget.value })}
            />
            <TextInput
              label="Specialty"
              value={formData.specialty || ''}
              onChange={(e) => setFormData({ ...formData, specialty: e.currentTarget.value })}
            />
            <TextInput
              label="Phone"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.currentTarget.value })}
            />
            <TextInput
              label="Email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.currentTarget.value })}
            />
            <TextInput
              label="Website"
              value={formData.website || ''}
              onChange={(e) => setFormData({ ...formData, website: e.currentTarget.value })}
            />
            <Textarea
              label="Notes"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.currentTarget.value })}
            />
          </Stack>
        </Card>
      ) : (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <div>
              <Text fw={500} size="sm" c="dimmed">
                Specialty
              </Text>
              <Text>{currentData.specialty}</Text>
            </div>
            <div>
              <Text fw={500} size="sm" c="dimmed">
                Phone
              </Text>
              <Text>{currentData.phone}</Text>
            </div>
            <div>
              <Text fw={500} size="sm" c="dimmed">
                Email
              </Text>
              <Text>{currentData.email}</Text>
            </div>
            {currentData.website && (
              <div>
                <Text fw={500} size="sm" c="dimmed">
                  Website
                </Text>
                <Text>{currentData.website}</Text>
              </div>
            )}
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
    </Stack>
  );
}

export function Providers() {
  const { id } = useParams<{ id: string }>();

  if (id) {
    return (
      <Container size="xl" py="xl">
        <ProviderDetail />
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <ProvidersList />
    </Container>
  );
}
