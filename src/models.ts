import { Timestamp } from "firebase/firestore";

export interface ComponentItem {
    componentId: number;
    componentType: string;
    quantity: number;
}

export interface ComponentSummary {
    componentType: string;
    quantityDonated: number;
    quantityDistributed: number;
}

export interface Event {
    eventId: string;
    eventTitle: string;
    eventDate: Timestamp;
    eventLocation: string;
    eventTime: string;
    eventDescription: string;
    numberAttending: number;
}

export interface InventoryEntry {
    entryId: number;
    entryDate: Timestamp;
    componentType: string;
    quantity: number;
    whoDonated?: string;
    destination?: string;
}

export interface SignUpEntry {
    entryId: number;
    eventId: number;
    fullName: string;
    email: string;
    comments?: string;
}