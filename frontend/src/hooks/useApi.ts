import { useEffect, useState, useCallback } from 'react';
import { db } from '../types/models';
import { useRefresh } from './useRefresh';
import { logger } from '../utils/logger';

// Wails API bindings - imported as any to avoid module resolution issues
const AppAPI: any = (window as any).go?.app?.App || {};


export function useProperties() {
  const [properties, setProperties] = useState<db.Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await AppAPI.GetProperties();
      setProperties(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  // Subscribe to app refresh events
  useRefresh(fetch);

  const save = async (property: db.Property) => {
    try {
      const updated = await AppAPI.SaveProperty(property);
      setProperties((prev) => 
        prev.some((p) => p.id === updated.id) 
          ? prev.map((p) => (p.id === updated.id ? updated : p))
          : [...prev, updated]
      );
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const delete_ = async (id: string) => {
    try {
      await AppAPI.DeleteProperty(id);
      setProperties((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  return { properties, loading, error, save, delete_, refetch: fetch };
}

export function useProperty(id: string | undefined) {
  const [property, setProperty] = useState<db.Property | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetch = async () => {
      setLoading(true);
      try {
        const data = await AppAPI.GetProperty(id);
        setProperty(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [id]);

  const save = async (updated: db.Property) => {
    try {
      const result = await AppAPI.SaveProperty(updated);
      setProperty(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  return { property, loading, error, save };
}

export function useSystems(propertyId?: string) {
  const [systems, setSystems] = useState<db.System[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const data = await AppAPI.GetSystems(id);
      setSystems(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (propertyId) {
      fetch(propertyId);
    }
  }, [propertyId, fetch]);

  // Subscribe to app refresh events
  useRefresh(useCallback(() => {
    if (propertyId) {
      fetch(propertyId);
    }
  }, [propertyId, fetch]));

  const save = async (system: db.System) => {
    try {
      const updated = await AppAPI.SaveSystem(system);
      setSystems((prev) =>
        prev.some((s) => s.id === updated.id)
          ? prev.map((s) => (s.id === updated.id ? updated : s))
          : [...prev, updated]
      );
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const delete_ = async (id: string) => {
    try {
      await AppAPI.DeleteSystem(id);
      setSystems((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  return { systems, loading, error, save, delete_, refetch: () => propertyId && fetch(propertyId) };
}

export function useAllSystems() {
  const [systems, setSystems] = useState<db.System[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    logger.info('useAllSystems: Starting fetch');
    setLoading(true);
    try {
      // Load all properties first, then all systems
      logger.info('useAllSystems: Calling GetProperties');
      const props = await AppAPI.GetProperties();
      logger.info('useAllSystems: GetProperties returned', { count: props?.length || 0, properties: props });
      
      const allSystems: db.System[] = [];
      
      for (const prop of props || []) {
        if (prop.id) {
          logger.info('useAllSystems: Calling GetSystems for property', { propertyId: prop.id, name: prop.name });
          const propSystems = await AppAPI.GetSystems(prop.id);
          logger.info('useAllSystems: GetSystems returned', { propertyId: prop.id, count: propSystems?.length || 0 });
          allSystems.push(...(propSystems || []));
        }
      }
      
      logger.info('useAllSystems: Fetch complete', { totalSystems: allSystems.length });
      setSystems(allSystems);
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      logger.error('useAllSystems: Fetch failed', err);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    logger.info('useAllSystems: useEffect hook running');
    fetch();
  }, [fetch]);

  // Subscribe to app refresh events
  useRefresh(fetch);

  const save = async (system: db.System) => {
    try {
      const updated = await AppAPI.SaveSystem(system);
      setSystems((prev) =>
        prev.some((s) => s.id === updated.id)
          ? prev.map((s) => (s.id === updated.id ? updated : s))
          : [...prev, updated]
      );
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const delete_ = async (id: string) => {
    try {
      await AppAPI.DeleteSystem(id);
      setSystems((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  return { systems, loading, error, save, delete_, refetch: fetch };
}

export function useSystem(id?: string) {
  const [system, setSystem] = useState<db.System | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async (systemId: string) => {
    setLoading(true);
    try {
      const data = await AppAPI.GetSystem(systemId);
      setSystem(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!id) return;
    fetch(id);
  }, [id, fetch]);

  // Subscribe to app refresh events
  useRefresh(useCallback(() => {
    if (id) fetch(id);
  }, [id, fetch]));

  return { system, loading, error };
}

export function useMaintenanceEvents(propertyId?: string) {
  const [events, setEvents] = useState<db.MaintenanceEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const data = await AppAPI.GetMaintenanceEvents(id);
      setEvents(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (propertyId) {
      fetch(propertyId);
    }
  }, [propertyId, fetch]);

  // Subscribe to app refresh events
  useRefresh(useCallback(() => {
    if (propertyId) {
      fetch(propertyId);
    }
  }, [propertyId, fetch]));

  const save = async (event: db.MaintenanceEvent) => {
    try {
      const updated = await AppAPI.SaveMaintenanceEvent(event);
      setEvents((prev) =>
        prev.some((e) => e.id === updated.id)
          ? prev.map((e) => (e.id === updated.id ? updated : e))
          : [...prev, updated]
      );
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const delete_ = async (id: string) => {
    try {
      await AppAPI.DeleteMaintenanceEvent(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  return { events, loading, error, save, delete_, refetch: () => propertyId && fetch(propertyId) };
}

export function useAllMaintenanceEvents() {
  const [events, setEvents] = useState<db.MaintenanceEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { properties } = useProperties();

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const allEvents: db.MaintenanceEvent[] = [];
      for (const prop of (properties || [])) {
        if (prop.id) {
          const propEvents = await AppAPI.GetMaintenanceEvents(prop.id);
          allEvents.push(...(propEvents || []));
        }
      }
      setEvents(allEvents);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [properties]);

  useEffect(() => {
    if (properties && properties.length > 0) {
      fetch();
    }
  }, [properties, fetch]);

  // Subscribe to app refresh events
  useRefresh(fetch);

  const save = async (event: db.MaintenanceEvent) => {
    try {
      const updated = await AppAPI.SaveMaintenanceEvent(event);
      setEvents((prev) =>
        prev.some((e) => e.id === updated.id)
          ? prev.map((e) => (e.id === updated.id ? updated : e))
          : [...prev, updated]
      );
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const delete_ = async (id: string) => {
    try {
      await AppAPI.DeleteMaintenanceEvent(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  return { events, loading, error, save, delete_, refetch: fetch };
}

export function useMaintenanceEvent(id?: string) {
  const [event, setEvent] = useState<db.MaintenanceEvent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetch = async () => {
      setLoading(true);
      try {
        const data = await AppAPI.GetMaintenanceEvent(id);
        setEvent(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [id]);

  return { event, loading, error };
}

export function useServiceProviders() {
  const [providers, setProviders] = useState<db.ServiceProvider[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await AppAPI.GetServiceProviders('');
      setProviders(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  // Subscribe to app refresh events
  useRefresh(fetch);

  const save = async (provider: db.ServiceProvider) => {
    try {
      const updated = await AppAPI.SaveServiceProvider(provider);
      setProviders((prev) =>
        prev.some((p) => p.id === updated.id)
          ? prev.map((p) => (p.id === updated.id ? updated : p))
          : [...prev, updated]
      );
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const delete_ = async (id: string) => {
    try {
      await AppAPI.DeleteServiceProvider(id);
      setProviders((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  return { providers, loading, error, save, delete_, refetch: fetch };
}

export function useServiceProvider(id?: string) {
  const [provider, setProvider] = useState<db.ServiceProvider | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetch = async () => {
      setLoading(true);
      try {
        const data = await AppAPI.GetServiceProvider(id);
        setProvider(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [id]);

  return { provider, loading, error };
}

// State Management Functions (Wails API exports)
export const GetTableState = AppAPI.GetTableState || (() => Promise.resolve({}));
export const SetTableState = AppAPI.SetTableState || (() => Promise.resolve());
export const GetSidebarWidth = AppAPI.GetSidebarWidth || (() => 260);
export const SetSidebarWidth = AppAPI.SetSidebarWidth || (() => {});
export const GetTab = AppAPI.GetTab || (() => '');
export const SetTab = AppAPI.SetTab || (() => {});
export const GetTabRoute = AppAPI.GetTabRoute || (() => '');
export const SetTabRoute = AppAPI.SetTabRoute || (() => {});
export const GetLastRoute = AppAPI.GetLastRoute || (() => '');
export const SaveLastRoute = AppAPI.SaveLastRoute || (() => {});
export const GetWindowGeometry = AppAPI.GetWindowGeometry || (() => Promise.resolve([0, 0, 1100, 750]));
export const SaveWindowGeometry = AppAPI.SaveWindowGeometry || ((x: number, y: number, w: number, h: number) => {});
