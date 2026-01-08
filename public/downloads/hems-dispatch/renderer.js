const { ipcRenderer } = require('electron');

const root = document.getElementById('root');

function renderStatus(status, message) {
    root.innerHTML = `
        <div style="padding: 20px; font-family: monospace; background: #111; color: #00ff41; height: 100vh;">
            <h1 style="font-size: 18px; border-bottom: 1px solid #00ff41; padding-bottom: 10px;">HEMS Tactical Bridge</h1>
            <p style="margin-top: 15px;">[STATUS] Server: <span style="color: ${status === 'started' ? 'lime' : 'red'}; font-weight: bold;">${status.toUpperCase()}</span></p>
            <p>[INFO] ${message}</p>
            <p style="margin-top: 20px;">[LOGS]</p>
            <pre id="log-output" style="height: 400px; overflow-y: scroll; background: #000; padding: 10px; border: 1px solid #00ff41;"></pre>
        </div>
    `;
}

function logMessage(message) {
    const logOutput = document.getElementById('log-output');
    if (logOutput) {
        const timestamp = new Date().toLocaleTimeString();
        logOutput.innerHTML += `[${timestamp}] ${message}\n`;
        logOutput.scrollTop = logOutput.scrollHeight;
    }
}

// Initial render
renderStatus('starting', 'Initializing Electron application...');

// IPC Listeners
ipcRenderer.on('server-status', (event, data) => {
    if (data.status === 'started') {
        renderStatus('started', 'Node.js server is running on port 8080.');
    } else if (data.status === 'stopped') {
        renderStatus('stopped', `Server stopped unexpectedly (Code: ${data.code}).`);
    }
});

ipcRenderer.on('server-message', (event, message) => {
    logMessage(message);
});

// Log initial connection status
logMessage('Electron Renderer Process started.');