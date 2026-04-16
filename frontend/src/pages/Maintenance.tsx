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
  Badge,
  Select,
  Tabs,
} from '@mantine/core';
import { IconPlus, IconEdit, IconTrash, IconCheck } from '@tabler/icons-react';
import { useMaintenanceEvents, useProperties } from '../hooks/useApi';
import { db } from '../types/models';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Wails API bindings
const AppAPI: any = (window as any).go?.app?.App || {};

function MaintenanceList() {
  const { properties } = useProperties();
  const [allEvents, setAllEvents] = useState<db.MaintenanceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<db.MaintenanceEvent>>({});
  const [filter, setFilter] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      try {
        const events: db.MaintenanceEvent[] = [];
        for (const prop of properties) {
          if (prop.id) {
            const propEvents = await AppAPI.GetMaintenanceEvents(prop.id);
            events.push(...(propEvents || []));
          }
        }
        setAllEvents(events);
      } finally {
        setLoading(false);
      }
    };

    if (properties.length > 0) {
      loadEvents();
    }
  }, [properties]);

  const handleOpenModal = (event?: db.MaintenanceEvent) => {
    if (event) {
      setEditingId(event.id || null);
      setFormData(event);
    } else {
      setEditingId(null);
      setFormData({});
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      await AppAPI.SaveMaintenanceEvent(formData as db.MaintenanceEvent);
      setModalOpen(false);
      setFormData({});
      // Reload
      const events: db.MaintenanceEvent[] = [];
      for (const prop of properties) {
        if (prop.id) {
          const propEvents = await AppAPI.GetMaintenanceEvents(prop.id);
          events.push(...(propEvents || []));
        }
      }
      setAllEvents(events);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure?')) {
      try {
        await AppAPI.DeleteMaintenanceEvent(id);
        setAllEvents((prev) => prev.filter((e) => e.id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const getEventStatus = (event: db.MaintenanceEvent) => {
    if (!event.nextDue) return 'unknown';
    const nextDue = new Date(event.nextDue);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (nextDue < today) return 'overdue';
    if (
      nextDue.toDateString() === today.toDateString() ||
      (nextDue.getDate() === today.getDate() && nextDue.getMonth() === today.getMonth())
    )
      return 'today';
    return 'upcoming';
  };

  const filteredEvents = allEvents.filter((e) => {
    if (filter === 'all') return true;
    return getEventStatus(e) === filter;
  });

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
          <Title order={3}>Maintenance Events</Title>
          <Text c="dimmed">Track and manage maintenance across all properties.</Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={() => handleOpenModal()}>
          Add Event
        </Button>
      </Group>

      <Group>
        <Select
          label="Filter"
          value={filter}
          onChange={(val) => setFilter(val || 'all')}
          data={[
            { value: 'all', label: 'All' },
            { value: 'overdue', label: 'Overdue' },
            { value: 'today', label: 'Due Today' },
            { value: 'upcoming', label: 'Upcoming' },
          ]}
          w={150}
        />
      </Group>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Event</Table.Th>
              <Table.Th>Property</Table.Th>
              <Table.Th>Next Due</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filteredEvents.map((event) => {
              const property = properties.find((p) => p.id === event.propertyID);
              const status = getEventStatus(event);
              const statusColors: Record<string, string> = {
                overdue: 'red',
                today: 'orange',
                upcoming: 'blue',
                unknown: 'gray',
              };

              return (
                <Table.Tr key={event.id}>
                  <Table.Td>
                    <Text fw={500}>{event.description}</Text>
                  </Table.Td>
                  <Table.Td>{property?.name || 'Unknown'}</Table.Td>
                  <Table.Td>
                    {event.nextDue ? new Date(event.nextDue).toLocaleDateString() : 'Not set'}
                  </Table.Td>
                  <Table.Td>
                    <Badge color={statusColors[status]}>{status.toUpperCase()}</Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon
                        color="blue"
                        variant="light"
                        onClick={() => navigate(`/maintenance/${event.id}`)}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        color="red"
                        variant="light"
                        onClick={() => handleDelete(event.id || '')}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </Card>

      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title="Add Maintenance Event">
        <Stack gap="md">
          <TextInput
            label="Description"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.currentTarget.value })}
          />
          <Select
            label="Property"
            value={formData.propertyID || ''}
            onChange={(val) => setFormData({ ...formData, propertyID: val || '' })}
            data={properties.map((p) => ({ value: p.id || '', label: p.name || '' }))}
          />
          <TextInput
            label="Next Due Date"
            type="date"
            value={formData.nextDue ? formData.nextDue.split('T')[0] : ''}
            onChange={(e) => setFormData({ ...formData, nextDue: e.currentTarget.value })}
          />
          <TextInput
            label="Repeat"
            value={formData.repeat || ''}
            onChange={(e) => setFormData({ ...formData, repeat: e.currentTarget.value })}
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

function MaintenanceDetail() {
  const { id } = useParams<{ id: string }>();
  const { properties } = useProperties();
  const [event, setEvent] = useState<db.MaintenanceEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<db.MaintenanceEvent | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      if (id) {
        try {
          const data = await AppAPI.GetMaintenanceEvent(id);
          setEvent(data);
          setFormData(data);
        } finally {
          setLoading(false);
        }
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <Center h={400}>
        <Loader />
      </Center>
    );
  }

  if (!event) {
    return <Text>Event not found</Text>;
  }

  const handleSave = async () => {
    if (formData) {
      try {
        await AppAPI.SaveMaintenanceEvent(formData);
        setEditMode(false);
        setEvent(formData);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleComplete = async () => {
    if (event.id) {
      try {
        await AppAPI.CompleteMaintenanceEvent(
          event.id,
          new Date().toISOString().split('T')[0],
          'User',
          '',
          '',
          0,
          ''
        );
        navigate('/maintenance');
      } catch (err) {
        console.error(err);
      }
    }
  };

  const currentData = editMode && formData ? formData : event;
  const property = properties.find((p) => p.id === event.propertyID);

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={3}>{currentData.description}</Title>
          <Text c="dimmed">{property?.name}</Text>
        </div>
        {editMode ? (
          <Group>
            <Button variant="light" onClick={() => setEditMode(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </Group>
        ) : (
          <Group>
            <Button variant="light" onClick={() => {
              setFormData(event);
              setEditMode(true);
            }}>
              Edit
            </Button>
            <Button color="green" onClick={handleComplete} leftSection={<IconCheck size={16} />}>
              Mark Complete
            </Button>
          </Group>
        )}
      </Group>

      {editMode && formData ? (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <TextInput
              label="Description"
              value={formData.description || ''}
              onChange={(e) =>
                setFormData({ ...formData, description: e.currentTarget.value })
              }
            />
            <Select
              label="Property"
              value={formData.propertyID || ''}
              onChange={(val) => setFormData({ ...formData, propertyID: val || '' })}
              data={properties.map((p) => ({ value: p.id || '', label: p.name || '' }))}
            />
            <TextInput
              label="Next Due Date"
              type="date"
              value={formData.nextDue ? formData.nextDue.split('T')[0] : ''}
              onChange={(e) => setFormData({ ...formData, nextDue: e.currentTarget.value })}
            />
            <TextInput
              label="Repeat"
              value={formData.repeat || ''}
              onChange={(e) => setFormData({ ...formData, repeat: e.currentTarget.value })}
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
                Description
              </Text>
              <Text>{currentData.description}</Text>
            </div>
            <div>
              <Text fw={500} size="sm" c="dimmed">
                Property
              </Text>
              <Text>{property?.name}</Text>
            </div>
            <div>
              <Text fw={500} size="sm" c="dimmed">
                Next Due
              </Text>
              <Text>
                {currentData.nextDue ? new Date(currentData.nextDue).toLocaleDateString() : 'Not set'}
              </Text>
            </div>
            <div>
              <Text fw={500} size="sm" c="dimmed">
                Repeat
              </Text>
              <Text>{currentData.repeat || 'Once'}</Text>
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
    </Stack>
  );
}

export function Maintenance() {
  const { id } = useParams<{ id: string }>();

  if (id) {
    return (
      <Container size="xl" py="xl">
        <MaintenanceDetail />
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <MaintenanceList />
    </Container>
  );
}
