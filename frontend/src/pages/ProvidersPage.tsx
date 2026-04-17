import { useCallback, useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SetTab } from '../hooks/useApi';
import { NavigationProvider } from '@trueblocks/scaffold';
import { ProvidersList } from './ProvidersList';
import { ProvidersDetail } from './ProvidersDetail';
import { useServiceProviders } from '../hooks/useApi';
import { db } from '../types/models';
import { Tabs } from '@mantine/core';

export function ProvidersPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [filteredProviders, setFilteredProviders] = useState<db.ServiceProvider[]>([]);
  const hasInitializedRef = useRef(false);
  const isNew = id === 'new';
  const { providers } = useServiceProviders() as any;

  useEffect(() => {
    if (!hasInitializedRef.current && providers) {
      hasInitializedRef.current = true;
      setFilteredProviders(providers);
    }
  }, [providers]);

  const [activeTab, setActiveTab] = useState<string | null>('list');

  const handleItemClick = useCallback(
    (item: db.ServiceProvider) => {
      navigate(`/providers/${item.id}`);
    },
    [navigate],
  );

  const handleAddClick = useCallback(() => {
    navigate('/providers/new');
  }, [navigate]);

  const handleFilteredDataChange = useCallback((provs: db.ServiceProvider[]) => {
    setFilteredProviders(provs);
  }, []);

  const handleTabChange = (tabValue: string | null) => {
    setActiveTab(tabValue);
    if (tabValue === 'list') {
      navigate('/providers');
    }
  };

  useEffect(() => {
    SetTab('providers', activeTab);
  }, [activeTab]);

  return (
    <NavigationProvider>
      <Tabs value={activeTab} onChange={handleTabChange} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Tabs.List>
          <Tabs.Tab value="list">Providers</Tabs.Tab>
          <Tabs.Tab value="detail">Detail</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="list" style={{ flex: 1, overflow: 'auto' }}>
          <ProvidersList 
            onItemClick={handleItemClick} 
            onAddClick={handleAddClick}
            onFilteredDataChange={handleFilteredDataChange}
          />
        </Tabs.Panel>

        <Tabs.Panel value="detail" style={{ flex: 1, overflow: 'auto' }}>
          <ProvidersDetail id={id} filteredProviders={filteredProviders} />
        </Tabs.Panel>
      </Tabs>
    </NavigationProvider>
  );
}
