import { useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SetTab } from '../hooks/useApi';
import { NavigationProvider } from '@trueblocks/scaffold';
import { ProvidersList } from './ProvidersList';
import { ProvidersDetail } from './ProvidersDetail';
import { useServiceProviders } from '../hooks/useApi';
import { db } from '../types/models';
import { Grid } from '@mantine/core';

export function ProvidersPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const itemId = id && id !== 'new' ? parseInt(id, 10) : null;
  const isNew = id === 'new';
  const { providers } = useServiceProviders() as any;
  const hasInitialized = useRef(false);

  // Auto-select first provider when providers load
  useEffect(() => {
    if (providers && providers.length > 0 && !id && !hasInitialized.current) {
      hasInitialized.current = true;
      navigate(`/providers/${providers[0].id}`);
    }
  }, [providers, id, navigate]);

  const handleItemClick = useCallback(
    (item: db.ServiceProvider) => {
      navigate(`/providers/${item.id}`);
    },
    [navigate],
  );

  const handleAddClick = useCallback(() => {
    navigate('/providers/new');
  }, [navigate]);

  useEffect(() => {
    SetTab('providers', 'list');
  }, []);

  const displayId = itemId || isNew ? itemId : (providers?.[0]?.id ? parseInt(providers[0].id, 10) : null);

  return (
    <NavigationProvider>
      <Grid gutter="md" style={{ height: '100%' }}>
        <Grid.Col span={{ base: 12, md: 6 }} style={{ display: 'flex', flexDirection: 'column' }}>
          <ProvidersList onItemClick={handleItemClick} onAddClick={handleAddClick} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }} style={{ display: 'flex', flexDirection: 'column' }}>
          {displayId || isNew ? (
            <ProvidersDetail id={displayId} />
          ) : null}
        </Grid.Col>
      </Grid>
    </NavigationProvider>
  );
}
