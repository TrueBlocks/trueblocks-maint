import { useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SetTab } from '../hooks/useApi';
import { NavigationProvider } from '@trueblocks/scaffold';
import { MaintenanceList } from './MaintenanceList';
import { MaintenanceDetail } from './MaintenanceDetail';
import { useMaintenanceEvents } from '../hooks/useApi';
import { db } from '../types/models';
import { Grid } from '@mantine/core';

export function MaintenancePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const itemId = id && id !== 'new' ? id : null;
  const isNew = id === 'new';
  const { events } = useMaintenanceEvents() as any;
  const hasInitialized = useRef(false);

  // Auto-select first event when events load
  useEffect(() => {
    if (events && events.length > 0 && !id && !hasInitialized.current) {
      hasInitialized.current = true;
      navigate(`/maintenance/${events[0].id}`);
    }
  }, [events, id, navigate]);

  const handleItemClick = useCallback(
    (item: db.MaintenanceEvent) => {
      navigate(`/maintenance/${item.id}`);
    },
    [navigate],
  );

  const handleAddClick = useCallback(() => {
    navigate('/maintenance/new');
  }, [navigate]);

  useEffect(() => {
    SetTab('maintenance', 'list');
  }, []);

  const displayId = itemId || isNew ? itemId : events?.[0]?.id;

  return (
    <NavigationProvider>
      <Grid gutter="md" style={{ height: '100%' }}>
        <Grid.Col span={{ base: 12, md: 6 }} style={{ display: 'flex', flexDirection: 'column' }}>
          <MaintenanceList onItemClick={handleItemClick} onAddClick={handleAddClick} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }} style={{ display: 'flex', flexDirection: 'column' }}>
          {displayId || isNew ? (
            <MaintenanceDetail id={displayId} />
          ) : null}
        </Grid.Col>
      </Grid>
    </NavigationProvider>
  );
}
