import { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SetTab, GetTabRoute, SetTabRoute } from '../hooks/useApi';
import { TabView } from '@trueblocks/ui';
import { NavigationProvider } from '@trueblocks/scaffold';
import { PropertiesList } from './PropertiesList';
import { PropertiesDetail } from './PropertiesDetail';
import { useProperties } from '../hooks/useApi';
import { db } from '../types/models';

export function PropertiesPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const itemId = id && id !== 'new' ? parseInt(id, 10) : null;
  const isNew = id === 'new';
  const { properties } = useProperties() as any;
  const hasInitialized = useRef(false);

  const handleItemClick = useCallback(
    (item: db.Property) => {
      navigate(`/properties/${item.id}`);
    },
    [navigate],
  );

  const handleAddClick = useCallback(() => {
    // Navigate to detail with a special "new" marker
    navigate('/properties/new');
  }, [navigate]);

  const handleTabChange = useCallback(
    (tab: string) => {
      if (tab === 'list') {
        navigate('/properties');
      } else if (tab === 'detail') {
        const lastId = GetTabRoute('properties-detail') || (properties[0]?.id?.toString() || '1');
        navigate(`/properties/${lastId}`);
      }
    },
    [navigate, properties],
  );

  const activeTab = itemId || isNew ? 'detail' : 'list';

  useEffect(() => {
    SetTab('properties', activeTab);
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
          <PropertiesList onItemClick={handleItemClick} onAddClick={handleAddClick} />
        )}
        {activeTab === 'detail' && (itemId || isNew) && (
          <PropertiesDetail id={itemId} />
        )}
      </TabView>
    </NavigationProvider>
  );
}
