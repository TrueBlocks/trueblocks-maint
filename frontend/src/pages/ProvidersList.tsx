import { useState, useEffect } from 'react';
import { DataTable } from '../components/DataTable';
import { useServiceProviders } from '../hooks/useApi';
import { db } from '../types/models';
import { Center, Loader, Group, Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

interface ProvidersListProps {
  onItemClick: (provider: db.ServiceProvider) => void;
}

export function ProvidersList({ onItemClick }: ProvidersListProps) {
  const { providers, loading } = useServiceProviders() as any;
  const [data, setData] = useState<db.ServiceProvider[]>([]);

  useEffect(() => {
    if (providers) {
      setData(providers);
    }
  }, [providers]);

  if (loading) {
    return (
      <Center h={400}>
        <Loader />
      </Center>
    );
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'specialty', label: 'Specialty' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
  ];

  return (
    <div>
      <Group justify="space-between" mb="lg">
        <h2>Service Providers</h2>
        <Button leftSection={<IconPlus size={16} />}>
          Add Provider
        </Button>
      </Group>
      <DataTable
        tableName="providers"
        columns={columns}
        data={data}
        getRowKey={(item) => item.id?.toString() || ''}
        onRowClick={onItemClick}
      />
    </div>
  );
}
