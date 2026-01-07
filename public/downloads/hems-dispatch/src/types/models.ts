export interface Coordinate {
    lat: number;
    lng: number;
}

export interface HemsBase {
    id: string;
    name: string;
    location: string;
    latitude: number;
    longitude: number;
    faa_identifier?: string;
}

export interface Hospital {
    id: string;
    name: string;
    city: string;
    latitude: number;
    longitude: number;
    is_trauma_center?: boolean;
    trauma_level?: number;
}

export interface Mission {
    id?: string;
    mission_id: string;
    user_id?: string;
    mission_type: string;
    hems_base: HemsBase;
    helicopter?: any;
    crew?: any;
    origin: Coordinate;
    destination: Coordinate;
    status: 'pending' | 'active' | 'completed' | 'cancelled';
    created_at?: string;
}