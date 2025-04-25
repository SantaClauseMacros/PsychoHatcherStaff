
// Timezone Conversion Tool for Staff Portal
document.addEventListener('DOMContentLoaded', function() {
  initializeTimezoneConverter();
});

function initializeTimezoneConverter() {
  // Create and add converter to the DOM
  const converterHTML = `
    <div class="timezone-converter-container">
      <h3><i class="fas fa-globe"></i> Timezone Converter</h3>
      <div class="converter-form">
        <div class="time-input-group">
          <input type="datetime-local" id="source-time" class="time-input">
          <select id="source-timezone" class="timezone-select">
            <option value="GMT">GMT (Greenwich Mean Time)</option>
            <option value="EST">EST (Eastern Standard Time)</option>
            <option value="CST">CST (Central Standard Time)</option>
            <option value="IST">IST (Indian Standard Time)</option>
            <option value="AEDT">AEDT (Australian Eastern Daylight Time)</option>
            <option value="GMT+1">GMT+1</option>
            <option value="GMT+2">GMT+2</option>
            <option value="GMT+9.5">GMT+9.5</option>
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
    
    // Get all available timezones from staff list
    const timezones = getStaffTimezones();
    
    // Calculate offset for source timezone
    const sourceOffset = getTimezoneOffset(inputTimezone);
    
    // Convert to all staff timezones
    let resultsHTML = `<h4>Time in all staff timezones:</h4><div class="timezone-results">`;
    
    timezones.forEach(tz => {
      const targetOffset = getTimezoneOffset(tz);
      const adjustedTime = new Date(inputTime.getTime() + (targetOffset - sourceOffset) * 3600000);
      
      // Format the time
      const formattedTime = formatTime(adjustedTime);
      const timeOfDay = getTimeOfDay(adjustedTime.getHours());
      
      resultsHTML += `
        <div class="timezone-result-item">
          <div class="timezone-name">${tz}</div>
          <div class="converted-time">${formattedTime} ${timeOfDay}</div>
        </div>
      `;
    });
    
    resultsHTML += `</div>`;
    resultsContainer.innerHTML = resultsHTML;
    resultsContainer.style.display = 'block';
  }
  
  function getStaffTimezones() {
    // Extract unique timezones from staff table
    const staffTable = document.querySelector('.staff-table');
    const timezones = new Set(['GMT', 'EST', 'CST', 'IST', 'AEDT', 'GMT+1', 'GMT+2', 'GMT+9.5']);
    
    if (staffTable) {
      const timezoneElements = staffTable.querySelectorAll('tbody tr td:nth-child(3)');
      timezoneElements.forEach(el => {
        const timezone = el.textContent.trim().split(' ')[0];
        if (timezone && timezone !== '-') {
          timezones.add(timezone);
        }
      });
    }
    
    return Array.from(timezones);
  }
  
  function getTimezoneOffset(timezone) {
    // Return offset in hours
    if (timezone === 'GMT') return 4;
    if (timezone === 'EST') return 0; // Eastern Standard Time
    if (timezone === 'CST') return -1; // Central Standard Time
    if (timezone === 'IST') return 9.5;
    if (timezone === 'AEDT') return 11;
    
    // Handle GMT+X format
    if (timezone.startsWith('GMT+')) {
      return parseFloat(timezone.substring(4));
    }
    if (timezone.startsWith('GMT-')) {
      return -parseFloat(timezone.substring(4));
    }
    
    return 0; // Default to GMT
  }
  
  // Helper function to convert between timezones more accurately
  function convertBetweenTimezones(date, fromOffset, toOffset) {
    const utcDate = new Date(date);
    
    // Create a new date using direct UTC methods
    const utcYear = utcDate.getUTCFullYear();
    const utcMonth = utcDate.getUTCMonth();
    const utcDay = utcDate.getUTCDate();
    const utcHours = utcDate.getUTCHours();
    const utcMinutes = utcDate.getUTCMinutes();
    const utcSeconds = utcDate.getUTCSeconds();
    
    // Apply the target timezone offset
    return new Date(Date.UTC(utcYear, utcMonth, utcDay, utcHours + (toOffset - fromOffset), utcMinutes, utcSeconds));
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
