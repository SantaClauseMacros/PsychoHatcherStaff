// Timezone Conversion Tool for Staff Portal
document.addEventListener('DOMContentLoaded', function() {
  initializeTimezoneConverter();
});

// Centralized timezone offset definitions (all offsets relative to EST)
const TIMEZONE_OFFSETS = {
  'EST': 0,      // Eastern Standard Time (baseline)
  'CST': -1,     // Central Standard Time
  'GMT': 4,      // Greenwich Mean Time
  'IST': 9.5,    // Indian Standard Time
  'AEDT': 11,    // Australian Eastern Daylight Time
  'GMT+1': 5,    // GMT+1
  'GMT+2': 6,    // GMT+2
  'GMT+3': 7,    // GMT+3
  'GMT+4': 8,    // GMT+4
  'GMT+5': 9,    // GMT+5
  'GMT+6': 10,   // GMT+6
  'GMT+7': 11,   // GMT+7
  'GMT+8': 12,   // GMT+8
  'GMT+9': 13,   // GMT+9
  'GMT+9.5': 13.5, // GMT+9.5
  'GMT+10': 14,  // GMT+10
  'GMT+11': 15,  // GMT+11
  'GMT+12': 16,  // GMT+12
  'GMT-1': 3,    // GMT-1
  'GMT-2': 2,    // GMT-2
  'GMT-3': 1,    // GMT-3
  'GMT-4': 0,    // GMT-4 (same as EST)
  'GMT-5': -1,   // GMT-5 (same as CST)
  'GMT-6': -2,   // GMT-6
  'GMT-7': -3,   // GMT-7
  'GMT-8': -4,   // GMT-8
  'GMT-9': -5,   // GMT-9
  'GMT-10': -6,  // GMT-10
  'GMT-11': -7,  // GMT-11
  'GMT-12': -8   // GMT-12
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
    return 4 + offset; // GMT is +4 from EST, so GMT+X is 4+X from EST
  }
  if (timezone.startsWith('GMT-')) {
    const offset = parseFloat(timezone.substring(4));
    return 4 - offset; // GMT is +4 from EST, so GMT-X is 4-X from EST
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
            <option value="EST">EST (Eastern Standard Time)</option>
            <option value="CST">CST (Central Standard Time)</option>
            <option value="GMT">GMT (Greenwich Mean Time)</option>
            <option value="IST">IST (Indian Standard Time)</option>
            <option value="AEDT">AEDT (Australian Eastern Daylight Time)</option>
            <option value="GMT+1">GMT+1</option>
            <option value="GMT+2">GMT+2</option>
            <option value="GMT+3">GMT+3</option>
            <option value="GMT+4">GMT+4</option>
            <option value="GMT+5">GMT+5</option>
            <option value="GMT+6">GMT+6</option>
            <option value="GMT+7">GMT+7</option>
            <option value="GMT+8">GMT+8</option>
            <option value="GMT+9">GMT+9</option>
            <option value="GMT+9.5">GMT+9.5</option>
            <option value="GMT+10">GMT+10</option>
            <option value="GMT+11">GMT+11</option>
            <option value="GMT+12">GMT+12</option>
            <option value="GMT-1">GMT-1</option>
            <option value="GMT-2">GMT-2</option>
            <option value="GMT-3">GMT-3</option>
            <option value="GMT-4">GMT-4</option>
            <option value="GMT-5">GMT-5</option>
            <option value="GMT-6">GMT-6</option>
            <option value="GMT-7">GMT-7</option>
            <option value="GMT-8">GMT-8</option>
            <option value="GMT-9">GMT-9</option>
            <option value="GMT-10">GMT-10</option>
            <option value="GMT-11">GMT-11</option>
            <option value="GMT-12">GMT-12</option>
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

    // Calculate offset for source timezone
    const sourceOffset = getTimezoneOffset(inputTimezone);

    // Convert to all staff timezones
    let resultsHTML = `<h4>Time in all staff timezones:</h4><div class="timezone-results">`;

    timezones.forEach(tz => {
      const targetOffset = getTimezoneOffset(tz);
      // Calculate time difference between source and target timezone
      const timeDifference = (targetOffset - sourceOffset) * 3600000; // convert hours to milliseconds
      const adjustedTime = new Date(inputTime.getTime() + timeDifference);

      // Format the time
      const formattedTime = formatTime(adjustedTime);
      const timeOfDay = getTimeOfDay(adjustedTime.getHours());

      resultsHTML += `
        <div class="timezone-result-item">
          <div class="timezone-name">${tz} (${targetOffset >= 0 ? '+' : ''}${targetOffset} from EST)</div>
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