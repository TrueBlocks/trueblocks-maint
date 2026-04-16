import { GetTableState, SetTableState } from "@/hooks/useApi";
import { createDataTable } from "@trueblocks/ui";
import type { PersistTableState } from "@trueblocks/ui";

export type { Column, DataTableProps } from "@trueblocks/ui";
export type { SortDirection, SortColumn, ViewSort } from "@trueblocks/ui";

// Wire up state persistence for DataTable
export const DataTable = createDataTable(
  (name) => GetTableState(name) as Promise<Partial<PersistTableState>>,
  (name, s) => SetTableState(name, s as Parameters<typeof SetTableState>[1]),
);
