export namespace appkit {
	
	export class RangeFilter {
	    min?: number;
	    max?: number;
	
	    static createFrom(source: any = {}) {
	        return new RangeFilter(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.min = source["min"];
	        this.max = source["max"];
	    }
	}
	export class SortColumn {
	    column: string;
	    direction: string;
	
	    static createFrom(source: any = {}) {
	        return new SortColumn(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.column = source["column"];
	        this.direction = source["direction"];
	    }
	}
	export class ViewSort {
	    primary: SortColumn;
	    secondary: SortColumn;
	    tertiary: SortColumn;
	    quaternary: SortColumn;
	
	    static createFrom(source: any = {}) {
	        return new ViewSort(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.primary = this.convertValues(source["primary"], SortColumn);
	        this.secondary = this.convertValues(source["secondary"], SortColumn);
	        this.tertiary = this.convertValues(source["tertiary"], SortColumn);
	        this.quaternary = this.convertValues(source["quaternary"], SortColumn);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class TableState {
	    search?: string;
	    sort?: ViewSort;
	    page?: number;
	    pageSize?: number;
	    filters?: Record<string, Array<string>>;
	    rangeFilters?: Record<string, RangeFilter>;
	    selectedIndex?: number;
	
	    static createFrom(source: any = {}) {
	        return new TableState(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.search = source["search"];
	        this.sort = this.convertValues(source["sort"], ViewSort);
	        this.page = source["page"];
	        this.pageSize = source["pageSize"];
	        this.filters = source["filters"];
	        this.rangeFilters = this.convertValues(source["rangeFilters"], RangeFilter, true);
	        this.selectedIndex = source["selectedIndex"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace db {
	
	export class MaintenanceHistoryRec {
	    id: string;
	    propertyId: string;
	    eventId: string;
	    completedDate: string;
	    completedBy: string;
	    notes: string;
	    costActual: number;
	    providerId: string;
	    createdAt: string;
	
	    static createFrom(source: any = {}) {
	        return new MaintenanceHistoryRec(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.propertyId = source["propertyId"];
	        this.eventId = source["eventId"];
	        this.completedDate = source["completedDate"];
	        this.completedBy = source["completedBy"];
	        this.notes = source["notes"];
	        this.costActual = source["costActual"];
	        this.providerId = source["providerId"];
	        this.createdAt = source["createdAt"];
	    }
	}
	export class MaintenanceEvent {
	    id: string;
	    property_id: string;
	    system_id: string;
	    description: string;
	    type: string;
	    repeat_type: string;
	    repeat_interval_days: number;
	    first_due_date: string;
	    next_due_date: string;
	    last_completed_date?: string;
	    completed_count: number;
	    notify_days_before: number;
	    assigned_provider_id?: string;
	    estimated_cost: number;
	    notes: string;
	    created_at: string;
	    updated_at: string;
	
	    static createFrom(source: any = {}) {
	        return new MaintenanceEvent(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.property_id = source["property_id"];
	        this.system_id = source["system_id"];
	        this.description = source["description"];
	        this.type = source["type"];
	        this.repeat_type = source["repeat_type"];
	        this.repeat_interval_days = source["repeat_interval_days"];
	        this.first_due_date = source["first_due_date"];
	        this.next_due_date = source["next_due_date"];
	        this.last_completed_date = source["last_completed_date"];
	        this.completed_count = source["completed_count"];
	        this.notify_days_before = source["notify_days_before"];
	        this.assigned_provider_id = source["assigned_provider_id"];
	        this.estimated_cost = source["estimated_cost"];
	        this.notes = source["notes"];
	        this.created_at = source["created_at"];
	        this.updated_at = source["updated_at"];
	    }
	}
	export class CompletionResult {
	    event: MaintenanceEvent;
	    record: MaintenanceHistoryRec;
	
	    static createFrom(source: any = {}) {
	        return new CompletionResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.event = this.convertValues(source["event"], MaintenanceEvent);
	        this.record = this.convertValues(source["record"], MaintenanceHistoryRec);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	
	export class Property {
	    id: string;
	    name: string;
	    address: string;
	    city: string;
	    state: string;
	    zip: string;
	    notes: string;
	    createdAt: string;
	    updatedAt: string;
	
	    static createFrom(source: any = {}) {
	        return new Property(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.address = source["address"];
	        this.city = source["city"];
	        this.state = source["state"];
	        this.zip = source["zip"];
	        this.notes = source["notes"];
	        this.createdAt = source["createdAt"];
	        this.updatedAt = source["updatedAt"];
	    }
	}
	export class ServiceProvider {
	    id: string;
	    propertyID: string;
	    name: string;
	    specialty: string;
	    phone: string;
	    email: string;
	    website: string;
	    notes: string;
	    createdAt: string;
	    updatedAt: string;
	
	    static createFrom(source: any = {}) {
	        return new ServiceProvider(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.propertyID = source["propertyID"];
	        this.name = source["name"];
	        this.specialty = source["specialty"];
	        this.phone = source["phone"];
	        this.email = source["email"];
	        this.website = source["website"];
	        this.notes = source["notes"];
	        this.createdAt = source["createdAt"];
	        this.updatedAt = source["updatedAt"];
	    }
	}
	export class System {
	    id: string;
	    propertyID: string;
	    name: string;
	    type: string;
	    model: string;
	    serial: string;
	    age: number;
	    notes: string;
	    createdAt: string;
	    updatedAt: string;
	
	    static createFrom(source: any = {}) {
	        return new System(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.propertyID = source["propertyID"];
	        this.name = source["name"];
	        this.type = source["type"];
	        this.model = source["model"];
	        this.serial = source["serial"];
	        this.age = source["age"];
	        this.notes = source["notes"];
	        this.createdAt = source["createdAt"];
	        this.updatedAt = source["updatedAt"];
	    }
	}

}

