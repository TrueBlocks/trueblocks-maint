import { useState, useEffect } from 'react';
import { DataTable } from '../components/DataTable';
import { useAllMaintenanceEvents } from '../hooks/useApi';
import { db } from '../types/models';
import { Center, Loader, Group, Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

interface MaintenanceListProps {
  onItemClick: (event: db.MaintenanceEvent) => void;
  onAddClick?: () => void;
}

export function MaintenanceList({ onItemClick, onAddClick }: MaintenanceListProps) {
  const { events, loading } = useAllMaintenanceEvents();
  const [data, setData] = useState<db.MaintenanceEvent[]>([]);

  useEffect(() => {
    if (events) {
      setData(events);
    }
  }, [events]);

  if (loading) {
    return (
      <Center h={400}>
        <Loader />
      </Center>
    );
  }

  const columns = [
    { key: 'description', label: 'Description' },
    { key: 'next_due_date', label: 'Next Due' },
    { key: 'estimated_cost', label: 'Estimated Cost' },
  ];

  return (
    <div>
      <Group justify="space-between" mb="lg">
        <h2>Maintenance Events</h2>
        <Button leftSection={<IconPlus size={16} />} onClick={onAddClick}>
          Add Event
        </Button>
      </Group>
      <DataTable
        tableName="maintenance-events"
        columns={columns}
        data={data}
        getRowKey={(item) => item.id?.toString() || ''}
        onRowClick={onItemClick}
      />
    </div>
  );
}
