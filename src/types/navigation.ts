export type NavMode = 'DRONE_SKYWAY' | 'GROUND_VEHICLE' | 'GLOBAL_OSINT';

export type CameraMode = 'QUARTER_VIEW' | 'DRIVER_FOLLOW' | 'TOP_DOWN' | 'ORBITAL_WIDE';

export type PickingMode = 'NONE' | 'PICK_A' | 'PICK_B' | 'ADD_HAZARD';

export type GeoPoint = [number, number]; // [lng, lat] (standard GeoJSON)
