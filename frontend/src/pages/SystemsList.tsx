import { useState, useEffect } from 'react';
import { DataTable } from '../components/DataTable';
import { useSystems } from '../hooks/useApi';
import { db } from '../types/models';
import { Center, Loader, Group, Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

interface SystemsListProps {
  propertyId: string;
  onItemClick: (system: db.System) => void;
  onAddClick?: () => void;
}

export function SystemsList({ propertyId, onItemClick, onAddClick }: SystemsListProps) {
  const { systems, loading } = useSystems(propertyId) as any;
  const [data, setData] = useState<db.System[]>([]);

  useEffect(() => {
    if (systems) {
      setData(systems);
    }
  }, [systems]);

  if (loading) {
    return (
      <Center h={400}>
        <Loader />
      </Center>
    );
  }

  const columns = [
    { key: 'name', label: 'System' },
    { key: 'type', label: 'Type' },
    { key: 'installed', label: 'Installed' },
  ];

  return (
    <div>
      <Group justify="space-between" mb="lg">
        <h3>Systems</h3>
        <Button leftSection={<IconPlus size={16} />} onClick={onAddClick} size="sm">
          Add System
        </Button>
      </Group>
      <DataTable
        tableName={`systems-${propertyId}`}
        columns={columns}
        data={data}
        getRowKey={(item) => item.id?.toString() || ''}
        onRowClick={onItemClick}
      />
    </div>
  );
}
