import { useCallback, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SetTab } from '../hooks/useApi';
import { NavigationProvider } from '@trueblocks/scaffold';
import { PropertiesList } from './PropertiesList';
import { PropertiesDetail } from './PropertiesDetail';
import { SystemsDetail } from './SystemsDetail';
import { useProperties } from '../hooks/useApi';
import { db } from '../types/models';
import { Tabs } from '@mantine/core';

export function PropertiesPage() {
  const { id, propertyId, systemId } = useParams<{ id: string; propertyId: string; systemId: string }>();
  const navigate = useNavigate();
  
  // Handle both /properties/:id and /properties/:propertyId/systems/:systemId routes
  const currentPropertyId = propertyId || id;
  const isSystemView = !!systemId;
  const isNew = currentPropertyId === 'new';
  const hasDetail = !!currentPropertyId;
  const { properties } = useProperties() as any;

  const handleItemClick = useCallback(
    (item: db.Property) => {
      navigate(`/properties/${item.id}`);
    },
    [navigate],
  );

  const handleAddClick = useCallback(() => {
    navigate('/properties/new');
  }, [navigate]);

  // Determine active tab based on URL
  const activeTab = useMemo(() => {
    if (hasDetail) return 'detail';
    return 'list';
  }, [hasDetail]);

  const handleTabChange = (tabValue: string | null) => {
    if (tabValue === 'list') {
      navigate('/properties');
    }
  };

  useEffect(() => {
    SetTab('properties', activeTab);
  }, [activeTab]);

  const getDetailTabLabel = () => {
    if (isSystemView) {
      return systemId;
    }
    if (isNew) {
      return 'New Property';
    }
    return properties?.find((p: db.Property) => p.id === currentPropertyId)?.name || 'Property';
  };

  return (
    <NavigationProvider>
      <Tabs value={activeTab} onChange={handleTabChange} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Tabs.List>
          <Tabs.Tab value="list">Properties</Tabs.Tab>
          {hasDetail && <Tabs.Tab value="detail">{getDetailTabLabel()}</Tabs.Tab>}
        </Tabs.List>

        <Tabs.Panel value="list" style={{ flex: 1, overflow: 'auto' }}>
          <PropertiesList onItemClick={handleItemClick} onAddClick={handleAddClick} />
        </Tabs.Panel>

        {hasDetail && (
          <Tabs.Panel value="detail" style={{ flex: 1, overflow: 'auto' }}>
            {isSystemView && currentPropertyId && systemId ? (
              <SystemsDetail propertyId={currentPropertyId} id={systemId} />
            ) : (
              <PropertiesDetail id={currentPropertyId} />
            )}
          </Tabs.Panel>
        )}
      </Tabs>
    </NavigationProvider>
  );
}
