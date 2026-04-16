import { useState, useEffect } from 'react';
import { useProperty } from '../hooks/useApi';
import { db } from '../types/models';
import { Card, Stack, TextInput, Group, Button, Loader, Center } from '@mantine/core';
import { IconCheck, IconTrash } from '@tabler/icons-react';

interface PropertiesDetailProps {
  id: number;
}

export function PropertiesDetail({ id }: PropertiesDetailProps) {
  const { property, loading, save } = useProperty(id.toString()) as any;
  const [formData, setFormData] = useState<db.Property | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (property) {
      setFormData(property);
    }
  }, [property]);

  const handleSave = async () => {
    if (formData) {
      try {
        await save(formData);
        setIsDirty(false);
      } catch (err) {
        console.error('Failed to save:', err);
      }
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this property?')) {
      // TODO: Implement delete
      console.log('Delete property:', id);
    }
  };

  if (loading || !formData) {
    return (
      <Center h={400}>
        <Loader />
      </Center>
    );
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <h2>{formData.name || 'Property Details'}</h2>
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
          <TextInput
            label="Name"
            value={formData.name || ''}
            onChange={(e) => {
              setFormData({ ...formData, name: e.currentTarget.value });
              setIsDirty(true);
            }}
          />
          <TextInput
            label="Address"
            value={formData.address || ''}
            onChange={(e) => {
              setFormData({ ...formData, address: e.currentTarget.value });
              setIsDirty(true);
            }}
          />
          <TextInput
            label="City"
            value={formData.city || ''}
            onChange={(e) => {
              setFormData({ ...formData, city: e.currentTarget.value });
              setIsDirty(true);
            }}
          />
          <TextInput
            label="State"
            value={formData.state || ''}
            onChange={(e) => {
              setFormData({ ...formData, state: e.currentTarget.value });
              setIsDirty(true);
            }}
          />
          <TextInput
            label="Zip"
            value={formData.zip || ''}
            onChange={(e) => {
              setFormData({ ...formData, zip: e.currentTarget.value });
              setIsDirty(true);
            }}
          />
        </Stack>
      </Card>
    </Stack>
  );
}
