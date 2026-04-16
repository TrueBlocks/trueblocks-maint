import { useCallback, useEffect, useMemo } from 'react';
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
  const isNew = id === 'new';
  const hasDetail = !!id;
  const { providers } = useServiceProviders() as any;

  const handleItemClick = useCallback(
    (item: db.ServiceProvider) => {
      navigate(`/providers/${item.id}`);
    },
    [navigate],
  );

  const handleAddClick = useCallback(() => {
    navigate('/providers/new');
  }, [navigate]);

  // Determine active tab based on URL
  const activeTab = useMemo(() => {
    if (hasDetail) return 'detail';
    return 'list';
  }, [hasDetail]);

  const handleTabChange = (tabValue: string | null) => {
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
          {hasDetail && <Tabs.Tab value="detail">{id === 'new' ? 'New Provider' : providers?.find((p: db.ServiceProvider) => p.id === id)?.name || 'Provider'}</Tabs.Tab>}
        </Tabs.List>

        <Tabs.Panel value="list" style={{ flex: 1, overflow: 'auto' }}>
          <ProvidersList onItemClick={handleItemClick} onAddClick={handleAddClick} />
        </Tabs.Panel>

        {hasDetail && (
          <Tabs.Panel value="detail" style={{ flex: 1, overflow: 'auto' }}>
            <ProvidersDetail id={id} />
          </Tabs.Panel>
        )}
      </Tabs>
    </NavigationProvider>
  );
}
