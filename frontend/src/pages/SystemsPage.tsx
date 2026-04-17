import { useCallback, useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SetTab } from '../hooks/useApi';
import { NavigationProvider } from '@trueblocks/scaffold';
import { SystemsList } from './SystemsList';
import { SystemsDetail } from './SystemsDetail';
import { useAllSystems } from '../hooks/useApi';
import { db } from '../types/models';
import { Tabs } from '@mantine/core';
import { logger } from '../utils/logger';

export function SystemsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [filteredSystems, setFilteredSystems] = useState<db.System[]>([]);
  const hasInitializedRef = useRef(false);
  
  logger.info('SystemsPage: render', { id });

  const isNew = id === 'new';
  const { systems } = useAllSystems() as any;

  useEffect(() => {
    logger.info('SystemsPage: useEffect - systems data', { count: systems?.length || 0, systems });
    if (!hasInitializedRef.current && systems) {
      hasInitializedRef.current = true;
      setFilteredSystems(systems);
      logger.info('SystemsPage: Initialized filtered systems', { count: systems.length });
    }
  }, [systems]);

  const [activeTab, setActiveTab] = useState<string | null>('list');

  const handleItemClick = useCallback(
    (item: db.System) => {
      logger.info('SystemsPage: Item clicked', { id: item.id, name: item.name });
      navigate(`/systems/${item.id}`);
    },
    [navigate],
  );

  const handleAddClick = useCallback(() => {
    logger.info('SystemsPage: Add clicked');
    navigate('/systems/new');
  }, [navigate]);

  const handleFilteredDataChange = useCallback((syss: db.System[]) => {
    logger.info('SystemsPage: Filtered data changed', { count: syss.length });
    setFilteredSystems(syss);
  }, []);

  const handleTabChange = (tabValue: string | null) => {
    logger.info('SystemsPage: Tab changed', { from: activeTab, to: tabValue });
    setActiveTab(tabValue);
    if (tabValue === 'list') {
      navigate('/systems');
    }
  };

  useEffect(() => {
    logger.info('SystemsPage: Tab state saved', { activeTab });
    SetTab('systems', activeTab);
  }, [activeTab]);

  return (
    <NavigationProvider>
      <Tabs value={activeTab} onChange={handleTabChange} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Tabs.List>
          <Tabs.Tab value="list">Systems</Tabs.Tab>
          <Tabs.Tab value="detail">Detail</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="list" style={{ flex: 1, overflow: 'auto' }}>
          <SystemsList 
            onItemClick={handleItemClick} 
            onAddClick={handleAddClick}
            onFilteredDataChange={handleFilteredDataChange}
          />
        </Tabs.Panel>

        <Tabs.Panel value="detail" style={{ flex: 1, overflow: 'auto' }}>
          <SystemsDetail id={id} filteredSystems={filteredSystems} />
        </Tabs.Panel>
      </Tabs>
    </NavigationProvider>
  );
}
