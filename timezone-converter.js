
// Timezone Conversion Tool and Management System for Staff Portal
document.addEventListener('DOMContentLoaded', function() {
  initializeTimezoneConverter();
  initializeTimezoneManagement();
});

// Centralized timezone offset definitions (hours from UTC)
const TIMEZONE_OFFSETS = {
  'EST': -5,     // Eastern Standard Time (UTC-5)
  'EDT': -4,     // Eastern Daylight Time (UTC-4)
  'CST': -6,     // Central Standard Time (UTC-6)
  'CDT': -5,     // Central Daylight Time (UTC-5)
  'MST': -7,     // Mountain Standard Time (UTC-7)
  'MDT': -6,     // Mountain Daylight Time (UTC-6)
  'PST': -8,     // Pacific Standard Time (UTC-8)
  'PDT': -7,     // Pacific Daylight Time (UTC-7)
  'GMT': 0,      // Greenwich Mean Time (UTC+0)
  'UTC': 0,      // Coordinated Universal Time
  'BST': 1,      // British Summer Time (UTC+1)
  'CET': 1,      // Central European Time (UTC+1)
  'EET': 2,      // Eastern European Time (UTC+2)
  'EEST': 3,     // Eastern European Summer Time (UTC+3)
  'IST': 5.5,    // Indian Standard Time (UTC+5:30)
  'JST': 9,      // Japan Standard Time (UTC+9)
  'AEST': 10,    // Australian Eastern Standard Time (UTC+10)
  'AEDT': 11,    // Australian Eastern Daylight Time (UTC+11)
  'NZST': 12,    // New Zealand Standard Time (UTC+12)
  'NZDT': 13,    // New Zealand Daylight Time (UTC+13)
  'HST': -10,    // Hawaii Standard Time (UTC-10)
  'AKST': -9,    // Alaska Standard Time (UTC-9)
  'AKDT': -8,    // Alaska Daylight Time (UTC-8)
  'CAT': 2,      // Central Africa Time (UTC+2)
  'WAT': 1,      // West Africa Time (UTC+1)
  'EAT': 3,      // East Africa Time (UTC+3)
  'MSK': 3,      // Moscow Time (UTC+3)
  'PKT': 5,      // Pakistan Standard Time (UTC+5)
  'WIB': 7,      // Western Indonesian Time (UTC+7)
  'WITA': 8,     // Central Indonesian Time (UTC+8)
  'WIT': 9,      // Eastern Indonesian Time (UTC+9)
  'KST': 9,      // Korea Standard Time (UTC+9)
  'CST_CHINA': 8,// China Standard Time (UTC+8)
  'PHT': 8,      // Philippine Time (UTC+8)
  'SGT': 8,      // Singapore Time (UTC+8)
  'MYT': 8,      // Malaysia Time (UTC+8)
  'ICT': 7,      // Indochina Time (UTC+7)
  'NST': -3.5,   // Newfoundland Standard Time (UTC-3:30)
  'AST': -4,     // Atlantic Standard Time (UTC-4)
  'BRT': -3,     // Brasília Time (UTC-3)
  'ART': -3,     // Argentina Time (UTC-3)
  'CLP': -3,     // Chile Time (UTC-3)
  'PET': -5,     // Peru Time (UTC-5)
  'COT': -5,     // Colombia Time (UTC-5)
  'ECT': -5,     // Ecuador Time (UTC-5)
  'BOT': -4,     // Bolivia Time (UTC-4)
  'VET': -4,     // Venezuela Time (UTC-4)
  'GYT': -4,     // Guyana Time (UTC-4)
  'SRT': -3,     // Suriname Time (UTC-3)
  'FKT': -3,     // Falkland Islands Time (UTC-3)
  'PMST': -3,    // Pierre & Miquelon Standard Time (UTC-3)
  'WGT': -3,     // West Greenland Time (UTC-3)
  'AZOT': -1,    // Azores Time (UTC-1)
  'CVT': -1,     // Cape Verde Time (UTC-1)
  'GREECE': 2,   // Greece Time (UTC+2) - Added for Santa
  'AWST': 8,     // Australian Western Standard Time (UTC+8)
  'GMT+1': 1,    // GMT+1
  'GMT+2': 2,    // GMT+2
  'GMT+3': 3,    // GMT+3
  'GMT+4': 4,    // GMT+4
  'GMT+5': 5,    // GMT+5
  'GMT+6': 6,    // GMT+6
  'GMT+7': 7,    // GMT+7
  'GMT+8': 8,    // GMT+8
  'GMT+9': 9,    // GMT+9
  'GMT+9.5': 9.5,// GMT+9.5 (Adelaide)
  'GMT+10': 10,  // GMT+10
  'GMT+10.5': 10.5,// GMT+10.5 (Lord Howe Island)
  'GMT+11': 11,  // GMT+11
  'GMT+12': 12,  // GMT+12
  'GMT+12.75': 12.75,// GMT+12.75 (Chatham Islands)
  'GMT+13': 13,  // GMT+13
  'GMT+14': 14,  // GMT+14 (Line Islands)
  'GMT-1': -1,   // GMT-1
  'GMT-2': -2,   // GMT-2
  'GMT-3': -3,   // GMT-3
  'GMT-3.5': -3.5,// GMT-3.5 (Newfoundland)
  'GMT-4': -4,   // GMT-4
  'GMT-4.5': -4.5,// GMT-4.5 (Venezuela)
  'GMT-5': -5,   // GMT-5
  'GMT-6': -6,   // GMT-6
  'GMT-7': -7,   // GMT-7
  'GMT-8': -8,   // GMT-8
  'GMT-9': -9,   // GMT-9
  'GMT-9.5': -9.5,// GMT-9.5 (Marquesas Islands)
  'GMT-10': -10, // GMT-10
  'GMT-11': -11, // GMT-11
  'GMT-12': -12  // GMT-12
};

// Function to get timezone offset relative to UTC
function getTimezoneOffset(timezone) {
  // Check if the timezone is directly in our mapping
  if (TIMEZONE_OFFSETS.hasOwnProperty(timezone)) {
    return TIMEZONE_OFFSETS[timezone];
  }

  // For custom GMT+X or GMT-X formats not in our mapping
  if (timezone.startsWith('GMT+')) {
    const offset = parseFloat(timezone.substring(4));
    return offset; // GMT+X is UTC+X
  }
  if (timezone.startsWith('GMT-')) {
    const offset = parseFloat(timezone.substring(4));
    return -offset; // GMT-X is UTC-X
  }

  // Default to 0 if unknown
  console.warn(`Unknown timezone: ${timezone}, defaulting to UTC`);
  return 0;
}

// Function to update timezone times in staff table
function updateTimezones() {
  const staffRows = document.querySelectorAll(".staff-table tbody tr");

  staffRows.forEach((row) => {
    const timezoneCell = row.querySelector("td:nth-child(4)"); // 4th column is timezone
    if (!timezoneCell) return;

    const timezoneText = timezoneCell.textContent.trim().split(" ")[0]; // Get just the timezone part
    if (!timezoneText || timezoneText === "-") return;

    // Get current time for this timezone
    try {
      // Get current UTC time
      const now = new Date();
      let time;

      // Use the centralized timezone offset system
      const offset = getTimezoneOffset(timezoneText);

      // Get current UTC time and apply timezone offset
      const utcTime = now.getTime();
      const offsetMilliseconds = offset * 3600000; // Convert hours to milliseconds
      
      // Create timezone-adjusted time
      time = new Date(utcTime + offsetMilliseconds);

      // Format the time in 12-hour format with AM/PM
      let hours = time.getHours();
      const minutes = time.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      const formattedTime = `${hours}:${minutes} ${ampm}`;

      // Determine time of day indicator
      let timeOfDay = "";
      const hour24 = time.getHours();
      if (hour24 >= 5 && hour24 < 12) {
        timeOfDay = '<span class="time-day">🌅 Day</span>';
      } else if (hour24 >= 12 && hour24 < 18) {
        timeOfDay = '<span class="time-midday">☀️ Mid-day</span>';
      } else {
        timeOfDay = '<span class="time-night">🌙 Night</span>';
      }

      // Update cell content with timezone, current time, and day/night indicator
      if (!timezoneCell.innerHTML.includes("(")) {
        timezoneCell.innerHTML = `${timezoneText} <span class="current-time">(${formattedTime})</span> ${timeOfDay}`;
      } else {
        // Update just the time part and day/night indicator
        const timeSpan = timezoneCell.querySelector(".current-time");
        if (timeSpan) {
          // Find and remove existing time of day indicator if present
          const existingTimeOfDay = timezoneCell.querySelector(
            ".time-day, .time-midday, .time-night",
          );
          if (existingTimeOfDay) {
            existingTimeOfDay.remove();
          }
          timeSpan.textContent = `(${formattedTime})`;
          // Append the time of day indicator after the time span
          timeSpan.insertAdjacentHTML("afterend", ` ${timeOfDay}`);
        } else {
          timezoneCell.innerHTML = `${timezoneText} <span class="current-time">(${formattedTime})</span> ${timeOfDay}`;
        }
      }
    } catch (error) {
      console.error(`Error calculating time for ${timezoneText}:`, error);
    }
  });

  // Update last refreshed indicator
  updateLastRefreshedTime();
}

// Function to update the last refreshed time indicator
function updateLastRefreshedTime() {
  const lastRefreshedElement = document.getElementById("last-refreshed-time");
  if (lastRefreshedElement) {
    const now = new Date();
    let hours = now.getHours();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");
    lastRefreshedElement.textContent = `${hours}:${minutes}:${seconds} ${ampm}`;

    // Add a visual indicator that the refresh occurred
    lastRefreshedElement.style.color = "#ED1F27";
    lastRefreshedElement.style.fontWeight = "bold";

    setTimeout(() => {
      lastRefreshedElement.style.color = "";
      lastRefreshedElement.style.fontWeight = "";
    }, 2000);

    console.log(
      "Last refreshed time updated to:",
      `${hours}:${minutes}:${seconds} ${ampm}`,
    );
  }
}

// Function to add refresh controls to the staff list section
function addRefreshControls() {
  const staffSection = document.getElementById("staff-list");
  if (!staffSection) return;

  // Create refresh controls container
  const refreshControls = document.createElement("div");
  refreshControls.className = "refresh-controls";
  refreshControls.innerHTML = `
    <div class="refresh-info">
      <span>Last refreshed at: <span id="last-refreshed-time">--:--:--</span></span>
      <button id="refresh-times-btn">
        <i class="fas fa-sync-alt"></i> Refresh Now
      </button>
    </div>
    <div class="auto-refresh-toggle">
      <label for="auto-refresh-checkbox">Auto-refresh every minute</label>
      <input type="checkbox" id="auto-refresh-checkbox" checked>
    </div>
  `;

  // Create a proper container for the refresh controls
  const refreshContainer = document.createElement("div");
  refreshContainer.style.width = "100%";
  refreshContainer.style.display = "flex";
  refreshContainer.style.justifyContent = "center";
  refreshContainer.appendChild(refreshControls);

  // Insert at the top of the staff list section
  const staffTitle = staffSection.querySelector("h2");
  if (staffTitle && staffTitle.nextSibling) {
    staffSection.insertBefore(refreshContainer, staffTitle.nextSibling);
  } else {
    staffSection.appendChild(refreshContainer);
  }

  // Add event listener for manual refresh with enhanced animation
  const refreshBtn = document.getElementById("refresh-times-btn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", function () {
      // Visual feedback before starting the refresh
      this.classList.add("refreshing");
      const icon = this.querySelector("i");
      if (icon) {
        // Show loading indicator
        icon.className = "fas fa-circle-notch fa-spin";
      }
      this.disabled = true;

      // Perform the refresh
      updateTimezones();

      // Add smooth transition back
      setTimeout(() => {
        if (icon) {
          icon.className = "fas fa-check";
        }
        this.style.backgroundColor = "#4CAF50";

        setTimeout(() => {
          if (icon) {
            icon.className = "fas fa-sync-alt";
          }
          this.classList.remove("refreshing");
          this.disabled = false;
          this.style.backgroundColor = "";

          // Show notification
          if (typeof showNotification === 'function') {
            showNotification("Timezone times refreshed successfully!", "success");
          }
        }, 1000);
      }, 800);
    });
  }

  // Initialize auto-refresh functionality
  initAutoRefresh();

  // Set initial last refreshed time
  updateLastRefreshedTime();

  // Immediately update timezones on page load
  updateTimezones();
}

// Function to initialize auto-refresh functionality
function initAutoRefresh() {
  let refreshInterval;
  const autoRefreshCheckbox = document.getElementById("auto-refresh-checkbox");
  if (!autoRefreshCheckbox) return;

  // Function to start or stop the interval
  function toggleAutoRefresh() {
    // Clear any existing interval first
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }

    if (autoRefreshCheckbox.checked) {
      // Set to refresh every minute (60000 ms)
      refreshInterval = setInterval(() => {
        updateTimezones();
        console.log(
          "Auto refresh executed at:",
          new Date().toLocaleTimeString(),
        );
      }, 60000);
      localStorage.setItem("autoRefreshEnabled", "true");
    } else {
      localStorage.setItem("autoRefreshEnabled", "false");
    }
  }

  // Add event listener for checkbox
  autoRefreshCheckbox.addEventListener("change", toggleAutoRefresh);

  // Initialize based on saved preference or default to enabled
  const savedPreference = localStorage.getItem("autoRefreshEnabled");
  if (savedPreference === "false") {
    autoRefreshCheckbox.checked = false;
  } else {
    autoRefreshCheckbox.checked = true;
  }

  // Start auto-refresh if enabled
  toggleAutoRefresh();

  // Force an initial update
  updateTimezones();
}

// Initialize timezone management system
function initializeTimezoneManagement() {
  // Check for staff table and initialize timezone display
  if (document.querySelector(".staff-table")) {
    console.log("Staff table found - initializing timezone display");

    // Delay slightly to ensure DOM is fully processed
    setTimeout(() => {
      // Add refresh controls to the staff list section
      addRefreshControls();

      // Force initial update of timezones
      updateTimezones();

      // Show notification of initialization if function exists
      if (typeof showNotification === 'function') {
        showNotification("Staff timezone display initialized", "info");
      }
    }, 500);
  }
}

function initializeTimezoneConverter() {
  // Create and add converter to the DOM
  const converterHTML = `
    <div class="timezone-converter-container">
      <h3><i class="fas fa-globe"></i> Timezone Converter</h3>
      <div class="converter-form">
        <div class="time-input-group">
          <input type="datetime-local" id="source-time" class="time-input">
          <select id="source-timezone" class="timezone-select">
            <optgroup label="Common Timezones">
              <option value="EST">EST - Eastern Standard Time (UTC-5)</option>
              <option value="CST">CST - Central Standard Time (UTC-6)</option>
              <option value="MST">MST - Mountain Standard Time (UTC-7)</option>
              <option value="PST">PST - Pacific Standard Time (UTC-8)</option>
              <option value="GMT">GMT - Greenwich Mean Time (UTC+0)</option>
              <option value="UTC">UTC - Coordinated Universal Time</option>
            </optgroup>
            <optgroup label="European Timezones">
              <option value="CET">CET - Central European Time (UTC+1)</option>
              <option value="EET">EET - Eastern European Time (UTC+2)</option>
              <option value="EEST">EEST - Eastern European Summer Time (UTC+3)</option>
              <option value="GREECE">GREECE - Greece Time (UTC+2)</option>
              <option value="BST">BST - British Summer Time (UTC+1)</option>
            </optgroup>
            <optgroup label="Asian Timezones">
              <option value="IST">IST - Indian Standard Time (UTC+5:30)</option>
              <option value="JST">JST - Japan Standard Time (UTC+9)</option>
              <option value="KST">KST - Korea Standard Time (UTC+9)</option>
              <option value="CST_CHINA">CST - China Standard Time (UTC+8)</option>
              <option value="PHT">PHT - Philippine Time (UTC+8)</option>
              <option value="SGT">SGT - Singapore Time (UTC+8)</option>
              <option value="PKT">PKT - Pakistan Standard Time (UTC+5)</option>
            </optgroup>
            <optgroup label="Australian/Pacific Timezones">
              <option value="AEST">AEST - Australian Eastern Standard Time (UTC+10)</option>
              <option value="AEDT">AEDT - Australian Eastern Daylight Time (UTC+11)</option>
              <option value="NZST">NZST - New Zealand Standard Time (UTC+12)</option>
              <option value="HST">HST - Hawaii Standard Time (UTC-10)</option>
              <option value="AWST">AWST - Australian Western Standard Time (UTC+8)</option>
            </optgroup>
            <optgroup label="Americas Timezones">
              <option value="AST">AST - Atlantic Standard Time (UTC-4)</option>
              <option value="BRT">BRT - Brasília Time (UTC-3)</option>
              <option value="ART">ART - Argentina Time (UTC-3)</option>
              <option value="PET">PET - Peru Time (UTC-5)</option>
              <option value="COT">COT - Colombia Time (UTC-5)</option>
            </optgroup>
            <optgroup label="GMT Offsets">
              <option value="GMT+14">GMT+14</option>
              <option value="GMT+13">GMT+13</option>
              <option value="GMT+12.75">GMT+12.75</option>
              <option value="GMT+12">GMT+12</option>
              <option value="GMT+11">GMT+11</option>
              <option value="GMT+10.5">GMT+10.5</option>
              <option value="GMT+10">GMT+10</option>
              <option value="GMT+9.5">GMT+9.5</option>
              <option value="GMT+9">GMT+9</option>
              <option value="GMT+8">GMT+8</option>
              <option value="GMT+7">GMT+7</option>
              <option value="GMT+6">GMT+6</option>
              <option value="GMT+5">GMT+5</option>
              <option value="GMT+4">GMT+4</option>
              <option value="GMT+3">GMT+3</option>
              <option value="GMT+2">GMT+2</option>
              <option value="GMT+1">GMT+1</option>
              <option value="GMT-1">GMT-1</option>
              <option value="GMT-2">GMT-2</option>
              <option value="GMT-3">GMT-3</option>
              <option value="GMT-3.5">GMT-3.5</option>
              <option value="GMT-4">GMT-4</option>
              <option value="GMT-4.5">GMT-4.5</option>
              <option value="GMT-5">GMT-5</option>
              <option value="GMT-6">GMT-6</option>
              <option value="GMT-7">GMT-7</option>
              <option value="GMT-8">GMT-8</option>
              <option value="GMT-9">GMT-9</option>
              <option value="GMT-9.5">GMT-9.5</option>
              <option value="GMT-10">GMT-10</option>
              <option value="GMT-11">GMT-11</option>
              <option value="GMT-12">GMT-12</option>
            </optgroup>
          </select>
        </div>

        <button id="convert-time-btn" class="btn">
          <i class="fas fa-exchange-alt"></i> Convert
        </button>

        <div class="results-container" id="conversion-results">
          <!-- Results will be populated here -->
        </div>
      </div>
    </div>
  `;

  // Find the staff list section and add the converter after it
  const staffSection = document.getElementById('staff-list');
  if (staffSection) {
    const converterElement = document.createElement('div');
    converterElement.className = 'section-card';
    converterElement.id = 'timezone-converter';
    converterElement.innerHTML = `<h2><i class="fas fa-clock"></i> Timezone Converter</h2>${converterHTML}`;

    // Insert after staff list section
    staffSection.parentNode.insertBefore(converterElement, staffSection.nextSibling);

    // Add event listeners
    setTimeout(() => {
      setupTimezoneConverter();
    }, 100);
  }
}

function setupTimezoneConverter() {
  const convertBtn = document.getElementById('convert-time-btn');
  const sourceTime = document.getElementById('source-time');
  const sourceTimezone = document.getElementById('source-timezone');
  const resultsContainer = document.getElementById('conversion-results');

  // Set default time to now
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  sourceTime.value = `${year}-${month}-${day}T${hours}:${minutes}`;

  // Add converter function
  if (convertBtn) {
    convertBtn.addEventListener('click', function() {
      convertTimeBetweenTimezones();
    });
  }

  function convertTimeBetweenTimezones() {
    if (!sourceTime.value) {
      if (typeof showNotification === 'function') {
        showNotification('Please select a time to convert', 'error');
      }
      return;
    }

    const inputTime = new Date(sourceTime.value);
    const inputTimezone = sourceTimezone.value;

    // Get all available timezones from staff list and our predefined list
    const timezones = getStaffTimezones();

    // Get UTC offset for source timezone
    const sourceOffset = getTimezoneOffset(inputTimezone);

    // Convert input time to UTC first
    // Assume input time is in local browser timezone initially, then adjust for source timezone
    const utcTime = new Date(inputTime.getTime() - (sourceOffset * 3600000));

    // Convert to all staff timezones
    let resultsHTML = `<h4>Time in all staff timezones:</h4><div class="timezone-results">`;

    timezones.forEach(tz => {
      const targetOffset = getTimezoneOffset(tz);
      
      // Convert from UTC to target timezone
      const adjustedTime = new Date(utcTime.getTime() + (targetOffset * 3600000));

      // Format the time
      const formattedTime = formatTime(adjustedTime);
      const timeOfDay = getTimeOfDay(adjustedTime.getHours());

      const offsetDisplay = targetOffset >= 0 ? `UTC+${targetOffset}` : `UTC${targetOffset}`;

      resultsHTML += `
        <div class="timezone-result-item">
          <div class="timezone-name">${tz} (${offsetDisplay})</div>
          <div class="converted-time">${formattedTime} ${timeOfDay}</div>
        </div>
      `;
    });

    resultsHTML += `</div>`;
    resultsContainer.innerHTML = resultsHTML;
    resultsContainer.style.display = 'block';
  }

  function getStaffTimezones() {
    // Start with our predefined timezones
    const timezones = new Set(Object.keys(TIMEZONE_OFFSETS));

    // Add timezones from staff table
    const staffTable = document.querySelector('.staff-table');
    if (staffTable) {
      const timezoneElements = staffTable.querySelectorAll('tbody tr td:nth-child(4)'); // 4th column is timezone
      timezoneElements.forEach(el => {
        const timezone = el.textContent.trim().split(' ')[0];
        if (timezone && timezone !== '-') {
          timezones.add(timezone);
        }
      });
    }

    return Array.from(timezones);
  }

  function formatTime(date) {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12

    return `${hours}:${minutes} ${ampm}`;
  }

  function getTimeOfDay(hour) {
    if (hour >= 5 && hour < 12) {
      return '<span class="time-day">🌅 Day</span>';
    } else if (hour >= 12 && hour < 18) {
      return '<span class="time-midday">☀️ Mid-day</span>';
    } else {
      return '<span class="time-night">🌙 Night</span>';
    }
  }
}

// Make timezone functions available globally for other scripts
window.TIMEZONE_OFFSETS = TIMEZONE_OFFSETS;
window.getTimezoneOffset = getTimezoneOffset;
window.updateTimezones = updateTimezones;
window.updateLastRefreshedTime = updateLastRefreshedTime;
window.addRefreshControls = addRefreshControls;
window.initAutoRefresh = initAutoRefresh;
window.initializeTimezoneManagement = initializeTimezoneManagement;
