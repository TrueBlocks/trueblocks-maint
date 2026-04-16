import { useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SetTab } from '../hooks/useApi';
import { NavigationProvider } from '@trueblocks/scaffold';
import { PropertiesList } from './PropertiesList';
import { PropertiesDetail } from './PropertiesDetail';
import { SystemsDetail } from './SystemsDetail';
import { useProperties } from '../hooks/useApi';
import { db } from '../types/models';
import { Grid } from '@mantine/core';

export function PropertiesPage() {
  const { id, propertyId, systemId } = useParams<{ id: string; propertyId: string; systemId: string }>();
  const navigate = useNavigate();
  
  // Handle both direct /properties/:id and nested /properties/:propertyId/systems/:systemId routes
  const currentPropertyId = propertyId || id;
  const isSystemView = !!systemId;
  
  const itemId = currentPropertyId && currentPropertyId !== 'new' ? currentPropertyId : null;
  const isNew = currentPropertyId === 'new';
  const { properties } = useProperties() as any;
  const hasInitialized = useRef(false);

  // Auto-select first property when properties load
  useEffect(() => {
    if (properties && properties.length > 0 && !currentPropertyId && !hasInitialized.current) {
      hasInitialized.current = true;
      navigate(`/properties/${properties[0].id}`);
    }
  }, [properties, currentPropertyId, navigate]);

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

  const displayId = isNew ? 'new' : (itemId || properties?.[0]?.id);

  return (
    <NavigationProvider>
      <Grid gutter="md" style={{ height: '100%' }}>
        <Grid.Col span={{ base: 12, md: 6 }} style={{ display: 'flex', flexDirection: 'column' }}>
          <PropertiesList onItemClick={handleItemClick} onAddClick={handleAddClick} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }} style={{ display: 'flex', flexDirection: 'column' }}>
          {isSystemView && currentPropertyId && systemId ? (
            <SystemsDetail propertyId={currentPropertyId} id={systemId} />
          ) : displayId || isNew ? (
            <PropertiesDetail id={displayId} />
          ) : null}
        </Grid.Col>
      </Grid>
    </NavigationProvider>
  );
}
