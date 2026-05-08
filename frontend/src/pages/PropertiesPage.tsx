import { useCallback, useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SetTab } from '../hooks/useApi';
import { NavigationProvider } from '@trueblocks/scaffold';
import { PropertiesList } from './PropertiesList';
import { PropertiesDetail } from './PropertiesDetail';
import { useProperties } from '../hooks/useApi';
import { db } from '../types/models';
import { Tabs } from '@mantine/core';

export function PropertiesPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [filteredProperties, setFilteredProperties] = useState<db.Property[]>([]);
  const hasInitializedRef = useRef(false);
  
  const isNew = id === 'new';
  const { properties } = useProperties() as any;

  useEffect(() => {
    if (!hasInitializedRef.current && properties) {
      hasInitializedRef.current = true;
      setFilteredProperties(properties);
    }
  }, [properties]);

  const [activeTab, setActiveTab] = useState<string | null>('list');

  const handleItemClick = useCallback(
    (item: db.Property) => {
      navigate(`/properties/${item.id}`);
    },
    [navigate],
  );

  const handleAddClick = useCallback(() => {
    navigate('/properties/new');
  }, [navigate]);

  const handleFilteredDataChange = useCallback((props: db.Property[]) => {
    setFilteredProperties(props);
  }, []);

  const handleTabChange = (tabValue: string | null) => {
    setActiveTab(tabValue);
    if (tabValue === 'list') {
      navigate('/properties');
    }
  };

  useEffect(() => {
    SetTab('properties', activeTab ?? '');
  }, [activeTab]);

  return (
    <NavigationProvider>
      <Tabs value={activeTab} onChange={handleTabChange} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Tabs.List>
          <Tabs.Tab value="list">Properties</Tabs.Tab>
          <Tabs.Tab value="detail">Detail</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="list" style={{ flex: 1, overflow: 'auto' }}>
          <PropertiesList 
            onItemClick={handleItemClick} 
            onAddClick={handleAddClick}
            onFilteredDataChange={handleFilteredDataChange}
          />
        </Tabs.Panel>

        <Tabs.Panel value="detail" style={{ flex: 1, overflow: 'auto' }}>
          <PropertiesDetail id={id} filteredProperties={filteredProperties} />
        </Tabs.Panel>
      </Tabs>
    </NavigationProvider>
  );
}
