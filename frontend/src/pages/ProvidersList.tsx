import { useState, useEffect, useCallback } from 'react';
import { DataTable } from '../components/DataTable';
import { useServiceProviders } from '../hooks/useApi';
import { useNavigation } from '@trueblocks/scaffold';
import { db } from '../types/models';
import { Center, Loader, Group, Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

interface ProvidersListProps {
  onItemClick: (provider: db.ServiceProvider) => void;
  onAddClick?: () => void;
  onFilteredDataChange?: (providers: db.ServiceProvider[]) => void;
}

export function ProvidersList({ onItemClick, onAddClick, onFilteredDataChange }: ProvidersListProps) {
  const { providers, loading } = useServiceProviders() as any;
  const { currentId, setCurrentId, setItems } = useNavigation();
  const [data, setData] = useState<db.ServiceProvider[]>([]);

  useEffect(() => {
    if (providers) {
      setData(providers);
    }
  }, [providers]);

  const handleFilteredSortedChange = useCallback(
    (filteredProviders: db.ServiceProvider[]) => {
      onFilteredDataChange?.(filteredProviders);
      const items = filteredProviders.map((p) => ({ id: p.id }));
      const navCurrentId = currentId ?? filteredProviders[0]?.id ?? '';
      if (navCurrentId) {
        setItems('provider', items, parseInt(filteredProviders.findIndex((p) => p.id === navCurrentId).toString()) || 0);
      }
    },
    [onFilteredDataChange, currentId, setItems]
  );

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
        <Button leftSection={<IconPlus size={16} />} onClick={onAddClick}>
          Add Provider
        </Button>
      </Group>
      <DataTable
        tableName="providers"
        columns={columns}
        data={data}
        getRowKey={(item) => item.id?.toString() || ''}
        onRowClick={onItemClick}
        onSelectedChange={(item) => setCurrentId(item.id as any)}
        onFilteredSortedChange={handleFilteredSortedChange}
      />
    </div>
  );
}
