import { useState, useEffect, useCallback } from 'react';
import { DataTable } from '../components/DataTable';
import { useAllMaintenanceEvents } from '../hooks/useApi';
import { useNavigation } from '@trueblocks/scaffold';
import { db } from '../types/models';
import { Center, Loader, Group, Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

interface MaintenanceListProps {
  onItemClick: (event: db.MaintenanceEvent) => void;
  onAddClick?: () => void;
  onFilteredDataChange?: (events: db.MaintenanceEvent[]) => void;
}

export function MaintenanceList({ onItemClick, onAddClick, onFilteredDataChange }: MaintenanceListProps) {
  const { events, loading } = useAllMaintenanceEvents();
  const { currentId, setCurrentId, setItems } = useNavigation();
  const [data, setData] = useState<db.MaintenanceEvent[]>([]);

  useEffect(() => {
    if (events) {
      setData(events);
    }
  }, [events]);

  const handleFilteredSortedChange = useCallback(
    (filteredEvents: db.MaintenanceEvent[]) => {
      onFilteredDataChange?.(filteredEvents);
      const items = filteredEvents.map((e) => ({ id: e.id }));
      const navCurrentId = currentId ?? filteredEvents[0]?.id ?? '';
      if (navCurrentId) {
        setItems('event', items, parseInt(filteredEvents.findIndex((e) => e.id === navCurrentId).toString()) || 0);
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
        onSelectedChange={(item) => setCurrentId(item.id as any)}
        onFilteredSortedChange={handleFilteredSortedChange}
      />
    </div>
  );
}
