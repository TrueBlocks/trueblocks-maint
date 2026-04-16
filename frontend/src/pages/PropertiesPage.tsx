import { useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SetTab } from '../hooks/useApi';
import { NavigationProvider } from '@trueblocks/scaffold';
import { PropertiesList } from './PropertiesList';
import { PropertiesDetail } from './PropertiesDetail';
import { useProperties } from '../hooks/useApi';
import { db } from '../types/models';
import { Grid } from '@mantine/core';

export function PropertiesPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const itemId = id && id !== 'new' ? parseInt(id, 10) : null;
  const isNew = id === 'new';
  const { properties } = useProperties() as any;
  const hasInitialized = useRef(false);

  // Auto-select first property when properties load
  useEffect(() => {
    if (properties && properties.length > 0 && !id && !hasInitialized.current) {
      hasInitialized.current = true;
      navigate(`/properties/${properties[0].id}`);
    }
  }, [properties, id, navigate]);

  const handleItemClick = useCallback(
    (item: db.Property) => {
      navigate(`/properties/${item.id}`);
    },
    [navigate],
  );

  const handleAddClick = useCallback(() => {
    navigate('/properties/new');
  }, [navigate]);

  useEffect(() => {
    SetTab('properties', 'list');
  }, []);

  const displayId = itemId || isNew ? itemId : (properties?.[0]?.id ? parseInt(properties[0].id, 10) : null);

  return (
    <NavigationProvider>
      <Grid gutter="md" style={{ height: '100%' }}>
        <Grid.Col span={{ base: 12, md: 6 }} style={{ display: 'flex', flexDirection: 'column' }}>
          <PropertiesList onItemClick={handleItemClick} onAddClick={handleAddClick} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }} style={{ display: 'flex', flexDirection: 'column' }}>
          {displayId || isNew ? (
            <PropertiesDetail id={displayId} />
          ) : null}
        </Grid.Col>
      </Grid>
    </NavigationProvider>
  );
}
