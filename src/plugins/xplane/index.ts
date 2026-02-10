/**
 * X-Plane Plugin Module
 */
export { XPlanePlugin, type XPlanePluginConfig } from './XPlanePlugin';
export * from './types';
export { initXPlaneConnection, getTelemetry } from './xplaneWebApi';
