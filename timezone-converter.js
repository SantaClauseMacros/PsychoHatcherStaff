// Timezone Conversion Tool for Staff Portal
document.addEventListener('DOMContentLoaded', function() {
  initializeTimezoneConverter();
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
  'GREECE': -2,   // Greece Time (UTC+2) - Added for Santa
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

// Function to get timezone offset relative to EST
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

  // Default to EST if unknown
  console.warn(`Unknown timezone: ${timezone}, defaulting to EST`);
  return 0;
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
      showNotification('Please select a time to convert', 'error');
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

// Make timezone offsets and functions available globally
window.TIMEZONE_OFFSETS = TIMEZONE_OFFSETS;
window.getTimezoneOffset = getTimezoneOffset;