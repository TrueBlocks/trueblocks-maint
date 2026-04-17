import { useState, useEffect, useCallback } from 'react';
import { DataTable } from '../components/DataTable';
import { useProperties } from '../hooks/useApi';
import { useNavigation } from '@trueblocks/scaffold';
import { db } from '../types/models';
import { Center, Loader, Group, Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

interface PropertiesListProps {
  onItemClick: (property: db.Property) => void;
  onAddClick?: () => void;
  onFilteredDataChange?: (properties: db.Property[]) => void;
}

export function PropertiesList({ onItemClick, onAddClick, onFilteredDataChange }: PropertiesListProps) {
  const { properties, loading } = useProperties() as any;
  const { currentId, setCurrentId, setItems } = useNavigation();
  const [data, setData] = useState<db.Property[]>([]);

  useEffect(() => {
    if (properties) {
      setData(properties);
    }
  }, [properties]);

  const handleFilteredSortedChange = useCallback(
    (filteredProps: db.Property[]) => {
      onFilteredDataChange?.(filteredProps);
      const items = filteredProps.map((p) => ({ id: p.id }));
      const navCurrentId = currentId ?? filteredProps[0]?.id ?? '';
      if (navCurrentId) {
        setItems('property', items, parseInt(filteredProps.findIndex((p) => p.id === navCurrentId).toString()) || 0);
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
  ];

  return (
    <div>
      <Group justify="space-between" mb="lg">
        <h3 style={{ margin: 0 }}>Properties</h3>
        <Button leftSection={<IconPlus size={16} />} onClick={onAddClick} size="sm">
          Add
        </Button>
      </Group>
      <DataTable
        tableName="properties"
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
