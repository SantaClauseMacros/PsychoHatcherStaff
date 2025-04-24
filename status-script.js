/**
 * Psycho Hatcher Macro Status System
 * This script manages the status of all macros and provides real-time status displays
 */

// Define the list of macros to track status for
const MACRO_LIST = [
    { id: "rankup", name: "Rankup Macro", priority: "high" },
    { id: "dig", name: "Advanced Digging", priority: "high" },
    { id: "clan", name: "Clan Mode", priority: "high" },
    { id: "treehouse", name: "Treehouse Mode", priority: "medium" },
    { id: "fishing", name: "Deep Fishing", priority: "medium" },
    { id: "garden", name: "Garden Mode", priority: "medium" },
    { id: "fusepets", name: "Fuse Pets Mode", priority: "medium" },
    { id: "levelup", name: "Level Up Mode", priority: "high" },
    { id: "market", name: "Market Overlord Mode", priority: "high" },
    { id: "fisch", name: "Fisch Mode", priority: "medium" },
    { id: "anime", name: "Anime Adventures Mode", priority: "medium" },
    { id: "openstuff", name: "Open Stuff Mode", priority: "low" },
    { id: "bubblegum", name: "Bubblegum Mode", priority: "medium" }
];

// Status definitions
const STATUS_TYPES = {
    operational: { label: "Operational", color: "#4CAF50", icon: "check-circle" },
    issues: { label: "Having Issues", color: "#FF9800", icon: "exclamation-triangle" },
    down: { label: "Not Working", color: "#F44336", icon: "times-circle" },
    maintenance: { label: "Maintenance", color: "#2196F3", icon: "wrench" },
    degraded: { label: "Degraded Performance", color: "#FF9800", icon: "exclamation-circle" },
    partial: { label: "Partial Outage", color: "#FF9800", icon: "times-circle" },
    major: { label: "Major Outage", color: "#F44336", icon: "exclamation-triangle" }
};

// Initialize status data or load from localStorage
function initializeStatusData() {
    // Check if we have stored status data
    let macroStatus = JSON.parse(localStorage.getItem('macroStatus')) || {};

    // Create default status for any macros not in storage
    MACRO_LIST.forEach(macro => {
        if (!macroStatus[macro.id]) {
            macroStatus[macro.id] = {
                status: "operational",
                lastUpdated: new Date().toISOString(),
                note: "",
                updatedBy: sessionStorage.getItem('loggedInUser') || "System"
            };
        }
    });

    // Save complete status data
    localStorage.setItem('macroStatus', JSON.stringify(macroStatus));
    return macroStatus;
}

// Load status data
let macroStatus = initializeStatusData();

// Function to update the status tables and displays
function updateStatusDisplay() {
    // Update dashboard table if it exists
    const statusTableBody = document.getElementById('status-table-body');
    if (statusTableBody) {
        statusTableBody.innerHTML = ''; // Clear existing rows

        MACRO_LIST.forEach(macro => {
            const status = macroStatus[macro.id];
            const statusType = STATUS_TYPES[status.status];

            const row = document.createElement('tr');
            row.dataset.macroId = macro.id;
            row.innerHTML = `
                <td class="macro-name">
                    <strong>${macro.name}</strong>
                    ${macro.priority === 'high' ? '<span class="priority-badge high">High Priority</span>' : ''}
                </td>
                <td class="status-cell">
                    <div class="status-indicator" style="background-color: ${statusType.color}">
                        <i class="fas fa-${statusType.icon}"></i>
                        <span>${statusType.label}</span>
                    </div>
                </td>
                <td class="last-updated">
                    ${formatDate(new Date(status.lastUpdated))}
                </td>
                <td class="note-cell">
                    ${status.note ? status.note : '<em>No notes</em>'}
                </td>
                <td class="action-cell">
                    <div class="status-actions">
                        <button class="btn-sm set-status" data-status="operational"><i class="fas fa-check-circle"></i></button>
                        <button class="btn-sm set-status" data-status="issues"><i class="fas fa-exclamation-triangle"></i></button>
                        <button class="btn-sm set-status" data-status="down"><i class="fas fa-times-circle"></i></button>
                        <button class="btn-sm set-status" data-status="maintenance"><i class="fas fa-wrench"></i></button>
                    </div>
                </td>
            `;

            statusTableBody.appendChild(row);
        });

        // Add event listeners for status buttons
        document.querySelectorAll('.set-status').forEach(button => {
            button.addEventListener('click', function() {
                const row = this.closest('tr');
                const macroId = row.dataset.macroId;
                const newStatus = this.dataset.status;

                updateMacroStatus(macroId, newStatus);
                updateStatusDisplay();
            });
        });
    }

    // Update the public-facing status display
    updatePublicStatusDisplay();
}

// Format date for display
function formatDate(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) {
        return 'Just now';
    } else if (diffMins < 60) {
        return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else if (diffMins < 1440) {
        const hours = Math.floor(diffMins / 60);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
        return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    }
}

// Update the status of a specific macro
function updateMacroStatus(macroId, newStatus, note = null) {
    if (!macroStatus[macroId]) return;

    macroStatus[macroId].status = newStatus;
    macroStatus[macroId].lastUpdated = new Date().toISOString();
    macroStatus[macroId].updatedBy = sessionStorage.getItem('loggedInUser') || "Anonymous";

    if (note !== null) {
        macroStatus[macroId].note = note;
    }

    // Save the updated status
    localStorage.setItem('macroStatus', JSON.stringify(macroStatus));

    // Show notification of change
    if (typeof showNotification === 'function') {
        showNotification(`${getMacroName(macroId)} status updated to ${STATUS_TYPES[newStatus].label}`, 'success');
    }
}

// Get macro name from id
function getMacroName(macroId) {
    const macro = MACRO_LIST.find(m => m.id === macroId);
    return macro ? macro.name : macroId;
}

// Update all macros to the same status
function updateAllMacroStatus(newStatus) {
    MACRO_LIST.forEach(macro => {
        updateMacroStatus(macro.id, newStatus);
    });
    updateStatusDisplay();
}

// Function to update the public-facing status display
function updatePublicStatusDisplay() {
    const statusDisplay = document.getElementById('macro-status-display');
    if (!statusDisplay) return;

    // Calculate overall system status
    let overallStatus = calculateOverallStatus();

    // Build status panel HTML
    let statusHTML = `
        <div class="macro-status-panel">
            <div class="overall-status ${overallStatus}">
                <div class="status-header">
                    <h3><i class="fas fa-${STATUS_TYPES[overallStatus].icon}"></i> Psycho Hatcher Status</h3>
                    <span class="status-label">${STATUS_TYPES[overallStatus].label}</span>
                </div>
                <div class="status-timestamp">Last checked: ${formatDate(new Date())}</div>
            </div>
            <div class="macro-status-details">
    `;

    // Get non-operational macros to highlight
    const highPriorityIssues = MACRO_LIST.filter(macro =>
        macroStatus[macro.id].status !== 'operational' && macro.priority === 'high'
    );

    // Add high priority issues if any
    if (highPriorityIssues.length > 0) {
        statusHTML += `<div class="status-issues">`;
        highPriorityIssues.forEach(macro => {
            const status = macroStatus[macro.id];
            statusHTML += `
                <div class="issue-item ${status.status}">
                    <span class="issue-name">${macro.name}:</span>
                    <span class="issue-status">${STATUS_TYPES[status.status].label}</span>
                    ${status.note ? `<div class="issue-note">${status.note}</div>` : ''}
                </div>
            `;
        });
        statusHTML += `</div>`;
    }

    // Add "See All Statuses" button that expands to show all statuses
    statusHTML += `
            <div class="see-all-container">
                <button class="see-all-button">See All Macro Statuses</button>
                <div class="all-statuses">
                    <table class="mini-status-table">
                        <thead>
                            <tr>
                                <th>Macro</th>
                                <th>Status</th>
                                <th>Updated</th>
                            </tr>
                        </thead>
                        <tbody>
    `;

    // Add all macros to the expanded view
    MACRO_LIST.forEach(macro => {
        const status = macroStatus[macro.id];
        statusHTML += `
            <tr class="${status.status}">
                <td>${macro.name}</td>
                <td>
                    <span class="status-dot" style="background-color: ${STATUS_TYPES[status.status].color}"></span>
                    ${STATUS_TYPES[status.status].label}
                </td>
                <td>${formatDate(new Date(status.lastUpdated))}</td>
            </tr>
        `;
    });

    statusHTML += `
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    `;

    // Update the status display
    statusDisplay.innerHTML = statusHTML;

    // Add event listener to the "See All" button
    const seeAllButton = statusDisplay.querySelector('.see-all-button');
    if (seeAllButton) {
        seeAllButton.addEventListener('click', function() {
            const allStatuses = statusDisplay.querySelector('.all-statuses');
            allStatuses.classList.toggle('expanded');
            this.textContent = allStatuses.classList.contains('expanded')
                ? 'Hide All Macro Statuses'
                : 'See All Macro Statuses';
        });
    }
}

// Calculate overall system status based on high priority macros
function calculateOverallStatus() {
    // Check high priority macros first
    const highPriorityMacros = MACRO_LIST.filter(macro => macro.priority === 'high');

    // If any high priority macro is down, the system is down
    if (highPriorityMacros.some(macro => macroStatus[macro.id].status === 'down' || macroStatus[macro.id].status === 'major')) {
        return 'down';
    }

    // If any high priority macro has issues, the system has issues
    if (highPriorityMacros.some(macro => macroStatus[macro.id].status === 'issues' || macroStatus[macro.id].status === 'degraded' || macroStatus[macro.id].status === 'partial')) {
        return 'issues';
    }

    // If any high priority macro is in maintenance, the system is in maintenance
    if (highPriorityMacros.some(macro => macroStatus[macro.id].status === 'maintenance')) {
        return 'maintenance';
    }

    // Otherwise, check if all macros are operational
    if (MACRO_LIST.every(macro => macroStatus[macro.id].status === 'operational')) {
        return 'operational';
    }

    // If we have some non-high-priority macros with issues, show issues
    return 'issues';
}

// Initialize dashboard controls
function initializeStatusDashboard() {
    // Set global status buttons
    const allOperationalBtn = document.getElementById('all-operational');
    const allIssuesBtn = document.getElementById('all-issues');
    const allDownBtn = document.getElementById('all-down');
    const saveStatusBtn = document.getElementById('save-status');

    if (allOperationalBtn) {
        allOperationalBtn.addEventListener('click', () => updateAllMacroStatus('operational'));
    }

    if (allIssuesBtn) {
        allIssuesBtn.addEventListener('click', () => updateAllMacroStatus('issues'));
    }

    if (allDownBtn) {
        allDownBtn.addEventListener('click', () => updateAllMacroStatus('down'));
    }

    if (saveStatusBtn) {
        saveStatusBtn.addEventListener('click', function() {
            // Save is automatic, but we'll show a confirmation
            showNotification('Status changes saved successfully', 'success');
        });
    }

    // Add note button
    const addNoteBtn = document.getElementById('add-note');
    const noteTextarea = document.getElementById('status-note');

    if (addNoteBtn && noteTextarea) {
        addNoteBtn.addEventListener('click', function() {
            const selectedRows = document.querySelectorAll('tr.selected');
            if (selectedRows.length === 0) {
                showNotification('Please select at least one macro first', 'error');
                return;
            }

            const note = noteTextarea.value.trim();
            selectedRows.forEach(row => {
                const macroId = row.dataset.macroId;
                updateMacroStatus(macroId, macroStatus[macroId].status, note);
            });

            updateStatusDisplay();
            noteTextarea.value = '';
            showNotification(`Note added to ${selectedRows.length} macro(s)`, 'success');
        });
    }

    // Make rows selectable for bulk actions
    document.querySelectorAll('#status-table-body tr').forEach(row => {
        row.addEventListener('click', function(e) {
            // Don't select if clicking an action button
            if (e.target.closest('.action-cell')) return;

            this.classList.toggle('selected');
        });
    });

    // Copy embed code button
    const copyEmbedBtn = document.getElementById('copy-embed');
    if (copyEmbedBtn) {
        copyEmbedBtn.addEventListener('click', function() {
            const embedCode = document.querySelector('.status-embed pre code').textContent;
            navigator.clipboard.writeText(embedCode).then(() => {
                showNotification('Embed code copied to clipboard', 'success');
            });
        });
    }
}

// Add custom styles for the status system
function addStatusStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        /* Status dashboard styles */
        .status-board {
            max-width: 1200px;
            margin: 0 auto;
        }

        .global-status-controls {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }

        .status-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            border-radius: 8px;
            overflow: hidden;
        }

        .status-table th, .status-table td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }

        .status-table th {
            background-color: #f8f8f8;
            font-weight: bold;
        }

        .status-table tr:hover {
            background-color: #f5f5f5;
        }

        .status-table tr.selected {
            background-color: rgba(237, 31, 39, 0.1);
        }

        .status-indicator {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 6px 12px;
            border-radius: 50px;
            color: white;
            font-weight: bold;
        }

        .status-actions {
            display: flex;
            gap: 5px;
        }

        .status-actions button {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border: none;
        }

        .status-actions button[data-status="operational"] {
            background-color: #4CAF50;
            color: white;
        }

        .status-actions button[data-status="issues"] {
            background-color: #FF9800;
            color: white;
        }

        .status-actions button[data-status="down"] {
            background-color: #F44336;
            color: white;
        }

        .status-actions button[data-status="maintenance"] {
            background-color: #2196F3;
            color: white;
        }

        .priority-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 0.7rem;
            margin-left: 8px;
        }

        .priority-badge.high {
            background-color: #ffcdd2;
            color: #c62828;
        }

        .status-update-form {
            margin: 20px 0;
            padding: 15px;
            background-color: #f9f9f9;
            border-radius: 8px;
        }

        .form-group {
            margin-bottom: 15px;
        }

        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }

        .form-group textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            min-height: 80px;
            font-family: inherit;
        }

        .status-embed {
            margin: 20px 0;
            padding: 15px;
            background-color: #f0f0f0;
            border-radius: 8px;
        }

        .status-embed pre {
            background-color: #333;
            color: #f8f8f8;
            padding: 15px;
            border-radius: 4px;
            overflow-x: auto;
        }

        /* Public-facing status display styles */
        .macro-status-panel {
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #ddd;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            font-family: Arial, sans-serif;
        }

        .overall-status {
            padding: 15px;
            color: white;
        }

        .overall-status.operational {
            background-color: #4CAF50;
        }

        .overall-status.issues {
            background-color: #FF9800;
        }

        .overall-status.down {
            background-color: #F44336;
        }

        .overall-status.maintenance {
            background-color: #2196F3;
        }

        .status-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .status-header h3 {
            margin: 0;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .status-timestamp {
            font-size: 0.8rem;
            opacity: 0.8;
            margin-top: 5px;
        }

        .macro-status-details {
            background-color: white;
            padding: 15px;
        }

        .status-issues {
            margin-bottom: 15px;
        }

        .issue-item {
            padding: 10px;
            margin-bottom: 5px;
            border-radius: 4px;
        }

        .issue-item.issues {
            background-color: #FFF3E0;
        }

        .issue-item.down {
            background-color: #FFEBEE;
        }

        .issue-item.maintenance {
            background-color: #E3F2FD;
        }

        .issue-name {
            font-weight: bold;
            margin-right: 5px;
        }

        .issue-note {
            margin-top: 5px;
            font-size: 0.9rem;
            color: #666;
        }

        .see-all-container {
            text-align: center;
            margin-top: 10px;
        }

        .see-all-button {
            background-color: #f0f0f0;
            border: none;
            padding: 8px 15px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
        }

        .see-all-button:hover {
            background-color: #e0e0e0;
        }

        .all-statuses {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease;
        }

        .all-statuses.expanded {
            max-height: 500px;
        }

        .mini-status-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            font-size: 0.9rem;
        }

        .mini-status-table th, .mini-status-table td {
            padding: 8px;
            text-align: left;
            border-bottom: 1px solid #eee;
        }

        .mini-status-table th {
            font-weight: bold;
            background-color: #f8f8f8;
        }

        .mini-status-table tr.operational {
            background-color: rgba(76, 175, 80, 0.1);
        }

        .mini-status-table tr.issues {
            background-color: rgba(255, 152, 0, 0.1);
        }

        .mini-status-table tr.down {
            background-color: rgba(244, 67, 54, 0.1);
        }

        .mini-status-table tr.maintenance {
            background-color: rgba(33, 150, 243, 0.1);
        }

        .status-dot {
            display: inline-block;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            margin-right: 5px;
        }

        /* Dark mode compatibility */
        .dark-mode .status-table th {
            background-color: #2a2a2a;
            color: #f0f0f0;
        }

        .dark-mode .status-table,
        .dark-mode .status-update-form,
        .dark-mode .status-embed {
            background-color: #333;
            color: #f0f0f0;
        }

        .dark-mode .macro-status-details {
            background-color: #222;
            color: #f0f0f0;
        }

        .dark-mode .see-all-button {
            background-color: #444;
            color: #f0f0f0;
        }

        .dark-mode .see-all-button:hover {
            background-color: #555;
        }

        .dark-mode .mini-status-table th {
            background-color: #2a2a2a;
        }

        .dark-mode .mini-status-table tr.operational {
            background-color: rgba(76, 175, 80, 0.2);
        }

        .dark-mode .mini-status-table tr.issues {
            background-color: rgba(255, 152, 0, 0.2);
        }

        .dark-mode .mini-status-table tr.down {
            background-color: rgba(244, 67, 54, 0.2);
        }

        .dark-mode .mini-status-table tr.maintenance {
            background-color: rgba(33, 150, 243, 0.2);
        }


        /* New Styles for the interactive status panel */
        .status-item {
            border: 1px solid #ccc;
            padding: 10px;
            margin-bottom: 5px;
            cursor: pointer;
        }
        .status-item.selected {
            background-color: #f0f0f0;
        }
        .mode-name {
            font-weight: bold;
        }
        .status-badge {
            float: right;
            padding: 5px 10px;
            border-radius: 5px;
            color: white;
            cursor: pointer;
        }
        .status-badge.operational {
            background-color: #4CAF50;
        }
        .status-badge.degraded {
            background-color: #FF9800;
        }
        .status-badge.partial {
            background-color: #FF9800;
        }
        .status-badge.major {
            background-color: #F44336;
        }
        .status-badge.maintenance {
            background-color: #2196F3;
        }
        .status-options {
            position: absolute;
            background-color: white;
            border: 1px solid #ccc;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            padding: 5px;
            z-index: 10;
        }
        .status-option {
            padding: 5px 10px;
            cursor: pointer;
        }
        .status-option:hover {
            background-color: #f0f0f0;
        }
        .notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 10px 20px;
            border-radius: 5px;
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: 100;
        }
        .notification.show {
            opacity: 1;
        }
        .notification.success {
            background-color: #4CAF50;
            color: white;
        }
        .notification.error {
            background-color: #F44336;
            color: white;
        }

        .code-block{
            margin-top: 20px;
        }
    `;

    document.head.appendChild(styleElement);
}

// Empty notification function to prevent notifications
function showNotification(message, type = "info") {
  // Notification functionality disabled
  console.log(`Notification (${type}): ${message}`);
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Add styles
    addStatusStyles();

    // Initialize status display
    updateStatusDisplay();

    // Initialize dashboard if on dashboard page
    if (document.querySelector('.status-board')) {
        initializeStatusDashboard();
    }

    // Initialize variables
    const refreshBtn = document.getElementById('refresh-status');
    const addNoteBtn = document.getElementById('add-note-btn');
    const copyEmbedBtn = document.getElementById('copy-embed-code');

    // Status data with priorities
    const modesStatus = [
        { name: 'Rankup Macro', status: 'operational', priority: 'high' },
        { name: 'Advanced Digging', status: 'operational', priority: 'medium' },
        { name: 'Clan Mode', status: 'operational', priority: 'high' },
        { name: 'Treehouse Mode', status: 'operational', priority: 'medium' },
        { name: 'Deep Fishing', status: 'operational', priority: 'low' },
        { name: 'Garden Mode', status: 'operational', priority: 'low' },
        { name: 'Fuse Pets Mode', status: 'operational', priority: 'low' },
        { name: 'Level Up Mode', status: 'operational', priority: 'high' },
        { name: 'Market Overlord Mode', status: 'operational', priority: 'high' },
        { name: 'Fisch Mode', status: 'operational', priority: 'medium' },
        { name: 'Anime Adventures Mode', status: 'operational', priority: 'low' },
        { name: 'Open Stuff Mode', status: 'operational', priority: 'low' },
        { name: 'Bubblegum Mode', status: 'operational', priority: 'high' }
    ];

    // Event Listeners
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshStatus);
    }

    if (addNoteBtn) {
        addNoteBtn.addEventListener('click', addNote);
    }

    if (copyEmbedBtn) {
        copyEmbedBtn.addEventListener('click', copyEmbedCode);
    }

    // Initialize status items with click handlers
    initializeStatusItems();

    // Functions
    function initializeStatusItems() {
        const statusItems = document.querySelectorAll('.status-item');

        statusItems.forEach(item => {
            item.addEventListener('click', function() {
                // Toggle selected class
                statusItems.forEach(si => si.classList.remove('selected'));
                this.classList.add('selected');
            });

            // Add status change options
            const modeName = item.querySelector('.mode-name').textContent;
            const statusBadge = item.querySelector('.status-badge');

            statusBadge.addEventListener('click', function(e) {
                e.stopPropagation();
                showStatusOptions(this, modeName);
            });
        });
    }

    function showStatusOptions(element, modeName) {
        // Remove any existing options
        const existingOptions = document.querySelector('.status-options');
        if (existingOptions) {
            existingOptions.remove();
        }

        // Create status options
        const options = document.createElement('div');
        options.className = 'status-options';

        const statuses = [
            { value: 'operational', label: 'Operational', icon: 'check-circle' },
            { value: 'degraded', label: 'Degraded Performance', icon: 'exclamation-circle' },
            { value: 'partial', label: 'Partial Outage', icon: 'times-circle' },
            { value: 'major', label: 'Major Outage', icon: 'exclamation-triangle' },
            { value: 'maintenance', label: 'Maintenance', icon: 'wrench' }
        ];

        statuses.forEach(status => {
            const option = document.createElement('div');
            option.className = 'status-option';
            option.innerHTML = `<i class="fas fa-${status.icon}"></i> ${status.label}`;
            option.dataset.status = status.value;

            option.addEventListener('click', function() {
                updateModeStatus(modeName, status.value, status.label, status.icon);
                options.remove();
            });

            options.appendChild(option);
        });

        // Position and append options
        const rect = element.getBoundingClientRect();
        options.style.top = rect.bottom + 'px';
        options.style.left = rect.left + 'px';
        document.body.appendChild(options);

        // Close on outside click
        document.addEventListener('click', function closeOptions(e) {
            if (!options.contains(e.target) && e.target !== element) {
                options.remove();
                document.removeEventListener('click', closeOptions);
            }
        });
    }

    function updateModeStatus(modeName, statusValue, statusLabel, iconName) {
        // Find the status item
        const statusItems = document.querySelectorAll('.status-item');
        let targetItem;

        statusItems.forEach(item => {
            if (item.querySelector('.mode-name').textContent === modeName) {
                targetItem = item;
            }
        });

        if (!targetItem) return;

        // Update the status badge
        const statusBadge = targetItem.querySelector('.status-badge');
        statusBadge.className = `status-badge ${statusValue}`;
        statusBadge.innerHTML = `<i class="fas fa-${iconName}"></i> ${statusLabel}`;

        // Update the modesStatus array
        const modeIndex = modesStatus.findIndex(mode => mode.name ===modeName);
        if (modeIndex !== -1) {
            modesStatus[modeIndex].status = statusValue;
        }
    }

    function refreshStatus() {
        // Animation for refresh button
        const refreshIcon = refreshBtn.querySelector('i');
        refreshIcon.classList.add('fa-spin');

        // Simulate refresh delay
        setTimeout(() => {
            refreshIcon.classList.remove('fa-spin');

            // Show refresh confirmation
            const notification = document.createElement('div');
            notification.className = 'notification success';
            notification.innerHTML = '<i class="fas fa-check"></i> Status refreshed successfully';

            document.body.appendChild(notification);

            setTimeout(() => {
                notification.classList.add('show');

                setTimeout(() => {
                    notification.classList.remove('show');
                    setTimeout(() => notification.remove(), 300);
                }, 2000);
            }, 10);
        }, 1000);
    }

    function addNote() {
        const noteText = document.getElementById('status-note').value.trim();
        const selectedItem = document.querySelector('.status-item.selected');

        if (!selectedItem) {
            alert('Please select a mode first.');
            return;
        }

        if (noteText === '') {
            alert('Please enter a note.');
            return;
        }

        const modeName = selectedItem.querySelector('.mode-name').textContent;

        // Show confirmation
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.innerHTML = `<i class="fas fa-check"></i> Note added to "${modeName}" status`;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');

            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, 2000);
        }, 10);

        // Clear the note input
        document.getElementById('status-note').value = '';
    }

    function copyEmbedCode() {
        const codeBlock = document.querySelector('.code-block code');
        const textArea = document.createElement('textarea');
        textArea.value = codeBlock.textContent;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);

        // Show confirmation
        const copyBtn = document.getElementById('copy-embed-code');
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';

        setTimeout(() => {
            copyBtn.innerHTML = originalText;
        }, 2000);
    }
});

// Refresh status display every minute for real-time updates
setInterval(updatePublicStatusDisplay, 60000);