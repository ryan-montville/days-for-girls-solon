import { Timestamp } from "firebase/firestore";

export interface ComponentItem {
    componentId: string;
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
    entryId: string;
    entryDate: Timestamp;
    componentType: string;
    quantity: number;
    whoDonated?: string;
    destination?: string;
}

export interface SignUpEntry {
    entryId: string;
    eventId: string;
    fullName: string;
    email: string;
    comments?: string;
}

export interface DonatePageContent {
    content: string;
    lastUpdated: Timestamp;
}