import { useState, useEffect } from 'react';
import { useServiceProviders } from '../hooks/useApi';
import { db } from '../types/models';
import { Card, Stack, TextInput, Group, Button, Loader, Center } from '@mantine/core';
import { IconCheck, IconTrash } from '@tabler/icons-react';

interface ProvidersDetailProps {
  id?: number | null;
}

export function ProvidersDetail({ id }: ProvidersDetailProps) {
  const { save } = useServiceProviders();
  const [provider, setProvider] = useState<db.ServiceProvider | null>(null);
  const [loading, setLoading] = useState(id ? true : false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (id) {
      // TODO: Implement GetServiceProvider from backend
      setLoading(false);
      setProvider({
        id: id.toString(),
        name: '',
        specialty: '',
        phone: '',
        email: '',
      });
    } else {
      // New provider - start with blank form
      setProvider({
        id: undefined,
        name: '',
        specialty: '',
        phone: '',
        email: '',
      });
    }
  }, [id]);

  const handleSave = async () => {
    if (provider) {
      try {
        await save(provider);
        setIsDirty(false);
      } catch (err) {
        console.error('Failed to save:', err);
      }
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this provider?')) {
      // TODO: Implement delete
      console.log('Delete provider:', id);
    }
  };

  if ((id && loading) || !provider) {
    return (
      <Center h={400}>
        <Loader />
      </Center>
    );
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <h2>{provider.name || 'Service Provider'}</h2>
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
            value={provider.name || ''}
            onChange={(e) => {
              setProvider({ ...provider, name: e.currentTarget.value });
              setIsDirty(true);
            }}
          />
          <TextInput
            label="Specialty"
            value={provider.specialty || ''}
            onChange={(e) => {
              setProvider({ ...provider, specialty: e.currentTarget.value });
              setIsDirty(true);
            }}
          />
          <TextInput
            label="Phone"
            value={provider.phone || ''}
            onChange={(e) => {
              setProvider({ ...provider, phone: e.currentTarget.value });
              setIsDirty(true);
            }}
          />
          <TextInput
            label="Email"
            type="email"
            value={provider.email || ''}
            onChange={(e) => {
              setProvider({ ...provider, email: e.currentTarget.value });
              setIsDirty(true);
            }}
          />
        </Stack>
      </Card>
    </Stack>
  );
}
