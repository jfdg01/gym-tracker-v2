import { TrackingType, ResistanceType } from './types';

export interface Exercise {
    id: string; // UUID
    name: string;
    description: string | null;
    category: string | null;
    defaultTrackingType: TrackingType;
    defaultResistanceType: ResistanceType;
    isArchived: boolean;
    createdAt: string;
    updatedAt: string;
}
