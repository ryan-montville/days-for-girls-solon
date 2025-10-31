export interface Event {
    eventId: number;
    eventTitle: string;
    eventDate: Date;
    eventLocation: string;
    eventTime: string;
    eventDescription: string;
    numberAttending: number;
}

export interface SignUpEntry {
    entryId: number;
    eventId: number;
    fullName: string;
    email: string;
    comments?: string;
}

export interface ComponentItem {
    componentId: number;
    componentType: string;
    quantity: number;
}

export interface InventoryEntry {
    entryId: number;
    entryDate: Date;
    componentType: string;
    quantity: number;
    whoDonated?: string;
    destination?: string;
}

export interface ContactEntry {
    contactId: number;
    fullName: string;
    email: string;
    volunteerType: string;
    phone?: number;
}

export interface ComponentSummary {
    componentType: string;
    quantityDonated: number;
    quantityDistributed: number;
}
