export interface TelemetryData {
    latitude: number;
    longitude: number;
    altitude: number;
    heading: number;
    airspeed: number;
    verticalSpeed: number;
    engineRpm: number;
    fuelQuantity: number;
    timestamp: number;
}

export interface BridgeStatus {
    simConnected: boolean;
    cloudConnected: boolean;
    activeMissionId: string | null;
    lastPacketReceived: number;
}
