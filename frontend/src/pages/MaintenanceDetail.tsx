import { useState, useEffect } from 'react';
import { db } from '../types/models';
import { Card, Stack, TextInput, Group, Button, Loader, Center, Textarea, NumberInput, Select } from '@mantine/core';
import { IconCheck, IconTrash } from '@tabler/icons-react';

interface MaintenanceDetailProps {
  id: number;
}

export function MaintenanceDetail({ id }: MaintenanceDetailProps) {
  const [event, setEvent] = useState<db.MaintenanceEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    // TODO: Implement GetMaintenanceEvent from backend
    setLoading(false);
    setEvent({
      id: id.toString(),
      description: '',
      type: '',
      firstDue: new Date().toISOString(),
      nextDue: new Date().toISOString(),
      estimatedCost: 0,
    });
  }, [id]);

  const handleSave = async () => {
    if (event) {
      try {
        // TODO: Call save API
        setIsDirty(false);
      } catch (err) {
        console.error('Failed to save:', err);
      }
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this event?')) {
      // TODO: Implement delete
      console.log('Delete event:', id);
    }
  };

  if (loading || !event) {
    return (
      <Center h={400}>
        <Loader />
      </Center>
    );
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <h2>Maintenance Event</h2>
        <Group gap="xs">
          <Button
            leftSection={<IconCheck size={16} />}
            onClick={handleSave}
            disabled={!isDirty}
          >
            Save
          </Button>
          <Button
            color="red"
            variant="light"
            leftSection={<IconTrash size={16} />}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </Group>
      </Group>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Textarea
            label="Description"
            value={event.description || ''}
            onChange={(e) => {
              setEvent({ ...event, description: e.currentTarget.value });
              setIsDirty(true);
            }}
          />
          <Select
            label="Type"
            placeholder="Select maintenance type"
            data={['Routine', 'Repair', 'Emergency', 'Upgrade']}
            value={event.type || ''}
            onChange={(value) => {
              setEvent({ ...event, type: value || '' });
              setIsDirty(true);
            }}
          />
          <TextInput
            label="First Due"
            type="date"
            value={event.firstDue?.split('T')[0] || ''}
            onChange={(e) => {
              setEvent({ ...event, firstDue: e.currentTarget.value });
              setIsDirty(true);
            }}
          />
          <TextInput
            label="Next Due"
            type="date"
            value={event.nextDue?.split('T')[0] || ''}
            onChange={(e) => {
              setEvent({ ...event, nextDue: e.currentTarget.value });
              setIsDirty(true);
            }}
          />
          <NumberInput
            label="Estimated Cost"
            value={event.estimatedCost || 0}
            onChange={(value) => {
              setEvent({ ...event, estimatedCost: Number(value) });
              setIsDirty(true);
            }}
          />
          <Textarea
            label="Notes"
            value={event.notes || ''}
            onChange={(e) => {
              setEvent({ ...event, notes: e.currentTarget.value });
              setIsDirty(true);
            }}
          />
        </Stack>
      </Card>
    </Stack>
  );
}
