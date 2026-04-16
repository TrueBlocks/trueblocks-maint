import { useState, useEffect } from 'react';
import { DataTable } from '../components/DataTable';
import { useProperties } from '../hooks/useApi';
import { db } from '../types/models';
import { Center, Loader, Group, Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

interface PropertiesListProps {
  onItemClick: (property: db.Property) => void;
  onAddClick?: () => void;
}

export function PropertiesList({ onItemClick, onAddClick }: PropertiesListProps) {
  const { properties, loading } = useProperties() as any;
  const [data, setData] = useState<db.Property[]>([]);

  useEffect(() => {
    if (properties) {
      setData(properties);
    }
  }, [properties]);

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
      />
    </div>
  );
}
