import { useMemo, useCallback, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SetTab, GetTabRoute, SetTabRoute } from '../hooks/useApi';
import { TabView } from '@trueblocks/ui';
import { NavigationProvider } from '@trueblocks/scaffold';
import { MaintenanceList } from './MaintenanceList';
import { MaintenanceDetail } from './MaintenanceDetail';
import { useMaintenanceEvents } from '../hooks/useApi';
import { db } from '../types/models';

export function MaintenancePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const itemId = id ? parseInt(id, 10) : null;
  const { events } = useMaintenanceEvents() as any;

  const handleItemClick = useCallback(
    (item: db.MaintenanceEvent) => {
      navigate(`/maintenance/${item.id}`);
    },
    [navigate],
  );

  const handleTabChange = useCallback(
    (tab: string) => {
      if (tab === 'list') {
        navigate('/maintenance');
      } else if (tab === 'detail') {
        const lastId = GetTabRoute('maintenance-detail') || (events[0]?.id?.toString() || '1');
        navigate(`/maintenance/${lastId}`);
      }
    },
    [navigate, events],
  );

  const activeTab = itemId ? 'detail' : 'list';

  useEffect(() => {
    SetTab('maintenance', activeTab);
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
          <MaintenanceList onItemClick={handleItemClick} />
        )}
        {activeTab === 'detail' && itemId && (
          <MaintenanceDetail id={itemId} />
        )}
      </TabView>
    </NavigationProvider>
  );
}
