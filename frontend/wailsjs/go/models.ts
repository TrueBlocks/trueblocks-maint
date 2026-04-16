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
	    propertyId: string;
	    systemId: string;
	    description: string;
	    type: string;
	    repeatType: string;
	    repeatIntervalDays: number;
	    firstDueDate: string;
	    nextDueDate: string;
	    lastCompletedDate: string;
	    completedCount: number;
	    notifyDaysBefore: number;
	    assignedProviderId: string;
	    estimatedCost: number;
	    notes: string;
	    createdAt: string;
	    updatedAt: string;
	
	    static createFrom(source: any = {}) {
	        return new MaintenanceEvent(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.propertyId = source["propertyId"];
	        this.systemId = source["systemId"];
	        this.description = source["description"];
	        this.type = source["type"];
	        this.repeatType = source["repeatType"];
	        this.repeatIntervalDays = source["repeatIntervalDays"];
	        this.firstDueDate = source["firstDueDate"];
	        this.nextDueDate = source["nextDueDate"];
	        this.lastCompletedDate = source["lastCompletedDate"];
	        this.completedCount = source["completedCount"];
	        this.notifyDaysBefore = source["notifyDaysBefore"];
	        this.assignedProviderId = source["assignedProviderId"];
	        this.estimatedCost = source["estimatedCost"];
	        this.notes = source["notes"];
	        this.createdAt = source["createdAt"];
	        this.updatedAt = source["updatedAt"];
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
	    propertyId: string;
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
	        this.propertyId = source["propertyId"];
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
	    propertyId: string;
	    name: string;
	    type: string;
	    model: string;
	    serial: string;
	    ageYears: number;
	    notes: string;
	    createdAt: string;
	    updatedAt: string;
	
	    static createFrom(source: any = {}) {
	        return new System(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.propertyId = source["propertyId"];
	        this.name = source["name"];
	        this.type = source["type"];
	        this.model = source["model"];
	        this.serial = source["serial"];
	        this.ageYears = source["ageYears"];
	        this.notes = source["notes"];
	        this.createdAt = source["createdAt"];
	        this.updatedAt = source["updatedAt"];
	    }
	}

}

