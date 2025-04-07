
/**
 * Timezone Converter for Psycho Hatcher Staff Portal
 * Helps staff convert between different timezones for better coordination
 */

document.addEventListener("DOMContentLoaded", function() {
  // Initialize the timezone converter once the DOM is loaded
  initializeTimezoneConverter();
});

function initializeTimezoneConverter() {
  // Create the converter UI if the staff list section exists
  const staffSection = document.getElementById("staff-list");
  if (!staffSection) return;
  
  // Create converter container
  const converterContainer = document.createElement("div");
  converterContainer.className = "timezone-converter";
  converterContainer.innerHTML = `
    <h3><i class="fas fa-clock"></i> Timezone Converter</h3>
    <div class="converter-form">
      <div class="time-input-group">
        <label for="time-input">Time:</label>
        <input type="time" id="time-input" value="${getCurrentTime()}">
      </div>
      
      <div class="timezone-select-group">
        <label for="from-timezone">From:</label>
        <select id="from-timezone">
          ${generateTimezoneOptions()}
        </select>
      </div>
      
      <div class="timezone-select-group">
        <label for="to-timezone">To:</label>
        <select id="to-timezone">
          ${generateTimezoneOptions()}
        </select>
      </div>
      
      <button id="convert-time-btn" class="btn">
        <i class="fas fa-exchange-alt"></i> Convert
      </button>
    </div>
    
    <div class="conversion-result" id="conversion-result">
      <div class="result-placeholder">Converted time will appear here</div>
    </div>
    
    <div class="timezone-quick-list">
      <h4>Staff Timezones</h4>
      <ul id="timezone-quick-list">
        <!-- Staff timezone list will be populated here -->
      </ul>
    </div>
  `;
  
  // Insert after the staff table
  const staffTable = staffSection.querySelector(".staff-container");
  if (staffTable && staffTable.nextSibling) {
    staffSection.insertBefore(converterContainer, staffTable.nextSibling);
  } else {
    staffSection.appendChild(converterContainer);
  }
  
  // Set default selections based on user's timezone
  setDefaultTimezones();
  
  // Populate quick timezone list from staff table
  populateQuickTimezoneList();
  
  // Add event listeners
  document.getElementById("convert-time-btn").addEventListener("click", convertTime);
  
  // Add quick conversion on timezone selection change
  document.getElementById("from-timezone").addEventListener("change", convertTime);
  document.getElementById("to-timezone").addEventListener("change", convertTime);
  document.getElementById("time-input").addEventListener("change", convertTime);
}

// Generate options for timezone select elements
function generateTimezoneOptions() {
  const timezones = [
    { code: "GMT", name: "Greenwich Mean Time (GMT)" },
    { code: "EST", name: "Eastern Standard Time (EST)" },
    { code: "CST", name: "Central Standard Time (CST)" },
    { code: "PST", name: "Pacific Standard Time (PST)" },
    { code: "IST", name: "Indian Standard Time (IST)" },
    { code: "AEST", name: "Australian Eastern Standard Time (AEST)" },
    { code: "AEDT", name: "Australian Eastern Daylight Time (AEDT)" },
    { code: "GMT+1", name: "Central European Time (GMT+1)" },
    { code: "GMT+2", name: "Eastern European Time (GMT+2)" },
    { code: "GMT+3", name: "Moscow Time (GMT+3)" },
    { code: "GMT+4", name: "Gulf Standard Time (GMT+4)" },
    { code: "GMT+5", name: "Pakistan Standard Time (GMT+5)" },
    { code: "GMT+6", name: "Bangladesh Standard Time (GMT+6)" },
    { code: "GMT+7", name: "Indochina Time (GMT+7)" },
    { code: "GMT+8", name: "China Standard Time (GMT+8)" },
    { code: "GMT+9", name: "Japan Standard Time (GMT+9)" },
    { code: "GMT+9.5", name: "Australian Central Standard Time (GMT+9.5)" },
    { code: "GMT+10", name: "Australian Eastern Standard Time (GMT+10)" },
    { code: "GMT+11", name: "Solomon Islands Time (GMT+11)" },
    { code: "GMT+12", name: "New Zealand Standard Time (GMT+12)" },
    { code: "GMT-1", name: "Cape Verde Time (GMT-1)" },
    { code: "GMT-2", name: "South Georgia Time (GMT-2)" },
    { code: "GMT-3", name: "Argentina Time (GMT-3)" },
    { code: "GMT-4", name: "Atlantic Standard Time (GMT-4)" },
    { code: "GMT-5", name: "Eastern Standard Time (GMT-5)" },
    { code: "GMT-6", name: "Central Standard Time (GMT-6)" },
    { code: "GMT-7", name: "Mountain Standard Time (GMT-7)" },
    { code: "GMT-8", name: "Pacific Standard Time (GMT-8)" },
    { code: "GMT-9", name: "Alaska Standard Time (GMT-9)" },
    { code: "GMT-10", name: "Hawaii-Aleutian Standard Time (GMT-10)" },
    { code: "GMT-11", name: "Samoa Standard Time (GMT-11)" },
    { code: "GMT-12", name: "Baker Island Time (GMT-12)" }
  ];
  
  return timezones.map(tz => 
    `<option value="${tz.code}">${tz.name}</option>`
  ).join("");
}

// Set default timezone selections based on user's local timezone
function setDefaultTimezones() {
  const fromSelect = document.getElementById("from-timezone");
  const toSelect = document.getElementById("to-timezone");
  
  if (!fromSelect || !toSelect) return;
  
  // Get the user's timezone offset in hours
  const offsetMinutes = new Date().getTimezoneOffset();
  const offsetHours = -offsetMinutes / 60; // Note: getTimezoneOffset() returns the opposite of what we need
  
  // Format the offset as GMT+X or GMT-X
  const offsetSign = offsetHours >= 0 ? "+" : "-";
  const absOffset = Math.abs(offsetHours);
  const formattedOffset = Number.isInteger(absOffset) ? 
    `GMT${offsetSign}${absOffset}` : 
    `GMT${offsetSign}${Math.floor(absOffset)}.5`;
  
  // Common timezone mappings
  const commonTimezones = {
    "GMT-5": "EST",
    "GMT-6": "CST",
    "GMT-8": "PST",
    "GMT+0": "GMT",
    "GMT+5.5": "IST",
    "GMT+10": "AEST",
    "GMT+11": "AEDT"
  };
  
  // Set the "from" timezone to the user's local timezone
  const userTimezone = commonTimezones[formattedOffset] || formattedOffset;
  
  // Find and select the option
  for (let i = 0; i < fromSelect.options.length; i++) {
    if (fromSelect.options[i].value === userTimezone) {
      fromSelect.selectedIndex = i;
      break;
    }
  }
  
  // Set "to" timezone to GMT by default
  for (let i = 0; i < toSelect.options.length; i++) {
    if (toSelect.options[i].value === "GMT") {
      toSelect.selectedIndex = i;
      break;
    }
  }
}

// Get current time formatted for time input
function getCurrentTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

// Convert time between timezones
function convertTime() {
  const timeInput = document.getElementById("time-input").value;
  const fromTimezone = document.getElementById("from-timezone").value;
  const toTimezone = document.getElementById("to-timezone").value;
  const resultElement = document.getElementById("conversion-result");
  
  if (!timeInput || !fromTimezone || !toTimezone) {
    resultElement.innerHTML = `<div class="result-error">Please fill in all fields</div>`;
    return;
  }
  
  try {
    // Parse the input time
    const [hours, minutes] = timeInput.split(":").map(num => parseInt(num, 10));
    const now = new Date();
    now.setHours(hours, minutes, 0, 0);
    
    // Get timezone offsets
    const fromOffset = getTimezoneOffset(fromTimezone);
    const toOffset = getTimezoneOffset(toTimezone);
    
    // Calculate the converted time
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000); // Convert to UTC
    const sourceTime = new Date(utcTime + (fromOffset * 3600000)); // Apply source timezone
    const targetTime = new Date(utcTime + (toOffset * 3600000)); // Apply target timezone
    
    // Format the result for display
    const sourceHours = formatHours(sourceTime.getHours());
    const sourceMinutes = sourceTime.getMinutes().toString().padStart(2, "0");
    const sourceAmPm = sourceTime.getHours() >= 12 ? "PM" : "AM";
    
    const targetHours = formatHours(targetTime.getHours());
    const targetMinutes = targetTime.getMinutes().toString().padStart(2, "0");
    const targetAmPm = targetTime.getHours() >= 12 ? "PM" : "AM";
    
    // Determine day difference
    const dayDiff = targetTime.getDate() - sourceTime.getDate();
    let dayText = "";
    
    if (dayDiff === 1 || (dayDiff === -30 && targetTime.getDate() === 1)) {
      dayText = " <span class='day-indicator'>(next day)</span>";
    } else if (dayDiff === -1 || (dayDiff === 30 && sourceTime.getDate() === 1)) {
      dayText = " <span class='day-indicator'>(previous day)</span>";
    }
    
    // Generate the result HTML
    resultElement.innerHTML = `
      <div class="result-success">
        <div class="result-time">
          <div class="result-from">
            <span class="time-label">${fromTimezone}</span>
            <span class="time-value">${sourceHours}:${sourceMinutes} ${sourceAmPm}</span>
          </div>
          <div class="result-arrow">
            <i class="fas fa-arrow-right"></i>
          </div>
          <div class="result-to">
            <span class="time-label">${toTimezone}</span>
            <span class="time-value">${targetHours}:${targetMinutes} ${targetAmPm}${dayText}</span>
          </div>
        </div>
        <div class="result-note">
          <i class="fas fa-info-circle"></i> 
          When it's ${sourceHours}:${sourceMinutes} ${sourceAmPm} in ${fromTimezone}, 
          it's ${targetHours}:${targetMinutes} ${targetAmPm} in ${toTimezone}${dayText}.
        </div>
      </div>
    `;
  } catch (error) {
    console.error("Conversion error:", error);
    resultElement.innerHTML = `
      <div class="result-error">
        Error converting time. Please check your inputs.
      </div>
    `;
  }
}

// Format hours for 12-hour display
function formatHours(hours) {
  return hours % 12 === 0 ? 12 : hours % 12;
}

// Get timezone offset in hours
function getTimezoneOffset(timezone) {
  // Handle common timezone codes
  switch (timezone) {
    case "GMT": return 0;
    case "EST": return -5;
    case "CST": return -6;
    case "PST": return -8;
    case "IST": return 5.5;
    case "AEST": return 10;
    case "AEDT": return 11;
  }
  
  // Parse GMT+X or GMT-X format
  if (timezone.startsWith("GMT+")) {
    return parseFloat(timezone.substring(4));
  } else if (timezone.startsWith("GMT-")) {
    return -parseFloat(timezone.substring(4));
  }
  
  // Default to GMT if unrecognized
  return 0;
}

// Populate quick timezone list from staff table
function populateQuickTimezoneList() {
  const staffTable = document.querySelector(".staff-table tbody");
  const quickList = document.getElementById("timezone-quick-list");
  
  if (!staffTable || !quickList) return;
  
  const staffRows = staffTable.querySelectorAll("tr");
  const staffTimezones = [];
  
  // Collect staff timezone information
  staffRows.forEach(row => {
    const nameCell = row.querySelector("td:first-child");
    const timezoneCell = row.querySelector("td:nth-child(3)");
    
    if (nameCell && timezoneCell) {
      const name = nameCell.textContent.trim();
      const timezone = timezoneCell.textContent.trim().split(" ")[0]; // Get just the timezone code
      
      if (name && timezone) {
        staffTimezones.push({ name, timezone });
      }
    }
  });
  
  // Generate HTML for the quick list
  staffTimezones.forEach(staff => {
    const listItem = document.createElement("li");
    
    // Create quick conversion buttons
    listItem.innerHTML = `
      <span class="staff-name">${staff.name}</span>
      <span class="staff-timezone">${staff.timezone}</span>
      <button class="quick-convert-btn" data-timezone="${staff.timezone}">
        <i class="fas fa-exchange-alt"></i> Convert
      </button>
    `;
    
    quickList.appendChild(listItem);
  });
  
  // Add event listeners to quick convert buttons
  document.querySelectorAll(".quick-convert-btn").forEach(btn => {
    btn.addEventListener("click", function() {
      const timezone = this.getAttribute("data-timezone");
      document.getElementById("to-timezone").value = timezone;
      convertTime();
    });
  });
}

// Add styling for the timezone converter
document.addEventListener("DOMContentLoaded", function() {
  const style = document.createElement("style");
  style.textContent = `
    .timezone-converter {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin-top: 30px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    }
    
    .dark-mode .timezone-converter {
      background-color: #2a2a2a;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    }
    
    .timezone-converter h3 {
      margin-top: 0;
      color: var(--primary-color);
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .converter-form {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      margin-bottom: 20px;
    }
    
    .time-input-group, .timezone-select-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    
    .time-input-group {
      flex: 0 0 100px;
    }
    
    .timezone-select-group {
      flex: 1;
      min-width: 200px;
    }
    
    .converter-form select, .converter-form input {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }
    
    .dark-mode .converter-form select, .dark-mode .converter-form input {
      background-color: #333;
      color: #fff;
      border-color: #555;
    }
    
    .converter-form button {
      align-self: flex-end;
      margin-top: 19px;
    }
    
    .conversion-result {
      background-color: #fff;
      border-radius: 6px;
      padding: 15px;
      margin-bottom: 20px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    }
    
    .dark-mode .conversion-result {
      background-color: #333;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    }
    
    .result-placeholder {
      color: #999;
      text-align: center;
      font-style: italic;
    }
    
    .result-error {
      color: #d32f2f;
      font-weight: bold;
    }
    
    .result-success {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .result-time {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 20px;
    }
    
    .result-from, .result-to {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .time-label {
      font-weight: bold;
      color: var(--primary-color);
    }
    
    .time-value {
      font-size: 24px;
      margin-top: 5px;
    }
    
    .result-arrow {
      color: var(--primary-color);
      font-size: 20px;
    }
    
    .result-note {
      font-size: 14px;
      color: #555;
      text-align: center;
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px dashed #ddd;
    }
    
    .dark-mode .result-note {
      color: #bbb;
      border-top-color: #555;
    }
    
    .day-indicator {
      color: #ff9800;
      font-size: 14px;
      font-weight: bold;
    }
    
    .timezone-quick-list {
      margin-top: 20px;
    }
    
    .timezone-quick-list h4 {
      margin-top: 0;
      margin-bottom: 10px;
      color: var(--primary-color);
    }
    
    .timezone-quick-list ul {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    
    .timezone-quick-list li {
      display: flex;
      align-items: center;
      gap: 10px;
      background-color: #fff;
      padding: 8px 15px;
      border-radius: 20px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
    
    .dark-mode .timezone-quick-list li {
      background-color: #333;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
    }
    
    .staff-name {
      font-weight: bold;
    }
    
    .staff-timezone {
      color: var(--primary-color);
      background-color: rgba(237, 31, 39, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 12px;
    }
    
    .quick-convert-btn {
      border: none;
      background-color: transparent;
      color: #777;
      cursor: pointer;
      padding: 3px 6px;
      border-radius: 3px;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 12px;
    }
    
    .quick-convert-btn:hover {
      background-color: var(--primary-light);
      color: white;
    }
    
    @media (max-width: 768px) {
      .converter-form {
        flex-direction: column;
      }
      
      .converter-form button {
        align-self: flex-start;
        width: 100%;
      }
      
      .result-time {
        flex-direction: column;
        gap: 10px;
      }
      
      .result-arrow {
        transform: rotate(90deg);
      }
    }
  `;
  
  document.head.appendChild(style);
});
