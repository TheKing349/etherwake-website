import {loadDevices, devices, validateMAC, showError} from './devices.js';
import {setupThemeToggle} from "./theme.js";
import {showToast} from "./toast.js";

let editingOriginalName = null;

export function setupEventListeners() {
    document.getElementById('newDeviceBtn').addEventListener('click', addNewDeviceRow);

    const deviceTable = document.getElementById('deviceTable');
    deviceTable.addEventListener('click', handleTableClick);

    document.getElementById('themeToggle').addEventListener('click', setupThemeToggle);
}

async function handleTableClick(e) {
    const row = e.target.closest('tr');
    if (!row) return;

    try {
        if (e.target.classList.contains('save-btn')) {
            await handleSave(row);
        }
        else if (e.target.classList.contains('cancel-btn')) {
            handleCancel(row);
        }
        else if (e.target.classList.contains('edit-btn')) {
            handleEdit(e.target.dataset.name);
        }
        else if (e.target.classList.contains('delete-btn')) {
            await handleDelete(e.target.dataset.name);
        }
        else if (e.target.classList.contains('wake-btn')) {
            await handleWake(e.target.dataset.mac);
        }
    } catch (error) {
        showError(error.message);
    }
}

async function handleSave(row) {
    const inputs = row.querySelectorAll('input');
    const device = {
        name: inputs[0].value.trim(),
        mac: inputs[1].value.trim()
    };

    if (!device.name || !device.mac) {
        throw new Error('Please fill in both fields');
    }

    if (!validateMAC(device.mac)) {
        throw new Error('Invalid MAC address format (use 00:11:22:33:44:55)');
    }

    const nameConflict = devices.some(d =>
        d.name === device.name &&
        (!editingOriginalName || d.name !== editingOriginalName)
    );

    if (nameConflict) {
        throw new Error('Device name already exists');
    }

    const endpoint = editingOriginalName
        ? `/api/devices?originalName=${encodeURIComponent(editingOriginalName)}`
        : '/api/devices';

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(device)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Save failed');
    }

    editingOriginalName = null;
    await loadDevices();
}

function handleCancel(row) {
    if (row.classList.contains('editing')) {
        row.remove();
    }
    editingOriginalName = null;
    loadDevices();
}

function handleEdit(deviceName) {
    editingOriginalName = deviceName;
    const device = devices.find(d => d.name === deviceName);

    const button = document.querySelector(`button[data-name="${deviceName}"]`);

    if (!button) {
        console.error("Edit button not found for:", deviceName);
        return;
    }

    const originalRow = button.closest('tr');

    const editRow = `
        <tr class="editing">
            <td><input type="text" class="form-control form-control-sm" 
                 value="${device.name}"></td>
            <td><input type="text" class="form-control form-control-sm" 
                 value="${device.mac}"></td>
            <td>
                <button class="btn btn-sm btn-success save-btn">💾 Save</button>
                <button class="btn btn-sm btn-secondary cancel-btn">✖️ Cancel</button>
            </td>
        </tr>
    `;

    originalRow.insertAdjacentHTML('afterend', editRow);
    originalRow.remove();
}

async function handleDelete(deviceName) {
    if (!confirm(`Delete device "${deviceName}"?`)) return;

    const response = await fetch(
        `/api/devices?name=${encodeURIComponent(deviceName)}`,
        { method: 'DELETE' }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Delete failed');
    }

    await loadDevices();
}

async function handleWake(mac) {
    try {
        showToast('warning', 'Wake command sending...');
        const response = await fetch('/api/wake', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mac })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Wake command failed');
        }

        showToast('success', 'Wake command sent successfully');
    } catch (error) {
        showToast('error', error.message);
    }
}

function addNewDeviceRow() {
    const deviceTable = document.getElementById('deviceTable');
    deviceTable.insertAdjacentHTML('afterbegin', `
        <tr class="editing">
            <td><input type="text" class="form-control form-control-sm"></td>
            <td><input type="text" class="form-control form-control-sm"></td>
            <td>
                <button class="btn btn-sm btn-success save-btn">💾 Save</button>
                <button class="btn btn-sm btn-secondary cancel-btn">✖️ Cancel</button>
            </td>
        </tr>
    `);
}