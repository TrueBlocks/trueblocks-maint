import { useCallback, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SetTab } from '../hooks/useApi';
import { NavigationProvider } from '@trueblocks/scaffold';
import { MaintenanceList } from './MaintenanceList';
import { MaintenanceDetail } from './MaintenanceDetail';
import { useMaintenanceEvents } from '../hooks/useApi';
import { db } from '../types/models';
import { Tabs } from '@mantine/core';

export function MaintenancePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';
  const hasDetail = !!id;
  const { events } = useMaintenanceEvents() as any;

  const handleItemClick = useCallback(
    (item: db.MaintenanceEvent) => {
      navigate(`/maintenance/${item.id}`);
    },
    [navigate],
  );

  const handleAddClick = useCallback(() => {
    navigate('/maintenance/new');
  }, [navigate]);

  // Determine active tab based on URL
  const activeTab = useMemo(() => {
    if (hasDetail) return 'detail';
    return 'list';
  }, [hasDetail]);

  const handleTabChange = (tabValue: string | null) => {
    if (tabValue === 'list') {
      navigate('/maintenance');
    }
  };

  useEffect(() => {
    SetTab('maintenance', activeTab);
  }, [activeTab]);

  return (
    <NavigationProvider>
      <Tabs value={activeTab} onChange={handleTabChange} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Tabs.List>
          <Tabs.Tab value="list">Events</Tabs.Tab>
          {hasDetail && <Tabs.Tab value="detail">{id === 'new' ? 'New Event' : events?.find((e: db.MaintenanceEvent) => e.id === id)?.description || 'Event'}</Tabs.Tab>}
        </Tabs.List>

        <Tabs.Panel value="list" style={{ flex: 1, overflow: 'auto' }}>
          <MaintenanceList onItemClick={handleItemClick} onAddClick={handleAddClick} />
        </Tabs.Panel>

        {hasDetail && (
          <Tabs.Panel value="detail" style={{ flex: 1, overflow: 'auto' }}>
            <MaintenanceDetail id={id} />
          </Tabs.Panel>
        )}
      </Tabs>
    </NavigationProvider>
  );
}
