export namespace db {
  export interface Property {
    id?: string;
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
  }

  export interface System {
    id?: string;
    propertyID?: string;
    name?: string;
    type?: string;
    model?: string;
    serial?: string;
    age?: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
  }

  export interface MaintenanceEvent {
    id?: string;
    propertyID?: string;
    systemID?: string;
    description?: string;
    type?: string;
    repeat?: string;
    firstDue?: string;
    nextDue?: string;
    notifyDays?: number;
    assignedProviderID?: string;
    estimatedCost?: number;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
  }

  export interface ServiceProvider {
    id?: string;
    name?: string;
    specialty?: string;
    phone?: string;
    email?: string;
    website?: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
  }

  export interface MaintenanceHistoryRec {
    id?: string;
    eventID?: string;
    completedDate?: string;
    completedBy?: string;
    costActual?: number;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
  }

  export interface CompletionResult {
    id?: string;
    nextDue?: string;
  }
}
