import { useCallback, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SetTab, GetTabRoute, SetTabRoute } from '../hooks/useApi';
import { TabView } from '@trueblocks/ui';
import { NavigationProvider } from '@trueblocks/scaffold';
import { ProvidersList } from './ProvidersList';
import { ProvidersDetail } from './ProvidersDetail';
import { useServiceProviders } from '../hooks/useApi';
import { db } from '../types/models';

export function ProvidersPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const itemId = id ? parseInt(id, 10) : null;
  const { providers } = useServiceProviders() as any;

  const handleItemClick = useCallback(
    (item: db.ServiceProvider) => {
      navigate(`/providers/${item.id}`);
    },
    [navigate],
  );

  const handleTabChange = useCallback(
    (tab: string) => {
      if (tab === 'list') {
        navigate('/providers');
      } else if (tab === 'detail') {
        const lastId = GetTabRoute('providers-detail') || (providers[0]?.id?.toString() || '1');
        navigate(`/providers/${lastId}`);
      }
    },
    [navigate, providers],
  );

  const activeTab = itemId ? 'detail' : 'list';

  useEffect(() => {
    SetTab('providers', activeTab);
  }, [activeTab]);

  const tabs = [
    { label: 'List', value: 'list' },
    { label: 'Detail', value: 'detail' },
  ];

  return (
    <NavigationProvider>
      <TabView
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      >
        {activeTab === 'list' && (
          <ProvidersList onItemClick={handleItemClick} />
        )}
        {activeTab === 'detail' && itemId && (
          <ProvidersDetail id={itemId} />
        )}
      </TabView>
    </NavigationProvider>
  );
}
