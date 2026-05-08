import { useCallback, useEffect, useState, useRef } from 'react';
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
  const [filteredEvents, setFilteredEvents] = useState<db.MaintenanceEvent[]>([]);
  const hasInitializedRef = useRef(false);
  const isNew = id === 'new';
  const { events } = useMaintenanceEvents() as any;

  useEffect(() => {
    if (!hasInitializedRef.current && events) {
      hasInitializedRef.current = true;
      setFilteredEvents(events);
    }
  }, [events]);

  const [activeTab, setActiveTab] = useState<string | null>('list');

  const handleItemClick = useCallback(
    (item: db.MaintenanceEvent) => {
      navigate(`/maintenance/${item.id}`);
    },
    [navigate],
  );

  const handleAddClick = useCallback(() => {
    navigate('/maintenance/new');
  }, [navigate]);

  const handleFilteredDataChange = useCallback((evts: db.MaintenanceEvent[]) => {
    setFilteredEvents(evts);
  }, []);

  const handleTabChange = (tabValue: string | null) => {
    setActiveTab(tabValue);
    if (tabValue === 'list') {
      navigate('/maintenance');
    }
  };

  useEffect(() => {
    SetTab('maintenance', activeTab ?? '');
  }, [activeTab]);

  return (
    <NavigationProvider>
      <Tabs value={activeTab} onChange={handleTabChange} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Tabs.List>
          <Tabs.Tab value="list">Events</Tabs.Tab>
          <Tabs.Tab value="detail">Detail</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="list" style={{ flex: 1, overflow: 'auto' }}>
          <MaintenanceList 
            onItemClick={handleItemClick} 
            onAddClick={handleAddClick}
            onFilteredDataChange={handleFilteredDataChange}
          />
        </Tabs.Panel>

        <Tabs.Panel value="detail" style={{ flex: 1, overflow: 'auto' }}>
          <MaintenanceDetail id={id} filteredEvents={filteredEvents} />
        </Tabs.Panel>
      </Tabs>
    </NavigationProvider>
  );
}
