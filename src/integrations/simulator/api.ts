import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MissionReport, FlightPhase } from '@/data/hemsData';

// Supabase Project ID: orhfcrrydmgxradibbqb
const BASE_URL = "https://orhfcrrydmgxradibbqb.supabase.co/functions/v1";

interface SimulatorMission extends MissionReport {
    id: string;
}

interface SceneryData {
    image_urls: string[];
    description: string | null;
}

interface TelemetryPayload {
    mission_id: string;
    timeEnrouteMinutes: number;
    fuelRemainingLbs: number;
    latitude: number;
    longitude: number;
    altitudeFt?: number;
    groundSpeedKts?: number;
    headingDeg?: number;
    verticalSpeedFtMin?: number;
    phase?: FlightPhase;
    engineStatus?: 'Running' | 'Idle' | 'Shutdown';
}

const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        throw new Error("User not authenticated.");
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
    };
};

// Helper function to map snake_case database fields to camelCase MissionReport fields
const mapDbToMissionReport = (m: any): SimulatorMission => ({
    id: m.id,
    missionId: m.mission_id,
    callsign: m.callsign,
    type: m.mission_type,
    dateTime: m.created_at,
    hemsBase: m.hems_base,
    helicopter: m.helicopter,
    crew: m.crew,
    origin: m.origin,
    pickup: m.pickup,
    destination: m.destination,
    patientAge: m.patient_age,
    patientGender: m.patient_gender,
    patientWeightLbs: m.patient_weight_lbs,
    patientDetails: m.patient_details,
    medicalResponse: m.medical_response,
    waypoints: m.waypoints,
    liveData: m.live_data,
    tracking: m.tracking || { timeEnrouteMinutes: 0, fuelRemainingLbs: 0, latitude: 0, longitude: 0, phase: 'Dispatch' },
    status: m.status,
});

export const fetchActiveMissionsForSimulator = async (): Promise<SimulatorMission[]> => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${BASE_URL}/fetch-active-missions`, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.missions.map(mapDbToMissionReport) as SimulatorMission[];
    } catch (error) {
        console.error("API Error (fetchActiveMissions):", error);
        toast.error(`Failed to fetch missions for simulator: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return [];
    }
};

export const fetchMissionDetails = async (missionId: string): Promise<any | null> => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${BASE_URL}/get-mission-details`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ mission_id: missionId }),
        });

        if (!response.ok) throw new Error("Failed to fetch mission details.");

        const data = await response.json();
        // Ensure mission data inside context is also mapped correctly
        if (data.mission) {
            data.mission = mapDbToMissionReport(data.mission);
        }
        return data;
    } catch (error) {
        console.error("API Error (fetchMissionDetails):", error);
        return null;
    }
};

export const fetchHospitalSceneryForSimulator = async (hospitalId: string): Promise<SceneryData | null> => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${BASE_URL}/fetch-hospital-scenery`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ hospital_id: hospitalId }),
        });

        if (response.status === 404) return null;
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        return data.scenery as SceneryData;
    } catch (error) {
        console.error("API Error (fetchHospitalScenery):", error);
        return null;
    }
};

export const sendTelemetryUpdate = async (payload: TelemetryPayload): Promise<boolean> => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${BASE_URL}/update-telemetry`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        return true;
    } catch (error) {
        console.error("API Error (sendTelemetryUpdate):", error);
        toast.error(`Failed to send telemetry: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return false;
    }
};