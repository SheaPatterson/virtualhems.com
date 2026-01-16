import { TelemetryData } from '../renderer/lib/models';
import { spawn } from 'child_process';
import path from 'path';

export const getDispatchResponse = async (message: string, telemetry: TelemetryData | null): Promise<string> => {
    if (!telemetry) {
        return "Dispatch awaiting telemetry data before responding.";
    }

    const pythonScriptPath = path.join(__dirname, 'get_dispatch_response.py');
    const telemetryJson = JSON.stringify(telemetry);

    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python3', [pythonScriptPath, message, telemetryJson]);

        let response = '';
        pythonProcess.stdout.on('data', (data) => {
            response += data.toString();
        });

        let error = '';
        pythonProcess.stderr.on('data', (data) => {
            error += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`Python script exited with code ${code}`);
                console.error(error);
                reject(`AI Coordinator Offline: ${error}`);
            } else {
                resolve(response.trim());
            }
        });
    });
};