import { useState, useEffect } from 'react';
import { DataTable } from '../components/DataTable';
import { useProperties } from '../hooks/useApi';
import { db } from '../types/models';
import { Center, Loader, Group, Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

interface PropertiesListProps {
  onItemClick: (property: db.Property) => void;
}

export function PropertiesList({ onItemClick }: PropertiesListProps) {
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
    { key: 'address', label: 'Address' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
  ];

  return (
    <div>
      <Group justify="space-between" mb="lg">
        <h2>Properties</h2>
        <Button leftSection={<IconPlus size={16} />}>
          Add Property
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
