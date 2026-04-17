import { Container, Title, Text, Card, Group, Stack, Grid, Table, Badge, Alert, Loader, Center, Tabs } from '@mantine/core';
import { IconAlertCircle, IconCheck, IconClock } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useProperties } from '../hooks/useApi.js';
import { db } from '../types/models';
import { useState, useEffect } from 'react';

// Wails API bindings
const AppAPI: any = (window as any).go?.app?.App || {};

export function Dashboard() {
  const navigate = useNavigate();
  const { properties, loading: propsLoading } = useProperties();
  const [allEvents, setAllEvents] = useState<db.MaintenanceEvent[]>([]);
  const [eventLoading, setEventLoading] = useState(false);

  useEffect(() => {
    const loadEvents = async () => {
      setEventLoading(true);
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
        setEventLoading(false);
      }
    };

    if (properties.length > 0) {
      loadEvents();
    }
  }, [properties]);

  const overdueEvents = allEvents.filter((e) => {
    if (!e.next_due_date) return false;
    const next_due_date = new Date(e.next_due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return next_due_date < today;
  });

  const dueSoonEvents = allEvents.filter((e) => {
    if (!e.next_due_date) return false;
    const next_due_date = new Date(e.next_due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return next_due_date >= today && next_due_date <= nextMonth;
  });

  const upcomingEvents = allEvents.filter((e) => {
    if (!e.next_due_date) return false;
    const next_due_date = new Date(e.next_due_date);
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return next_due_date > nextMonth;
  });

  if (propsLoading || eventLoading) {
    return (
      <Center h={400}>
        <Loader />
      </Center>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <div>
          <Title>Dashboard</Title>
          <Text c="dimmed">At-a-glance overview of your properties and maintenance schedule.</Text>
        </div>

        {/* Property Summary Stats */}
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <Card 
              shadow="sm" 
              padding="lg" 
              radius="md" 
              withBorder
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/properties')}
            >
              <Stack gap="xs">
                <Text fw={500} c="dimmed" size="sm">
                  Total Properties
                </Text>
                <Text size="xl" fw={700}>
                  {properties.length}
                </Text>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <Card 
              shadow="sm" 
              padding="lg" 
              radius="md" 
              withBorder
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/systems')}
            >
              <Stack gap="xs">
                <Text fw={500} c="dimmed" size="sm">
                  Total Systems
                </Text>
                <Text size="xl" fw={700}>
                  {allEvents.length}
                </Text>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <Card 
              shadow="sm" 
              padding="lg" 
              radius="md" 
              withBorder 
              bg="red.0"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/properties')}
            >
              <Stack gap="xs">
                <Text fw={500} c="red" size="sm">
                  Properties Needing Attention
                </Text>
                <Text size="xl" fw={700} c="red">
                  {new Set(overdueEvents.map((e) => e.property_id)).size}
                </Text>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Quick Stats - Events by Status */}
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <Card 
              shadow="sm" 
              padding="lg" 
              radius="md" 
              withBorder 
              bg="red.0"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/maintenance')}
            >
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text fw={500} c="red" size="sm">
                    Overdue Events
                  </Text>
                  <IconAlertCircle size={20} style={{ color: 'red' }} />
                </Group>
                <Text size="xl" fw={700}>
                  {overdueEvents.length}
                </Text>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <Card 
              shadow="sm" 
              padding="lg" 
              radius="md" 
              withBorder 
              bg="orange.0"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/maintenance')}
            >
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text fw={500} c="orange" size="sm">
                    Due This Month
                  </Text>
                  <IconClock size={20} style={{ color: 'orange' }} />
                </Group>
                <Text size="xl" fw={700}>
                  {dueSoonEvents.length}
                </Text>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <Card 
              shadow="sm" 
              padding="lg" 
              radius="md" 
              withBorder 
              bg="blue.0"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/maintenance')}
            >
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text fw={500} c="blue" size="sm">
                    Upcoming This Month
                  </Text>
                  <IconCheck size={20} style={{ color: 'blue' }} />
                </Group>
                <Text size="xl" fw={700}>
                  {upcomingEvents.length}
                </Text>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Overdue Maintenance Table */}
        {overdueEvents.length > 0 && (
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack gap="md">
              <Title order={3}>Overdue Maintenance Events</Title>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Event</Table.Th>
                    <Table.Th>Property</Table.Th>
                    <Table.Th>Due Date</Table.Th>
                    <Table.Th>Overdue By</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {overdueEvents.map((event) => {
                    const next_due_date = new Date(event.next_due_date || '');
                    const today = new Date();
                    const daysOverdue = Math.floor(
                      (today.getTime() - next_due_date.getTime()) / (1000 * 60 * 60 * 24)
                    );
                    const property = properties.find((p) => p.id === event.property_id);

                    return (
                      <Table.Tr 
                        key={event.id}
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/maintenance/${event.id}`)}
                      >
                        <Table.Td>
                          <Group gap="xs">
                            <Badge color="red" variant="light">
                              ⚠
                            </Badge>
                            <Text fw={500}>{event.description}</Text>
                          </Group>
                        </Table.Td>
                        <Table.Td>{property?.name || 'Unknown'}</Table.Td>
                        <Table.Td>{next_due_date.toLocaleDateString()}</Table.Td>
                        <Table.Td>
                          <Text c="red" fw={500}>
                            {daysOverdue} days
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </Stack>
          </Card>
        )}

        {overdueEvents.length === 0 && (
          <Alert icon={<IconCheck />} title="All Caught Up!" color="green">
            You have no overdue maintenance events. Great job!
          </Alert>
        )}
      </Stack>
    </Container>
  );
}
