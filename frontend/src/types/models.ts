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
    property_id?: string;
    system_id?: string;
    description?: string;
    type?: string;
    repeat_type?: string;
    repeat_interval_days?: number;
    first_due_date?: string;
    next_due_date?: string;
    last_completed_date?: string;
    completed_count?: number;
    notify_days_before?: number;
    assigned_provider_id?: string;
    estimated_cost?: number;
    notes?: string;
    created_at?: string;
    updated_at?: string;
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
