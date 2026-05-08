import { useMemo } from 'react';
import {
  makeEntityHooks,
  makeChildEntityHooks,
  useAggregatedList,
  type UseListResult,
} from '@trueblocks/scaffold';
import { db } from '../types/models';
import { useRefresh } from './useRefresh';
import * as WailsApp from '../../wailsjs/go/app/App';

// The generated bindings declare model fields as required, while the local
// `db` types use optional fields. We adapt at this single boundary so the
// rest of the code can stay on the local (optional) shapes without `any`.
interface MaintApi {
  GetProperties: () => Promise<db.Property[]>;
  GetProperty: (id: string) => Promise<db.Property>;
  SaveProperty: (p: db.Property) => Promise<db.Property>;
  DeleteProperty: (id: string) => Promise<void>;

  GetSystems: (propertyId: string) => Promise<db.System[]>;
  GetSystem: (id: string) => Promise<db.System>;
  SaveSystem: (s: db.System) => Promise<db.System>;
  DeleteSystem: (id: string) => Promise<void>;

  GetMaintenanceEvents: (propertyId: string) => Promise<db.MaintenanceEvent[]>;
  GetMaintenanceEvent: (id: string) => Promise<db.MaintenanceEvent>;
  SaveMaintenanceEvent: (e: db.MaintenanceEvent) => Promise<db.MaintenanceEvent>;
  DeleteMaintenanceEvent: (id: string) => Promise<void>;

  GetServiceProviders: (filter: string) => Promise<db.ServiceProvider[]>;
  GetServiceProvider: (id: string) => Promise<db.ServiceProvider>;
  SaveServiceProvider: (p: db.ServiceProvider) => Promise<db.ServiceProvider>;
  DeleteServiceProvider: (id: string) => Promise<void>;
}
const App = WailsApp as unknown as MaintApi;

const Properties = makeEntityHooks<db.Property>({
  getAll: App.GetProperties,
  getOne: App.GetProperty,
  save: App.SaveProperty,
  delete: App.DeleteProperty,
  getId: (p) => p.id,
  useRefresh,
});

const Systems = makeChildEntityHooks<db.System, string>({
  getAll: App.GetSystems,
  getOne: App.GetSystem,
  save: App.SaveSystem,
  delete: App.DeleteSystem,
  getId: (s) => s.id,
  useRefresh,
});

const MaintenanceEvents = makeChildEntityHooks<db.MaintenanceEvent, string>({
  getAll: App.GetMaintenanceEvents,
  getOne: App.GetMaintenanceEvent,
  save: App.SaveMaintenanceEvent,
  delete: App.DeleteMaintenanceEvent,
  getId: (e) => e.id,
  useRefresh,
});

const ServiceProviders = makeEntityHooks<db.ServiceProvider>({
  getAll: () => App.GetServiceProviders(''),
  getOne: App.GetServiceProvider,
  save: App.SaveServiceProvider,
  delete: App.DeleteServiceProvider,
  getId: (p) => p.id,
  useRefresh,
});

// --- Properties -----------------------------------------------------------

export function useProperties() {
  const r = Properties.useList();
  return {
    properties: r.items,
    loading: r.loading,
    error: r.error,
    save: r.save,
    delete_: r.delete_,
    refetch: r.refetch,
  };
}

export function useProperty(id: string | undefined) {
  const r = Properties.useOne(id);
  return { property: r.item, loading: r.loading, error: r.error, save: r.save };
}

// --- Systems --------------------------------------------------------------

export function useSystems(propertyId?: string) {
  const r = Systems.useList(propertyId);
  return {
    systems: r.items,
    loading: r.loading,
    error: r.error,
    save: r.save,
    delete_: r.delete_,
    refetch: r.refetch,
  };
}

export function useSystem(id?: string) {
  const r = Systems.useOne(id);
  return { system: r.item, loading: r.loading, error: r.error };
}

export function useAllSystems() {
  const { properties } = useProperties();
  const propertyIds = useMemo(
    () => (properties ?? []).map((p) => p.id).filter((id): id is string => Boolean(id)),
    [properties]
  );
  const enabled = propertyIds.length > 0;

  const fetchAll = useMemo(
    () => async (): Promise<db.System[]> => {
      const all: db.System[] = [];
      for (const pid of propertyIds) {
        const list = await App.GetSystems(pid);
        if (list) all.push(...list);
      }
      return all;
    },
    [propertyIds]
  );

  const r: UseListResult<db.System> = useAggregatedList<db.System>({
    fetchAll,
    save: App.SaveSystem,
    delete: App.DeleteSystem,
    getId: (s) => s.id,
    enabled,
    useRefresh,
  });

  return {
    systems: r.items,
    loading: r.loading,
    error: r.error,
    save: r.save,
    delete_: r.delete_,
    refetch: r.refetch,
  };
}

// --- Maintenance events ---------------------------------------------------

export function useMaintenanceEvents(propertyId?: string) {
  const r = MaintenanceEvents.useList(propertyId);
  return {
    events: r.items,
    loading: r.loading,
    error: r.error,
    save: r.save,
    delete_: r.delete_,
    refetch: r.refetch,
  };
}

export function useMaintenanceEvent(id?: string) {
  const r = MaintenanceEvents.useOne(id);
  return { event: r.item, loading: r.loading, error: r.error };
}

export function useAllMaintenanceEvents() {
  const { properties } = useProperties();
  const propertyIds = useMemo(
    () => (properties ?? []).map((p) => p.id).filter((id): id is string => Boolean(id)),
    [properties]
  );
  const enabled = propertyIds.length > 0;

  const fetchAll = useMemo(
    () => async (): Promise<db.MaintenanceEvent[]> => {
      const all: db.MaintenanceEvent[] = [];
      for (const pid of propertyIds) {
        const list = await App.GetMaintenanceEvents(pid);
        if (list) all.push(...list);
      }
      return all;
    },
    [propertyIds]
  );

  const r = useAggregatedList<db.MaintenanceEvent>({
    fetchAll,
    save: App.SaveMaintenanceEvent,
    delete: App.DeleteMaintenanceEvent,
    getId: (e) => e.id,
    enabled,
    useRefresh,
  });

  return {
    events: r.items,
    loading: r.loading,
    error: r.error,
    save: r.save,
    delete_: r.delete_,
    refetch: r.refetch,
  };
}

// --- Service providers ----------------------------------------------------

export function useServiceProviders() {
  const r = ServiceProviders.useList();
  return {
    providers: r.items,
    loading: r.loading,
    error: r.error,
    save: r.save,
    delete_: r.delete_,
    refetch: r.refetch,
  };
}

export function useServiceProvider(id?: string) {
  const r = ServiceProviders.useOne(id);
  return { provider: r.item, loading: r.loading, error: r.error };
}

// --- Wails state passthrough (typed) -------------------------------------

export {
  GetTableState,
  SetTableState,
  GetSidebarWidth,
  SetSidebarWidth,
  GetTab,
  SetTab,
  GetTabRoute,
  SetTabRoute,
  GetLastRoute,
  SaveLastRoute,
  SaveWindowGeometry,
} from '../../wailsjs/go/app/App';

