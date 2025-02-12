let devices = [];

export {
    devices,
    validateMAC,
    showError
};

export async function loadDevices() {
    try {
        const response = await fetch('/api/devices');
        if (!response.ok) throw new Error('Failed to load devices');
        devices = await response.json();
        renderDevices();
    } catch (error) {
        showError(error.message);
    }
}

export function renderDevices() {
    const deviceTable = document.getElementById('deviceTable');
    deviceTable.innerHTML = devices.map(device => `
        <tr>
            <td>${device.name}</td>
            <td>${device.mac}</td>
            <td>
                <button class="btn btn-sm btn-success wake-btn me-2" 
                        data-mac="${device.mac}">
                    🔰 Wake
                </button>
                <button class="btn btn-sm btn-warning edit-btn me-2" 
                        data-name="${device.name}"> <!-- Escape here -->
                    ✏️ Edit
                </button>
                <button class="btn btn-sm btn-danger delete-btn" 
                        data-name="${device.name}">
                    🗑️ Delete
                </button>
            </td>
        </tr>
    `).join('');
}

function validateMAC(mac) {
    return /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(mac);
}

function showError(message) {
    alert(`Error: ${message}`);
}