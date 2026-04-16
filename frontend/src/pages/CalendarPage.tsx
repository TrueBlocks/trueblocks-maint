import { useState, useEffect, useMemo } from 'react';
import { useProperties, useMaintenanceEvents } from '../hooks/useApi';
import { db } from '../types/models';
import { Group, Stack, Button, MultiSelect, SegmentedControl, Card, Badge, Text, Center, Loader, SimpleGrid } from '@mantine/core';
import { IconCalendar, IconList } from '@tabler/icons-react';
import dayjs from 'dayjs';

type ViewMode = 'calendar' | 'list';
type FilterMode = 'all' | 'single' | 'multiple';

export function CalendarPage() {
  const { properties } = useProperties() as any;
  const { events } = useMaintenanceEvents() as any;
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);

  // Initialize with all properties selected
  useEffect(() => {
    if (properties && properties.length > 0 && selectedProperties.length === 0) {
      setSelectedProperties(properties.map((p: db.Property) => p.id!));
      setLoading(false);
    }
  }, [properties, selectedProperties.length]);

  // Filter events based on selected properties
  const filteredEvents = useMemo(() => {
    if (!events) return [];
    
    const propsToFilter = filterMode === 'all' ? properties?.map((p: db.Property) => p.id!) : selectedProperties;
    
    return events.filter((event: db.MaintenanceEvent) => propsToFilter.includes(event.propertyID || ''));
  }, [events, selectedProperties, filterMode, properties]);

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter((event: db.MaintenanceEvent) => {
      const eventDate = event.nextDue ? new Date(event.nextDue) : null;
      if (!eventDate) return false;
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const propertyOptions = (properties || []).map((p: db.Property) => ({
    value: p.id!,
    label: p.name || 'Unnamed Property',
  }));

  const selectedPropertyNames = useMemo(() => {
    if (filterMode === 'all') return ['All Properties'];
    return selectedProperties
      .map((id) => properties?.find((p: db.Property) => p.id === id)?.name)
      .filter(Boolean);
  }, [selectedProperties, filterMode, properties]);

  // Generate calendar days for current month
  const generateCalendarDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const calendarDays = generateCalendarDays(selectedDate);

  if (!properties || loading) {
    return (
      <Center h={400}>
        <Loader />
      </Center>
    );
  }

  return (
    <Stack gap="lg" style={{ height: '100%' }}>
      {/* Controls */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Group gap="md" style={{ flex: 1 }}>
              <SegmentedControl
                value={filterMode}
                onChange={(value) => {
                  setFilterMode(value as FilterMode);
                  if (value === 'single' && selectedProperties.length === 0 && properties.length > 0) {
                    setSelectedProperties([properties[0].id!]);
                  }
                }}
                data={[
                  { label: 'All Properties', value: 'all' },
                  { label: 'Single', value: 'single' },
                  { label: 'Multiple', value: 'multiple' },
                ]}
              />
            </Group>
            <SegmentedControl
              value={viewMode}
              onChange={(value) => setViewMode(value as ViewMode)}
              data={[
                { label: 'Calendar', value: 'calendar' },
                { label: 'List', value: 'list' },
              ]}
            />
          </Group>

          {/* Property Filter */}
          {filterMode !== 'all' && (
            <div>
              {filterMode === 'single' ? (
                <SegmentedControl
                  value={selectedProperties[0] || ''}
                  onChange={(value) => setSelectedProperties([value])}
                  data={propertyOptions}
                  fullWidth
                  size="sm"
                />
              ) : (
                <MultiSelect
                  label="Select Properties"
                  placeholder="Choose properties to display"
                  data={propertyOptions}
                  value={selectedProperties}
                  onChange={setSelectedProperties}
                  searchable
                  clearable
                />
              )}
            </div>
          )}

          {/* Summary */}
          <Group gap="xs">
            <Text size="sm" fw={500}>
              Viewing:
            </Text>
            {selectedPropertyNames.map((name) => (
              <Badge key={name} variant="light">
                {name}
              </Badge>
            ))}
            <Badge variant="dot" color="gray">
              {filteredEvents.length} events
            </Badge>
          </Group>
        </Stack>
      </Card>

      {/* Calendar or List View */}
      {viewMode === 'calendar' ? (
        <Group align="flex-start" grow>
          {/* Calendar */}
          <Card shadow="sm" padding="lg" radius="md" withBorder style={{ flex: 1 }}>
            <Stack gap="md">
              <Group justify="space-between">
                <Text fw={500} size="lg">
                  {dayjs(selectedDate).format('MMMM YYYY')}
                </Text>
                <Group gap="xs">
                  <Button
                    variant="subtle"
                    onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
                    size="xs"
                  >
                    ← Prev
                  </Button>
                  <Button
                    variant="subtle"
                    onClick={() => setSelectedDate(new Date())}
                    size="xs"
                  >
                    Today
                  </Button>
                  <Button
                    variant="subtle"
                    onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
                    size="xs"
                  >
                    Next →
                  </Button>
                </Group>
              </Group>

              {/* Day headers */}
              <SimpleGrid cols={7} spacing="xs">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <Text key={day} fw={600} ta="center" size="sm">
                    {day}
                  </Text>
                ))}
              </SimpleGrid>

              {/* Calendar grid */}
              <SimpleGrid cols={7} spacing="xs">
                {calendarDays.map((date, idx) => {
                  const eventsOnDay = date ? getEventsForDate(date) : [];
                  const isSelected =
                    date &&
                    date.getDate() === selectedDate.getDate() &&
                    date.getMonth() === selectedDate.getMonth() &&
                    date.getFullYear() === selectedDate.getFullYear();
                  const isCurrentMonth = date && date.getMonth() === selectedDate.getMonth();

                  return (
                    <Card
                      key={idx}
                      padding="xs"
                      radius="md"
                      withBorder
                      style={{
                        minHeight: '80px',
                        backgroundColor: isSelected ? '#e0f2fe' : isCurrentMonth ? '#ffffff' : '#f9fafb',
                        cursor: date ? 'pointer' : 'default',
                        opacity: isCurrentMonth ? 1 : 0.5,
                      }}
                      onClick={() => date && setSelectedDate(date)}
                    >
                      <Stack gap="4px">
                        <Text size="sm" fw={isCurrentMonth ? 500 : 400}>
                          {date ? date.getDate() : ''}
                        </Text>
                        {eventsOnDay.length > 0 && (
                          <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap' }}>
                            {eventsOnDay.slice(0, 2).map((event: db.MaintenanceEvent, idx: number) => (
                              <Badge key={idx} size="xs" variant="filled" color="blue">
                                {event.type?.substring(0, 3)}
                              </Badge>
                            ))}
                            {eventsOnDay.length > 2 && (
                              <Badge size="xs" variant="light">
                                +{eventsOnDay.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </Stack>
                    </Card>
                  );
                })}
              </SimpleGrid>
            </Stack>
          </Card>

          {/* Events for selected date */}
          <Card shadow="sm" padding="lg" radius="md" withBorder style={{ flex: 1 }}>
            <Stack gap="md">
              <Text fw={500} size="lg">
                {dayjs(selectedDate).format('MMMM D, YYYY')}
              </Text>
              {getEventsForDate(selectedDate).length > 0 ? (
                getEventsForDate(selectedDate).map((event: db.MaintenanceEvent) => (
                  <Card key={event.id} padding="md" radius="md" withBorder style={{ backgroundColor: '#f9fafb' }}>
                    <Stack gap="xs">
                      <Group justify="space-between">
                        <Text fw={500}>{event.description}</Text>
                        <Badge>{event.type}</Badge>
                      </Group>
                      <Text size="sm" c="dimmed">
                        Property: {properties?.find((p: db.Property) => p.id === event.propertyID)?.name}
                      </Text>
                      {event.estimatedCost && (
                        <Text size="sm">
                          Estimated Cost: ${event.estimatedCost.toFixed(2)}
                        </Text>
                      )}
                    </Stack>
                  </Card>
                ))
              ) : (
                <Text c="dimmed" ta="center" py="xl">
                  No events scheduled
                </Text>
              )}
            </Stack>
          </Card>
        </Group>
      ) : (
        /* List View */
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            {filteredEvents.length > 0 ? (
              filteredEvents
                .sort((a: db.MaintenanceEvent, b: db.MaintenanceEvent) => {
                  const dateA = a.nextDue ? new Date(a.nextDue).getTime() : Infinity;
                  const dateB = b.nextDue ? new Date(b.nextDue).getTime() : Infinity;
                  return dateA - dateB;
                })
                .map((event: db.MaintenanceEvent, idx: number) => (
                  <Card key={event.id} padding="md" radius="md" withBorder style={{ backgroundColor: '#f9fafb' }}>
                    <Group justify="space-between">
                      <Stack gap="xs" style={{ flex: 1 }}>
                        <Group justify="space-between">
                          <Text fw={500}>{event.description}</Text>
                          <Badge>{event.type}</Badge>
                        </Group>
                        <Group gap="lg">
                          <Text size="sm" c="dimmed">
                            Property: {properties?.find((p: db.Property) => p.id === event.propertyID)?.name}
                          </Text>
                          {event.nextDue && (
                            <Text size="sm" c="dimmed">
                              Due: {dayjs(event.nextDue).format('MMM D, YYYY')}
                            </Text>
                          )}
                          {event.estimatedCost && (
                            <Text size="sm">Cost: ${event.estimatedCost.toFixed(2)}</Text>
                          )}
                        </Group>
                      </Stack>
                    </Group>
                  </Card>
                ))
            ) : (
              <Text c="dimmed" ta="center" py="xl">
                No events found
              </Text>
            )}
          </Stack>
        </Card>
      )}
    </Stack>
  );
}
