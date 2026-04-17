import { useEffect, useState } from 'react';
import { db } from '../types/models';

// Wails API bindings - imported as any to avoid module resolution issues
const AppAPI: any = (window as any).go?.app?.App || {};


export function useProperties() {
  const [properties, setProperties] = useState<db.Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = async () => {
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
  };

  useEffect(() => {
    fetch();
  }, []);

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

  const fetch = async (id: string) => {
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
  };

  useEffect(() => {
    if (propertyId) {
      fetch(propertyId);
    }
  }, [propertyId]);

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

export function useSystem(id?: string) {
  const [system, setSystem] = useState<db.System | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetch = async () => {
      setLoading(true);
      try {
        const data = await AppAPI.GetSystem(id);
        setSystem(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [id]);

  return { system, loading, error };
}

export function useMaintenanceEvents(propertyId?: string) {
  const [events, setEvents] = useState<db.MaintenanceEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = async (id: string) => {
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
  };

  useEffect(() => {
    if (propertyId) {
      fetch(propertyId);
    }
  }, [propertyId]);

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

  useEffect(() => {
    const fetchAllEvents = async () => {
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
    };

    if (properties && properties.length > 0) {
      fetchAllEvents();
    }
  }, [properties]);

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

  return { events, loading, error, save, delete_ };
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

  const fetch = async () => {
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
  };

  useEffect(() => {
    fetch();
  }, []);

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
