import { useState, useEffect, useCallback } from 'react';
import { DataTable } from '../components/DataTable';
import { useNavigation } from '@trueblocks/scaffold';
import { db } from '../types/models';
import { Center, Loader, Group, Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

interface SystemsListProps {
  onItemClick: (system: db.System) => void;
  onAddClick?: () => void;
  onFilteredDataChange?: (systems: db.System[]) => void;
  systems?: db.System[];
}

export function SystemsList({ onItemClick, onAddClick, onFilteredDataChange, systems: externalSystems }: SystemsListProps) {
  const { currentId, setCurrentId, setItems } = useNavigation();
  const [data, setData] = useState<db.System[]>([]);

  useEffect(() => {
    if (externalSystems) {
      setData(externalSystems);
    }
  }, [externalSystems]);

  const handleFilteredSortedChange = useCallback(
    (filteredSystems: db.System[]) => {
      onFilteredDataChange?.(filteredSystems);
      const items = filteredSystems.map((s) => ({ id: s.id }));
      const navCurrentId = currentId ?? filteredSystems[0]?.id ?? '';
      if (navCurrentId) {
        setItems('system', items, parseInt(filteredSystems.findIndex((s) => s.id === navCurrentId).toString()) || 0);
      }
    },
    [onFilteredDataChange, currentId, setItems]
  );

  if (!externalSystems) {
    return (
      <Center h={400}>
        <Loader />
      </Center>
    );
  }

  const columns = [
    { key: 'name', label: 'System' },
    { key: 'type', label: 'Type' },
    { key: 'model', label: 'Model' },
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
        tableName="systems"
        columns={columns}
        data={data}
        getRowKey={(item) => item.id?.toString() || ''}
        onRowClick={(item) => onItemClick(item as db.System)}
        onSelectedChange={(item) => setCurrentId((item as db.System).id as any)}
        onFilteredSortedChange={handleFilteredSortedChange}
      />
    </div>
  );
}
