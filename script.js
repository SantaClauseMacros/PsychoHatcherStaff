// Function to update timezone times
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
      let offset = 0;
      if (typeof window.getTimezoneOffset === 'function') {
        offset = window.getTimezoneOffset(timezoneText);
      } else {
        // Fallback if the function isn't available yet
        console.warn("Timezone offset function not available, using fallback");
        if (timezoneText === "GMT") {
          offset = 4;
        } else if (timezoneText === "EST") {
          offset = 0; // Eastern Standard Time baseline
        } else if (timezoneText === "CST") {
          offset = -1; // Central Standard Time
        } else if (timezoneText === "IST") {
          offset = 9.5;
        } else if (timezoneText === "AEDT") {
          offset = 11;
        } else if (timezoneText.startsWith("GMT+")) {
          offset = 4 + parseFloat(timezoneText.substring(4)); // GMT+X is 4+X from EST
        } else if (timezoneText.startsWith("GMT-")) {
          offset = 4 - parseFloat(timezoneText.substring(4)); // GMT-X is 4-X from EST
        } else if (timezoneText.includes("+")) {
          offset = 4 + parseFloat(timezoneText.split("+")[1]); // Same as GMT+X
        }
      }

      // Use direct UTC methods for more reliable timezone calculation
      const utcYear = now.getUTCFullYear();
      const utcMonth = now.getUTCMonth();
      const utcDate = now.getUTCDate();
      const utcHours = now.getUTCHours();
      const utcMinutes = now.getUTCMinutes();
      const utcSeconds = now.getUTCSeconds();
      
      // Handle half-hour offsets correctly
      const offsetHours = Math.floor(offset);
      const offsetMinutes = (offset % 1) * 60; // Convert decimal part to minutes

      // Create a new date using UTC time + the timezone offset
      time = new Date(
        Date.UTC(
          utcYear,
          utcMonth,
          utcDate,
          utcHours + offsetHours,
          utcMinutes + offsetMinutes,
          utcSeconds,
        ),
      );

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
          showNotification("Timezone times refreshed successfully!", "success");
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

// Mobile navigation enhancement
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM fully loaded - initializing staff portal");

  // Check for logged in user and initialize account customization
  initializeAccountCustomization();

  // Initialize password review panel for Santa
  initializePasswordReviewPanel();

  // Initialize scroll animations
  initScrollAnimations();

  // Initialize mobile-friendly menu
  initializeMobileMenu();

  // Add mobile menu toggle button
  const nav = document.querySelector("nav");
  const mobileMenuBtn = document.createElement("button");
  mobileMenuBtn.className = "mobile-menu-toggle";
  mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i> Menu';

  // Initialize timezone display with priority
  console.log("Checking for staff table");
  if (document.querySelector(".staff-table")) {
    console.log("Staff table found - initializing timezone display");

    // Delay slightly to ensure DOM is fully processed
    setTimeout(() => {
      // Add refresh controls to the staff list section
      addRefreshControls();

      // Force initial update of timezones
      updateTimezones();

      // Show notification of initialization
      showNotification("Staff timezone display initialized", "info");
    }, 500);
  }

  if (window.innerWidth <= 768) {
    // Insert before the navigation
    if (nav) {
      document.body.insertBefore(mobileMenuBtn, nav);

      // Hide nav by default on mobile
      nav.style.display = "none";

      // Toggle navigation visibility on mobile
      mobileMenuBtn.addEventListener("click", function () {
        if (nav.style.display === "none") {
          nav.style.display = "block";
          mobileMenuBtn.innerHTML = '<i class="fas fa-times"></i> Close';
        } else {
          nav.style.display = "none";
          mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i> Menu';
        }
      });

      // Hide menu when clicking on a nav item
      const navLinks = document.querySelectorAll("nav a");
      navLinks.forEach((link) => {
        link.addEventListener("click", function () {
          nav.style.display = "none";
          mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i> Menu';
        });
      });
    }
  }

  // Add smooth scrolling to navigation links
  document.querySelectorAll("nav a").forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href && href.startsWith("#")) {
        e.preventDefault();
        const targetElement = document.querySelector(href);
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 80,
            behavior: "smooth",
          });
        }
      }
    });
  });

  // Add a direct refresh button click if it exists
  const refreshButton = document.getElementById("refresh-times-btn");
  if (refreshButton) {
    console.log("Found refresh button - triggering initial click");
    // Force a click after everything is loaded
    setTimeout(() => {
      refreshButton.click();
    }, 1000);
  }
});

// Site Security Enhancements
document.addEventListener("contextmenu", function (e) {
  if (sessionStorage.getItem("staffLoggedIn") !== "true") {
    e.preventDefault();
    showNotification("Right-click disabled for security", "error");
    return false;
  }
});

// Prevent copying credentials on the staff portal
document.addEventListener("copy", function (e) {
  if (e.target.closest(".credential-box") && !e.target.closest(".copy-btn")) {
    e.preventDefault();
    showNotification("Use the copy button instead", "info");
  }
});

// Set static logo
const logoPreview = document.getElementById("logo-preview");
const footerLogo = document.getElementById("footer-logo");

// Logo switcher functionality with color themes - using the new specified image formats
const logos = {
  red: {
    path: "PsychoHatcher.png",
    colors: {
      primaryColor: "#ED1F27",
      primaryLight: "#ff5252",
      primaryDark: "#b71c1c",
      secondaryColor: "#f44336",
    },
    displayName: "Red Theme",
  },
  black: {
    path: "PsychoHatcherGreen.png", // This is confusing but using the file you provided
    colors: {
      primaryColor: "#212121",
      primaryLight: "#484848",
      primaryDark: "#000000",
      secondaryColor: "#424242",
    },
    displayName: "Black Theme",
  },
  pureWhite: {
    path: "PsychoHatcherWhite.png",
    colors: {
      primaryColor: "#212121",
      primaryLight: "#484848",
      primaryDark: "#000000",
      secondaryColor: "#FFFFFF",
    },
    displayName: "PureWhite Theme",
  },
};

// Load static logo on page load
window.addEventListener("DOMContentLoaded", () => {
  // Set static logo from project files
  const currentLogo = localStorage.getItem("selectedLogo") || "red";
  switchLogo(currentLogo);

  // Replace upload button with logo switcher
  const uploadBtn = document.querySelector(".upload-btn");
  if (uploadBtn) {
    uploadBtn.innerHTML = '<i class="fas fa-images"></i> Switch Logo';
    uploadBtn.style.cursor = "pointer";
    uploadBtn.style.opacity = "1";
    uploadBtn.title = "Click to change logo style";
    uploadBtn.onclick = function () {
      showLogoSwitcher();
    };
  }

  // Disable logo upload functionality
  const logoUpload = document.getElementById("logo-upload");
  if (logoUpload) {
    logoUpload.disabled = true;
  }

  // Initialize custom components
  initializeTooltips();

  // Check if user is already logged in
  if (sessionStorage.getItem("staffLoggedIn") === "true") {
    showNotification("Welcome back to the Staff Portal!", "info");
  }

  // Initialize suggestion system
  initializeSuggestionSystem();
});

// Function to switch logo throughout the site and update color theme
function switchLogo(style) {
  const logoPreview = document.getElementById("logo-preview");
  const footerLogo = document.getElementById("footer-logo");
  const loginLogo = document.getElementById("login-logo-img");

  if (logos[style]) {
    console.log(`Switching to logo: ${logos[style].path}`);

    // Update logos with error handling
    if (logoPreview) {
      logoPreview.src = logos[style].path;
      logoPreview.style.objectFit = "contain";
      logoPreview.style.padding = "4px";
      logoPreview.onerror = function () {
        console.error(`Failed to load logo-preview: ${logos[style].path}`);
        this.src = "PsychoHatcher.png"; // Fallback
      };
    }

    if (footerLogo) {
      footerLogo.src = logos[style].path;
      footerLogo.onerror = function () {
        console.error(`Failed to load footer-logo: ${logos[style].path}`);
        this.src = "PsychoHatcher.png"; // Fallback
      };
    }

    if (loginLogo) {
      loginLogo.src = logos[style].path;
      loginLogo.onerror = function () {
        console.error(`Failed to load login-logo: ${logos[style].path}`);
        this.src = "PsychoHatcher.png"; // Fallback
      };
    }

    // Apply color theme
    applyColorTheme(logos[style].colors);

    localStorage.setItem("selectedLogo", style);
    showNotification(`Theme changed to ${style}`, "success");
  } else {
    console.error(`Invalid logo style: ${style}`);
    showNotification(`Failed to change theme`, "error");
  }
}

// Function to apply color theme to CSS variables
function applyColorTheme(colors) {
  const root = document.documentElement;

  // Update CSS variables
  root.style.setProperty("--primary-color", colors.primaryColor);
  root.style.setProperty("--primary-light", colors.primaryLight);
  root.style.setProperty("--primary-dark", colors.primaryDark);
  root.style.setProperty("--secondary-color", colors.secondaryColor);

  // Update header background
  const header = document.querySelector("header");
  if (header) {
    header.style.background = `linear-gradient(135deg, ${colors.primaryColor}, ${colors.primaryDark})`;
  }

  // Update navigation background
  const nav = document.querySelector("nav");
  if (nav) {
    nav.style.backgroundColor = colors.primaryLight;
  }

  // Update footer background
  const footer = document.querySelector("footer");
  if (footer) {
    footer.style.backgroundColor = colors.primaryDark;
  }

  // Update login overlay if present
  const loginOverlay = document.querySelector(".login-overlay");
  if (loginOverlay) {
    loginOverlay.style.background = `linear-gradient(135deg, ${colors.primaryDark}, ${colors.primaryColor})`;
  }
}

// Function to show logo switcher dialog
function showLogoSwitcher() {
  // Create logo switcher overlay
  const overlay = document.createElement("div");
  overlay.className = "logo-switcher-overlay";

  const switcher = document.createElement("div");
  switcher.className = "logo-switcher-container";

  // Add heading
  const heading = document.createElement("h3");
  heading.textContent = "Choose Logo & Theme Style";
  switcher.appendChild(heading);

  // Add theme image showcasing all three themes
  const themeImage = document.createElement("img");
  themeImage.src = "attached_assets/theme_logos.png";
  themeImage.alt = "Theme Options";
  themeImage.style.width = "100%";
  themeImage.style.maxWidth = "500px";
  themeImage.style.marginBottom = "20px";
  switcher.appendChild(themeImage);

  // Create logo options - limit to only 3 options
  const logoOptions = document.createElement("div");
  logoOptions.className = "logo-options";

  // Only show these three options
  const displayStyles = ["red", "black", "pureWhite"];

  for (const style of displayStyles) {
    if (logos[style]) {
      const option = document.createElement("div");
      option.className = "logo-option";

      // Create preview of the theme colors
      const colorPreview = document.createElement("div");
      colorPreview.className = "color-preview";
      colorPreview.style.display = "flex";
      colorPreview.style.marginTop = "10px";

      // Add color swatches
      const colors = [
        logos[style].colors.primaryColor,
        logos[style].colors.primaryLight,
        logos[style].colors.primaryDark,
        logos[style].colors.secondaryColor,
      ];

      colors.forEach((color) => {
        const swatch = document.createElement("div");
        swatch.style.width = "20px";
        swatch.style.height = "20px";
        swatch.style.backgroundColor = color;
        swatch.style.borderRadius = "50%";
        swatch.style.margin = "0 5px";
        swatch.style.border = "1px solid #ddd";
        colorPreview.appendChild(swatch);
      });

      const label = document.createElement("div");
      label.textContent =
        logos[style].displayName ||
        style.charAt(0).toUpperCase() + style.slice(1) + " Theme";
      label.style.fontSize = "16px";
      label.style.fontWeight = "bold";
      label.style.color = logos[style].colors.primaryColor;
      label.style.marginBottom = "10px";

      option.appendChild(label);
      option.appendChild(colorPreview);

      // Add hover effect
      option.style.transition = "all 0.3s ease";
      option.style.padding = "15px";
      option.style.borderRadius = "8px";
      option.style.border = "2px solid transparent";
      option.style.cursor = "pointer";

      // Apply theme preview on hover
      option.addEventListener("mouseenter", () => {
        option.style.backgroundColor = logos[style].colors.primaryLight + "20"; // 20% opacity
        option.style.borderColor = logos[style].colors.primaryColor;
      });

      option.addEventListener("mouseleave", () => {
        option.style.backgroundColor = "";
        option.style.borderColor = "transparent";
      });

      option.onclick = () => {
        console.log(`Switching to logo style: ${style}`);
        switchLogo(style);
        document.body.removeChild(overlay);
      };

      logoOptions.appendChild(option);
    }
  }

  switcher.appendChild(logoOptions);

  // Add close button
  const closeBtn = document.createElement("button");
  closeBtn.className = "btn";
  closeBtn.textContent = "Close";
  closeBtn.onclick = () => document.body.removeChild(overlay);
  closeBtn.style.marginTop = "20px";
  switcher.appendChild(closeBtn);

  overlay.appendChild(switcher);
  document.body.appendChild(overlay);
}

// Notification System
function showNotification(message, type = "info") {
  // If a notification is already visible, remove it first
  const existingNotification = document.querySelector(".notification");
  if (existingNotification) {
    if (existingNotification.classList.contains("notification-show")) {
      existingNotification.classList.add("notification-closing");
      setTimeout(() => {
        if (document.body.contains(existingNotification)) {
          existingNotification.remove();
        }
        // Create and show new notification after removing the old one
        createAndShowNotification(message, type);
      }, 300);
      return;
    } else {
      existingNotification.remove();
    }
  }

  // Create and show notification
  createAndShowNotification(message, type);
}

// Make sure status display updates on page load
document.addEventListener('DOMContentLoaded', function() {
  // Initialize status display if the element exists
  const statusDisplay = document.getElementById('macro-status-display');
  if (statusDisplay) {
    console.log("Status display element found - initializing");
    // Ensure the status-script.js functions are available
    if (typeof updatePublicStatusDisplay === 'function') {
      updatePublicStatusDisplay();
    } else {
      // Load status-script.js if not already loaded
      const script = document.createElement('script');
      script.src = 'status-script.js';
      script.onload = function() {
        if (typeof updatePublicStatusDisplay === 'function') {
          updatePublicStatusDisplay();
        } else {
          console.error("Status display function not found after loading script");
        }
      };
      document.head.appendChild(script);
    }
  }
});

// Helper function to create and show a notification
function createAndShowNotification(message, type) {
  // Set icon based on type
  let icon = "info-circle";
  if (type === "success") icon = "check-circle";
  if (type === "error") icon = "exclamation-circle";

  // Create notification element
  const notificationElement = document.createElement("div");
  notificationElement.className = `notification ${type}`;
  notificationElement.innerHTML = `
    <div class="notification-content">
      <i class="fas fa-${icon}"></i>
      <p>${message}</p>
    </div>
    <button class="notification-close"><i class="fas fa-times"></i></button>
  `;

  // Add to document
  document.body.appendChild(notificationElement);

  // Add event listener to close button
  notificationElement
    .querySelector(".notification-close")
    .addEventListener("click", () => {
      notificationElement.classList.add("notification-closing");
      setTimeout(() => {
        if (document.body.contains(notificationElement)) {
          notificationElement.remove();
        }
      }, 300);
    });

  // Auto hide after 5 seconds
  setTimeout(() => {
    if (document.body.contains(notificationElement)) {
      notificationElement.classList.add("notification-closing");
      setTimeout(() => {
        if (document.body.contains(notificationElement)) {
          notificationElement.remove();
        }
      }, 300);
    }
  }, 5000);

  // Animate in (delayed slightly to ensure DOM update)
  setTimeout(() => {
    notificationElement.classList.add("notification-show");
  }, 10);
}

// Navigation
const navLinks = document.querySelectorAll("nav a");

navLinks.forEach((link) => {
  link.addEventListener("click", function (e) {
    // Remove active class from all links
    navLinks.forEach((l) => l.classList.remove("active"));
    // Add active class to clicked link
    this.classList.add("active");
  });
});

// Add scroll animations to elements
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll(
    ".section-card, .guide-card, .info-box, h2, h3",
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    },
  );

  animatedElements.forEach((element) => {
    element.classList.add("animate-ready");
    observer.observe(element);
  });
}

// Initialize scroll animations
document.addEventListener("DOMContentLoaded", function () {
  initScrollAnimations();

  // Add dark mode toggle
  const darkModeToggle = document.createElement("button");
  darkModeToggle.className = "dark-mode-toggle";
  darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  darkModeToggle.title = "Toggle Dark Mode";
  document.body.appendChild(darkModeToggle);

  // Function to update dark mode UI
  function updateDarkModeUI(isDarkMode) {
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
      darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
      darkModeToggle.title = "Toggle Light Mode";
    } else {
      document.body.classList.remove("dark-mode");
      darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
      darkModeToggle.title = "Toggle Dark Mode";
    }
  }

  darkModeToggle.addEventListener("click", function () {
    const isDarkMode = !document.body.classList.contains("dark-mode");
    updateDarkModeUI(isDarkMode);
    localStorage.setItem("darkMode", isDarkMode ? "enabled" : "disabled");

    // Also update user preferences if logged in
    const currentUser = sessionStorage.getItem("loggedInUser");
    if (currentUser) {
      try {
        const userPrefs = JSON.parse(localStorage.getItem(`userPrefs_${currentUser}`) || "{}");
        userPrefs.darkMode = isDarkMode;
        localStorage.setItem(`userPrefs_${currentUser}`, JSON.stringify(userPrefs));
      } catch (e) {
        console.error("Error updating user preferences:", e);
      }
    }

    showNotification(isDarkMode ? "Dark mode enabled" : "Light mode enabled", "success");
  });

  // Check for saved dark mode preference
  const savedDarkMode = localStorage.getItem("darkMode") === "enabled";

  // If user is logged in, prioritize their preferences
  const currentUser = sessionStorage.getItem("loggedInUser");
  if (currentUser) {
    try {
      const userPrefs = JSON.parse(localStorage.getItem(`userPrefs_${currentUser}`) || "{}");
      // If user has a dark mode preference, use that instead
      if (userPrefs.darkMode !== undefined) {
        updateDarkModeUI(userPrefs.darkMode);
        return;
      }
    } catch (e) {
      console.error("Error loading user preferences:", e);
    }
  }

  // Fall back to general preference
  updateDarkModeUI(savedDarkMode);
});

// Add typing animation to headers
function initTypingEffect() {
  const headers = document.querySelectorAll("h1, h2");

  headers.forEach((header, index) => {
    const text = header.textContent;

    header.innerHTML = "";
    header.style.visibility = "visible";

    setTimeout(() => {
      let i = 0;
      const typeInterval = setInterval(() => {
        if (i < text.length) {
          header.innerHTML += text.charAt(i);
          i++;
        } else {
          clearInterval(typeInterval);
        }
      }, 50);
    }, index * 300);
  });
}

// Skip typing animation for now to avoid overriding existing content
// document.addEventListener('DOMContentLoaded', initTypingEffect);

// Apply active class to current section in nav
function setActiveNavLink() {
  const sections = document.querySelectorAll("main section");
  let currentSection = "";

  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;

    if (window.scrollY >= sectionTop - 200) {
      currentSection = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${currentSection}`) {
      link.classList.add("active");
    }
  });
}

window.addEventListener("scroll", setActiveNavLink);

// Unified Notification System - Also used by status-script.js
function showNotification(message, type = "info") {
  // Create notification element if it doesn't exist
  let notification = document.querySelector(".notification");

  if (notification) {
    // If a notification is already visible, remove it first
    if (notification.classList.contains("notification-show")) {
      notification.classList.remove("notification-show");
      notification.classList.add("notification-closing");

      setTimeout(() => {
        if (notification && document.body.contains(notification)) {
          notification.remove();
        }
        // Show the new notification after removing the existing one
        showNotification(message, type);
      }, 300);
      return;
    }

    // Remove any existing notification that's not visible
    notification.remove();
  }

  // Create new notification
  notification = document.createElement("div");
  notification.className = `notification ${type}`;

  // Set icon based on type
  let icon = "info-circle";
  if (type === "success") icon = "check-circle";
  if (type === "error") icon = "exclamation-circle";
  if (type === "warning") icon = "exclamation-triangle";

  // Create notification content
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas fa-${icon}"></i>
      <div class="notification-message">${message}</div>
    </div>
    <button class="notification-close"><i class="fas fa-times"></i></button>
  `;

  // Add to DOM
  document.body.appendChild(notification);

  // Show notification with slight delay to ensure proper animation
  setTimeout(() => {
    notification.classList.add("notification-show");
  }, 10);

  // Add close functionality
  const closeButton = notification.querySelector(".notification-close");
  if (closeButton) {
    closeButton.addEventListener("click", () => {
      notification.classList.remove("notification-show");
      notification.classList.add("notification-closing");
      setTimeout(() => {
        if (notification && document.body.contains(notification)) {
          notification.remove();
        }
      }, 300);
    });
  }

  // Auto hide after 5 seconds
  setTimeout(() => {
    if (notification && document.body.contains(notification)) {
      notification.classList.remove("notification-show");
      notification.classList.add("notification-closing");
      setTimeout(() => {
        if (notification && document.body.contains(notification)) {
          notification.remove();
        }
      }, 300);
    }
  }, 5000);
}

// Add scroll progress bar
document.addEventListener("DOMContentLoaded", function () {
  // Create progress bar
  const progressBar = document.createElement("div");
  progressBar.className = "scroll-progress";
  document.body.appendChild(progressBar);

  // Update progress bar width on scroll
  window.addEventListener("scroll", () => {
    const scrollTop =
      document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight =
      documentdocumentElement.scrollHeight -
      document.documentElement.clientHeight;
    const scrollProgress = (scrollTop / scrollHeight) * 100;
    progressBar.style.width = scrollProgress + "%";

    // Show back to top button when scrolled down
    const backToTopBtn = document.querySelector(".back-to-top");
    if (scrollTop > 300) {
      backToTopBtn.classList.add("visible");
    } else {
      backToTopBtn.classList.remove("visible");
    }
  });

  // Add back to top button
  const backToTopBtn = document.createElement("button");
  backToTopBtn.className = "back-to-top";
  backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
  backToTopBtn.title = "Back to top";
  document.body.appendChild(backToTopBtn);

  // Scroll to top when button is clicked
  backToTopBtn.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
});

// Add interactive checklists for guide pages
document.addEventListener("DOMContentLoaded", function () {
  const guidePage = document.querySelector(".guide-content.active");

  if (guidePage) {
    const checklistItems = guidePage.querySelectorAll(
      '.checklist-item input[type="checkbox"]',
    );

    checklistItems.forEach((checkbox) => {
      checkbox.addEventListener("change", function () {
        const parentItem = this.closest(".checklist-item");

        if (this.checked) {
          parentItem.style.textDecoration = "line-through";
          parentItem.style.opacity = "0.7";
        } else {
          parentItem.style.textDecoration = "none";
          parentItem.style.opacity = "1";
        }

        // Count checked items
        const guide = this.closest(".guide-content");
        const totalItems = guide.querySelectorAll(".checklist-item").length;
        const checkedItems = guide.querySelectorAll(
          '.checklist-item input[type="checkbox"]:checked',
        ).length;

        // If all items are checked, show success notification
        if (checkedItems === totalItems) {
          showNotification(
            "All items checked! Issue should be resolved.",
            "success",
          );
        }
      });
    });
  }
});

// Initialize tooltips
function initializeTooltips() {
  // Add hoverable class to existing tooltips
  document.querySelectorAll(".tooltip").forEach((tooltip) => {
    tooltip.classList.add("hoverable");
  });
}

// Suggestion system
document.addEventListener("DOMContentLoaded",function () {
  const submitBtn = document.getElementById("submit-suggestion");
  if (submitBtn) {
    submitBtn.addEventListener("click", submitSuggestion);
  }

  // Initialize suggestion area if it exists
  const suggestionStatus = document.getElementById("suggestion-status");
  if (suggestionStatus) {
    displaySuggestions();
  }

  // Copy template functionality
  document.querySelectorAll(".copy-template").forEach((button) => {
    button.addEventListener("click", function () {
      const templateType = this.getAttribute("data-template");
      const contentDiv = this.closest(".template-content");
      const paragraphs = contentDiv.querySelectorAll("p");

      let templateText = "";
      paragraphs.forEach((p) => {
        // Remove quotes from the text
        let cleanText = p.textContent.replace(/["']/g, "");
        templateText += cleanText + "\n\n";
      });

      navigator.clipboard.writeText(templateText.trim()).then(() => {
        showNotification("Template copied to clipboard!", "success");

        // Visual feedback
        this.textContent = "Copied!";
        setTimeout(() => {
          this.textContent = "Copy Template";
        }, 2000);
      });
    });
  });
});

function submitSuggestion() {
  const suggestionTextarea = document.getElementById("suggestion-text");
  const suggestionText = suggestionTextarea.value.trim();
  const statusDiv = document.getElementById("suggestion-status");

  if (suggestionText === "") {
    statusDiv.className = "error";
    statusDiv.innerHTML = "<p>Please enter a suggestion before submitting.</p>";
    statusDiv.style.display = "block";
    showNotification("Please enter a suggestion before submitting.", "error");
    return;
  }

  // Get current user or use default
  const currentUser = sessionStorage.getItem("loggedInUser") || "Anonymous";

  // Format the suggestion with date, time and user
  const now = new Date();
  const formattedDate = now.toLocaleString();

  // Get existing suggestions or create new array
  let suggestions = JSON.parse(localStorage.getItem("staffSuggestions")) || [];

  // Create new suggestion object
  const newSuggestion = {
    text: suggestionText,
    author: currentUser,
    date: now.toISOString(),
    status: "pending",
    votes: 0,
    votedUsers: [],
  };

  // Add to suggestions array
  suggestions.push(newSuggestion);

  // Save to localStorage
  localStorage.setItem("staffSuggestions", JSON.stringify(suggestions));

  // Show success message
  statusDiv.className = "success";
  statusDiv.innerHTML = `
    <p>Your suggestion has been saved! Thank you for your contribution.</p>
    <div class="suggestion-item">
      <div class="suggestion-header">
        <span class="suggestion-author">${currentUser}</span>
        <span class="suggestion-date">${formattedDate}</span>
      </div>
      <div class="suggestion-content">${suggestionText}</div>
      <div class="suggestion-footer">
        <span class="suggestion-status pending">Under Review</span>
      </div>
    </div>
  `;
  statusDiv.style.display = "block";

  // Clear the input
  suggestionTextarea.value = "";

  // Display all suggestions
  displaySuggestions();

  showNotification("Suggestion submitted successfully!", "success");
}

// Function to display all suggestions
function displaySuggestions() {
  const suggestionStatus = document.getElementById("suggestion-status");
  if (!suggestionStatus) return;

  //// Get suggestions from local storage
  const staffSuggestions =
    JSON.parse(localStorage.getItem("staffSuggestions")) || [];

  if (staffSuggestions.length === 0) {
    suggestionStatus.innerHTML =
      '<p class="no-suggestions">No suggestions have been submitted yet. Be the first to suggest an improvement!</p>';
    return;
  }

  // Sort suggestions by date (newest first)
  staffSuggestions.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Build HTML for suggestions list
  let suggestionsHTML = "<h4>Staff Suggestions Board</h4>";
  suggestionsHTML += `<p class="suggestions-count">${staffSuggestions.length} suggestion${staffSuggestions.length !== 1 ? "s" : ""} submitted</p>`;
  suggestionsHTML += '<ul class="suggestions-list">';

  staffSuggestions.forEach((suggestion, index) => {
    // Format date for better readability
    const date = new Date(suggestion.date);
    const formattedDate = `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

    // Create status badge
    let statusClass = "";
    let statusText = "";

    switch (suggestion.status) {
      case "approved":
        statusClass = "approved";
        statusText = "Approved";
        break;
      case "rejected":
        statusClass = "rejected";
        statusText = "Rejected";
        break;
      default:
        statusClass = "pending";
        statusText = "Under Review";
    }

    suggestionsHTML += `
      <li>
        <div class="suggestion-header">
          <span class="suggestion-author">${suggestion.author}</span>
          <span class="suggestion-date">${formattedDate}</span>
        </div>
        <div class="suggestion-content">${suggestion.text}</div>
        <div class="suggestion-footer">
          <span class="suggestion-status ${statusClass}">${statusText}</span>
          <div class="suggestion-actions">
            <button class="btn-vote upvote" data-index="${index}">
              <i class="fas fa-thumbs-up"></i> <span class="vote-count">${suggestion.votes}</span>
            </button>
          </div>
        </div>
      </li>
    `;
  });

  suggestionsHTML += "</ul>";

  // Update the DOM
  suggestionStatus.innerHTML = suggestionsHTML;

  // Add event listeners for voting
  document.querySelectorAll(".btn-vote").forEach((btn) => {
    btn.addEventListener("click", function () {
      const index = parseInt(this.getAttribute("data-index"));
      handleVote(index, this);
    });
  });
}

// Handle voting on suggestions
function handleVote(index, buttonElement) {
  // Get suggestions from local storage
  const staffSuggestions =
    JSON.parse(localStorage.getItem("staffSuggestions")) || [];
  if (!staffSuggestions[index]) return;

  // Get the current user
  const currentUser = sessionStorage.getItem("loggedInUser") || "Anonymous";

  // Initialize votedUsers array if it doesn't exist
  if (!staffSuggestions[index].votedUsers) {
    staffSuggestions[index].votedUsers = [];
  }

  // Check if user already voted
  if (staffSuggestions[index].votedUsers.includes(currentUser)) {
    showNotification("You have already voted on this suggestion.", "info");
    return;
  }

  // Increment vote count and add user to voted list
  staffSuggestions[index].votes++;
  staffSuggestions[index].votedUsers.push(currentUser);

  // Save updated suggestions
  localStorage.setItem("staffSuggestions", JSON.stringify(staffSuggestions));

  // Update the display
  buttonElement.querySelector(".vote-count").textContent =
    staffSuggestions[index].votes;

  showNotification("Your vote has been counted!", "success");
}

// Add guide content toggle with smooth animation
document.querySelectorAll(".toggle-guide").forEach((button) => {
  button.addEventListener("click", function () {
    const guideType = this.getAttribute("data-guide");
    const contentElement = document.getElementById(`${guideType}-content`);

    // Smooth toggle
    if (contentElement.classList.contains("active")) {
      contentElement.style.maxHeight = contentElement.scrollHeight + "px";
      setTimeout(() => {
        contentElement.style.maxHeight = "0px";
        setTimeout(() => {
          contentElement.classList.remove("active");
          this.textContent = "View Guide";
        }, 300);
      }, 10);
    } else {
      contentElement.classList.add("active");
      contentElement.style.maxHeight = "0px";
      setTimeout(() => {
        contentElement.style.maxHeight = contentElement.scrollHeight + "px";
        this.textContent = "Hide Guide";
      }, 10);
    }
  });
});

// Progressive content loading for better performance
document.addEventListener("DOMContentLoaded", function () {
  const sections = document.querySelectorAll("main section");

  // Create intersection observer
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("section-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
    },
  );

  // Observe each section
  sections.forEach((section) => {
    observer.observe(section);
  });
});

// Add copy functionality to credential boxes
document.querySelectorAll(".credential-box p").forEach((credential) => {
  const originalHTML = credential.innerHTML;
  const textToCopy =
    credential.textContent.split(":")[1]?.trim() || credential.textContent;

  credential.innerHTML = `${originalHTML} <button class="copy-btn" data-copy="${textToCopy}"><i class="fas fa-copy"></i></button>`;
});

// Initialize copy buttons
document.addEventListener("click", function (e) {
  if (e.target.closest(".copy-btn")) {
    const button = e.target.closest(".copy-btn");
    const textToCopy = button.getAttribute("data-copy");

    navigator.clipboard.writeText(textToCopy).then(() => {
      // Change icon temporarily
      const originalIcon = button.innerHTML;
      button.innerHTML = '<i class="fas fa-check"></i>';

      // Show notification
      showNotification("Copied to clipboard!", "success");

      // Reset icon after a delay
      setTimeout(() => {
        button.innerHTML = originalIcon;
      }, 2000);
    });
  }
});

/**
 * Suggestion System for Psycho Hatcher Staff Portal
 * Handles submission, display, and management of staff suggestions
 */

// Admin accounts with enhanced permissions
const ADMIN_ACCOUNTS = ["Santa", "Dr. Mo Psycho", "WaterMelone", "Waktool"];
// Admin permission levels (higher = more access)
const ADMIN_PERMISSIONS = {
  Santa: 3, // Super admin - all permissions
  "Dr. Mo Psycho": 2, // Senior admin
  WaterMelone: 2, // Senior admin
  Waktool: 1, // Standard admin
};

// Suppress error messages from images
window.addEventListener(
  "error",
  function (e) {
    // Check if the error is related to image loading or decoding
    if (
      e.message &&
      (e.message.includes("decode file") ||
        e.message.includes("Unable to decode") ||
        e.message.includes("NON-UTF8"))
    ) {
      // Prevent the error from showing in console
      e.preventDefault();
      e.stopPropagation();
      return true;
    }
  },
  true,
);

document.addEventListener("DOMContentLoaded", function () {
  // Initialize suggestion system if on the correct page
  initializeSuggestionSystem();

  // Display existing suggestions
  if (document.getElementById("suggestion-status")) {
    displaySuggestions();
  }
});

/**
 * Initialize the suggestion submission system
 */
function initializeSuggestionSystem() {
  const submitSuggestionBtn = document.getElementById("submit-suggestion");
  if (!submitSuggestionBtn) return;

  submitSuggestionBtn.addEventListener("click", function () {
    const suggestionTextarea = document.getElementById("suggestion-text");
    const suggestionText = suggestionTextarea.value.trim();
    const suggestionStatus = document.getElementById("suggestion-status");

    if (suggestionText === "") {
      // Show error message in the status div
      if (suggestionStatus) {
        suggestionStatus.className = "error";
        suggestionStatus.innerHTML =
          "<p>Please enter a suggestion before submitting.</p>";
        suggestionStatus.style.display = "block";
      }

      showNotification("Please enter a suggestion before submitting.", "error");
      return;
    }

    if (submitNewSuggestion(suggestionText)) {
      // Clear the input only on success
      suggestionTextarea.value = "";

      // Show success in the status div
      if (suggestionStatus) {
        suggestionStatus.className = "success";
        suggestionStatus.innerHTML =
          "<p>Your suggestion has been submitted successfully!</p>";
        suggestionStatus.style.display = "block";
      }
    }
  });
}

/**
 * Submit a new suggestion to the system
 * @param {string} suggestionText - The text of the suggestion
 */
function submitNewSuggestion(suggestionText) {
  if (suggestionText.trim() === "") {
    showNotification("Please enter a suggestion before submitting.", "error");
    return false;
  }

  // Get current user
  const currentUser = sessionStorage.getItem("loggedInUser") || "Anonymous";

  // Create suggestion object with metadata
  const newSuggestion = {
    text: suggestionText,
    author: currentUser,
    date: new Date().toISOString(),
    status: "pending", // pending, approved, rejected
    votes: 0,
    votedUsers: [],
  };

  // Get existing suggestions or initialize empty array
  let staffSuggestions =
    JSON.parse(localStorage.getItem("staffSuggestions")) || [];

  // Add new suggestion to array
  staffSuggestions.push(newSuggestion);

  // Save back to local storage
  localStorage.setItem("staffSuggestions", JSON.stringify(staffSuggestions));

  // Show success message
  showNotification(
    "Your suggestion has been submitted successfully!",
    "success",
  );

  // Update the suggestions list
  displaySuggestions();

  return true;
}

/**
 * Check if current user is an admin
 * @returns {boolean} True if current user is an admin
 */
function isAdmin() {
  const currentUser = sessionStorage.getItem("loggedInUser") || "Anonymous";
  return ADMIN_ACCOUNTS.includes(currentUser);
}

function getAdminLevel() {
  const currentUser = sessionStorage.getItem("loggedInUser") || "Anonymous";
  return ADMIN_PERMISSIONS[currentUser] || 0;
}

function hasAdminPermission(requiredLevel) {
  const userLevel = getAdminLevel();
  return userLevel >= requiredLevel;
}

// Function to hide all admin-related content from non-admin users
function hideAdminContentFromNonAdmins() {
  // Return early if user is an admin
  if (isAdmin()) {
    console.log("Admin user detected, showing admin content");
    return;
  }

  console.log("Non-admin user detected, hiding admin content");

  // Hide admin panels in account settings
  const adminPanels = document.querySelectorAll(".admin-panel, #admin");
  adminPanels.forEach((panel) => {
    if (panel) panel.style.display = "none";
  });

  // Hide admin tabs in navigation
  const adminTabs = document.querySelectorAll(
    'a[href*="admin"], a[href*="password-requests"]',
  );
  adminTabs.forEach((tab) => {
    if (tab) tab.style.display = "none";
  });

  // Hide admin tools and actions
  const adminTools = document.querySelectorAll(
    ".admin-tools, .admin-actions, .admin-section",
  );
  adminTools.forEach((tool) => {
    if (tool) tool.style.display = "none";
  });

  // Hide admin buttons in knowledge base contributions
  const adminButtons = document.querySelectorAll(
    ".approve-contribution, .reject-contribution",
  );
  adminButtons.forEach((button) => {
    if (button) button.style.display = "none";
  });

  // Remove admin-only class elements
  document.querySelectorAll(".admin-only, .santa-only").forEach((element) => {
    if (element) element.style.display = "none";
  });
}

/**
 * Delete a suggestion by index
 * @param {number} index - The index of the suggestion to delete
 */
function deleteSuggestion(index) {
  // Verify admin status
  if (!isAdmin()) {
    showNotification("Only administrators can delete suggestions.", "error");
    return;
  }

  // Get suggestions
  let staffSuggestions =
    JSON.parse(localStorage.getItem("staffSuggestions")) || [];

  // Remove the suggestion
  staffSuggestions.splice(index, 1);

  // Save back to localStorage
  localStorage.setItem("staffSuggestions", JSON.stringify(staffSuggestions));

  // Show success message
  showNotification("Suggestion deleted successfully.", "success");

  // Update the display
  displaySuggestions();
}

/**
 * Display all suggestions in the suggestion status area
 */
function displaySuggestions() {
  const suggestionStatus = document.getElementById("suggestion-status");
  if (!suggestionStatus) return;

  // Get suggestions from local storage
  const staffSuggestions =
    JSON.parse(localStorage.getItem("staffSuggestions")) || [];

  if (staffSuggestions.length === 0) {
    suggestionStatus.innerHTML =
      '<p class="no-suggestions">No suggestions have been submitted yet. Be the first to suggest an improvement!</p>';
    return;
  }

  // Sort suggestions by date (newest first)
  staffSuggestions.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Build HTML for suggestions list
  let suggestionsHTML = "<h4>Staff Suggestions Board</h4>";
  suggestionsHTML += `<p class="suggestions-count">${staffSuggestions.length} suggestion${staffSuggestions.length !== 1 ? "s" : ""} submitted</p>`;
  suggestionsHTML += '<ul class="suggestions-list">';

  // Check if current user is admin
  const userIsAdmin = isAdmin();

  staffSuggestions.forEach((suggestion, index) => {
    // Format date for better readability
    const date = new Date(suggestion.date);
    const formattedDate = `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;

    // Create status badge
    let statusClass = "";
    let statusText = "";

    switch (suggestion.status) {
      case "approved":
        statusClass = "approved";
        statusText = "Approved";
        break;
      case "rejected":
        statusClass = "rejected";
        statusText = "Rejected";
        break;
      default:
        statusClass = "pending";
        statusText = "Under Review";
    }

    // Add delete button for admins
    const adminControls = userIsAdmin
      ? `<button class="btn-delete" data-index="${index}">
        <i class="fas fa-trash"></i> Delete
      </button>`
      : "";

    suggestionsHTML += `
      <li>
        <div class="suggestion-header">
          <span class="suggestion-author">${suggestion.author}</span>
          <span class="suggestion-date">${formattedDate}</span>
        </div>
        <div class="suggestion-content">${suggestion.text}</div>
        <div class="suggestion-footer">
          <span class="suggestion-status ${statusClass}">${statusText}</span>
          <div class="suggestion-actions">
            <button class="btn-vote upvote" data-index="${index}">
              <i class="fas fa-thumbs-up"></i> <span class="vote-count">${suggestion.votes}</span>
            </button>
            ${adminControls}
          </div>
        </div>
      </li>
    `;
  });

  suggestionsHTML += "</ul>";

  // Update the DOM
  suggestionStatus.innerHTML = suggestionsHTML;

  // Add event listeners for voting and admin actions
  attachVoteEventListeners();
  if (userIsAdmin) {
    attachAdminEventListeners();
  }
}

/**
 * Attach admin event listeners (delete buttons)
 */
function attachAdminEventListeners() {
  document.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", function () {
      const index = parseInt(this.getAttribute("data-index"));
      deleteSuggestion(index);
    });
  });
}

/**
 * Attach vote event listeners to suggestion vote buttons
 */
function attachVoteEventListeners() {
  document.querySelectorAll(".btn-vote").forEach((btn) => {
    btn.addEventListener("click", function () {
      const index = parseInt(this.getAttribute("data-index"));
      handleVote(index, this);
    });
  });
}

/**
 * Handle a vote on a suggestion
 * @param {number} index - The index of the suggestion
 * @param {HTMLElement} buttonElement - The vote button element
 */
function handleVote(index, buttonElement) {
  const staffSuggestions = JSON.parse(localStorage.getItem("staffSuggestions"));

  // Get the current user
  const currentUser = sessionStorage.getItem("loggedInUser") || "Anonymous";

  // Check if user already voted
  if (
    staffSuggestions[index].votedUsers &&
    staffSuggestions[index].votedUsers.includes(currentUser)
  ) {
    showNotification("You have already voted on this suggestion.", "error");
    return;
  }

  // Increment vote count and add user to voted list
  staffSuggestions[index].votes++;

  // Initialize votedUsers array if it doesn't exist
  if (!staffSuggestions[index].votedUsers) {
    staffSuggestions[index].votedUsers = [];
  }

  staffSuggestions[index].votedUsers.push(currentUser);

  // Save updated suggestions
  localStorage.setItem("staffSuggestions", JSON.stringify(staffSuggestions));

  // Update the display
  buttonElement.querySelector(".vote-count").textContent =
    staffSuggestions[index].votes;

  showNotification("Your vote has been counted!", "success");
}

document.addEventListener("DOMContentLoaded", function () {
  // FAQ Items Toggle
  const faqQuestions = document.querySelectorAll(".faq-question");

  faqQuestions.forEach((question) => {
    question.addEventListener("click", function () {
      const answer = this.nextElementSibling;

      // Toggle active class on question
      this.classList.toggle("active");

      // Toggle active class on answer
      answer.classList.toggle("active");

      // Change icon
      const icon = this.querySelector("i");
      if (icon) {
        if (this.classList.contains("active")) {
          icon.classList.remove("fa-caret-right");
          icon.classList.add("fa-caret-down");
        } else {
          icon.classList.remove("fa-caret-down");
          icon.classList.add("fa-caret-right");
        }
      }
    });
  });

  // Guide Headers Toggle
  const guideHeaders = document.querySelectorAll(".guide-header");

  guideHeaders.forEach((header) => {
    header.addEventListener("click", function () {
      // Toggle active class on header
      this.classList.toggle("active");

      // Get guide ID and toggle content
      const guideId = this.getAttribute("data-guide");
      const content = document.getElementById(guideId + "-content");

      if (content) {
        content.classList.toggle("active");
      }
    });
  });

  // Toggle guide content display
  const guideCards = document.querySelectorAll(".guide-card");

  guideCards.forEach((card) => {
    card.addEventListener("click", function (e) {
      // Only toggle if the click is on the card but not on a button
      if (e.target.tagName !== "BUTTON" && !e.target.closest("button")) {
        const content = this.querySelector(".guide-content");
        if (content) {
          content.classList.toggle("active");
        }
      }
    });
  });

  // Copy template buttons
  const copyButtons = document.querySelectorAll(".copy-template");

  copyButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.stopPropagation(); // Prevent triggering parent click events

      const template = this.getAttribute("data-template");
      let textToCopy;

      // Get all paragraphs from the template content
      const paragraphs = this.parentElement.querySelectorAll("p, li, ul, ol");

      if (paragraphs.length > 0) {
        // Join all paragraphs with line breaks
        textToCopy = Array.from(paragraphs)
          .map((p) => p.textContent)
          .join("\n\n");
      } else {
        // Fallback to getting just the immediate text
        textToCopy = this.parentElement.textContent;
      }

      // Copy to clipboard
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          // Change button text temporarily
          const originalText = this.innerHTML;
          this.innerHTML = '<i class="fas fa-check"></i> Copied!';

          setTimeout(() => {
            this.innerHTML = originalText;
          }, 2000);
        })
        .catch((err) => {
          console.error("Failed to copy: ", err);
        });
    });
  });

  // Suggestion form handling
  const suggestionForm = document.getElementById("submit-suggestion");
  const suggestionText = document.getElementById("suggestion-text");
  const suggestionStatus = document.getElementById("suggestion-status");

  if (suggestionForm && suggestionText && suggestionStatus) {
    suggestionForm.addEventListener("click", function () {
      const suggestion = suggestionText.value.trim();

      if (suggestion === "") {
        suggestionStatus.innerHTML =
          '<p class="error-message">Please enter a suggestion before submitting.</p>';
        suggestionStatus.className = "error";
        return;
      }

      // In a real application, you would send this to a server
      // For this demo, we'll just show a success message
      suggestionStatus.innerHTML =
        '<p class="success-message">Thank you for your suggestion! It has been submitted for review.</p>';
      suggestionStatus.className = "success";
      suggestionText.value = "";

      // Display the suggestion in the list (demo purposes)
      const now = new Date();
      const formattedDate = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;

      const suggestionHTML = `
        <div class="suggestion-item">
          <p class="suggestion-text">${suggestion}</p>
          <p class="suggestion-meta">Submitted by You on ${formattedDate}</p>
          <div class="suggestion-actions">
            <span class="suggestion-status pending">Pending Review</span>
          </div>
        </div>
      `;

      suggestionStatus.innerHTML += suggestionHTML;
    });
  }

  // Logo upload handling
  const logoUpload = document.getElementById("logo-upload");
  const logoPreview = document.getElementById("logo-preview");
  const footerLogo = document.getElementById("footer-logo");

  if (logoUpload && logoPreview) {
    logoUpload.addEventListener("change", function (event) {
      const file = event.target.files[0];
      if (file && file.type.match("image.*")) {
        const reader = new FileReader();

        reader.onload = function (e) {
          logoPreview.src = e.target.result;
          if (footerLogo) {
            footerLogo.src = e.target.result;
          }
        };

        reader.readAsDataURL(file);
      }
    });
  }

  // Initialize: Open first FAQ item
  if (faqQuestions.length > 0) {
    faqQuestions[0].click();
  }

  // Hide admin content if not an admin
  hideAdminContentFromNonAdmins();
});

// Account customization system
function initializeAccountCustomization() {
  // Add account button to header if user is logged in
  const loggedInUser = sessionStorage.getItem("staffLoggedIn");
  if (loggedInUser === "true") {
    // Ensure this runs immediately
    setTimeout(() => {
      addAccountButton();
      loadUserProfileData();
    }, 100);
  }
}

// Add account settings button to header
function addAccountButton() {
  const headerActions = document.querySelector(".header-actions");
  if (headerActions) {
    // Create account button before logout button
    const accountBtn = document.createElement("a");
    accountBtn.id = "account-btn";
    accountBtn.className = "btn btn-outline";
    accountBtn.innerHTML = '<i class="fas fa-user-cog"></i> My Account';
    accountBtn.style.cursor = "pointer";
    accountBtn.style.pointerEvents = "all";
    accountBtn.style.zIndex = "100";
    accountBtn.href = "account-settings.html"; // Direct link to account settings page

    // Insert before logout button
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
      headerActions.insertBefore(accountBtn, logoutBtn);
    } else {
      headerActions.appendChild(accountBtn);
    }

    // Add user welcome with avatar
    const username = sessionStorage.getItem("loggedInUser") || "Staff";
    const userPrefs = getUserPreferences();

    const userWelcome = document.createElement("div");
    userWelcome.className = "user-welcome";

    const userAvatar = document.createElement("div");
    userAvatar.className = "user-avatar";
    userAvatar.style.backgroundColor = userPrefs.avatarColor || "#ED1F27";
    userAvatar.style.borderRadius = "50%";
    userAvatar.style.width = "35px";
    userAvatar.style.height = "35px";
    userAvatar.style.aspectRatio = "1/1";
    userAvatar.textContent = userPrefs.avatarEmoji || "👤";

    userWelcome.appendChild(userAvatar);
    userWelcome.appendChild(document.createTextNode(`Welcome, ${username}!`));

    headerActions.prepend(userWelcome);
  }
}

// Get user preferences from localStorage
function getUserPreferences() {
  const username = sessionStorage.getItem("loggedInUser") || "Anonymous";
  const defaultPrefs = {
    displayName: username,
    avatarEmoji: "👤",
    avatarColor: "#ED1F27",
    theme: "red",
    darkMode: false,
    notificationsEnabled: true,
    joinDate: new Date().toISOString(),
  };

  try {
    const savedPrefs = localStorage.getItem(`userPrefs_${username}`);
    return savedPrefs ? JSON.parse(savedPrefs) : defaultPrefs;
  } catch (e) {
    console.error("Error loading user preferences:", e);
    return defaultPrefs;
  }
}

// Save user preferences to localStorage
function saveUserPreferences(prefs) {
  const username = sessionStorage.getItem("loggedInUser") || "Anonymous";
  localStorage.setItem(`userPrefs_${username}`, JSON.stringify(prefs));
}

// Load user profile data like theme preferences
function loadUserProfileData() {
  const userPrefs = getUserPreferences();

  // Apply theme based on user preference
  if (userPrefs.theme) {
    switchLogo(userPrefs.theme);
  }

  // Apply dark mode if enabled
  if (userPrefs.darkMode) {
    document.body.classList.add("dark-mode");
    const darkModeToggle = document.querySelector(".dark-mode-toggle");
    if (darkModeToggle) {
      darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
      darkModeToggle.title = "Toggle Light Mode";
    }
  }
}

// Removed showAccountSettings function since we now use the account-settings.html page instead

// Function to handle password change request review for Santa
function initializePasswordReviewPanel() {
  // Only show for Santa's account
  const currentUser = sessionStorage.getItem("loggedInUser");
  if (currentUser !== "Santa") return;

  // Add a dedicated button to header for Santa to access password requests
  const headerActions = document.querySelector(".header-actions");
  if (headerActions) {
    const passwordRequestsBtn = document.createElement("a");
    passwordRequestsBtn.id = "password-requests-btn";
    passwordRequestsBtn.className = "btn btn-outline";
    passwordRequestsBtn.innerHTML =
      '<i class="fas fa-key"></i> Password Requests';
    passwordRequestsBtn.style.cursor = "pointer";
    passwordRequestsBtn.href = "password-requests.html"; // Direct link to password requests page

    // Add santa-only class for styling
    passwordRequestsBtn.classList.add("santa-only");

    // Insert before logout button
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
      headerActions.insertBefore(passwordRequestsBtn, logoutBtn);
    } else {
      headerActions.appendChild(passwordRequestsBtn);
    }

    // Add notification badge if there are pending requests
    const pendingRequests = JSON.parse(
      localStorage.getItem("passwordChangeRequests") || "[]",
    ).filter((req) => req.status === "pending").length;

    if (pendingRequests > 0) {
      const badge = document.createElement("span");
      badge.className = "notification-badge";
      badge.textContent = pendingRequests;
      passwordRequestsBtn.appendChild(badge);

      // Add a notification
      setTimeout(() => {
        showNotification(
          `You have ${pendingRequests} pending password change request${pendingRequests > 1 ? "s" : ""}`,
          "info",
        );
      }, 1000);
    }
  }
}

// Populate password change requests list
function populatePasswordRequests() {
  const requestsList = document.getElementById("password-requests-list");
  if (!requestsList) return;

  // Get password requests
  const passwordRequests = JSON.parse(
    localStorage.getItem("passwordChangeRequests") || "[]",
  );

  if (passwordRequests.length === 0) {
    requestsList.innerHTML =
      '<p class="no-requests">No password change requests pending.</p>';
    return;
  }

  // Build requests HTML
  let requestsHTML = "";

  passwordRequests.forEach((request, index) => {
    // Format date for display
    const requestDate = new Date(request.requestDate);
    const formattedDate =
      requestDate.toLocaleDateString() + " " + requestDate.toLocaleTimeString();

    let statusClass = "";
    let statusText = "";

    switch (request.status) {
      case "approved":
        statusClass = "approved";
        statusText = "Approved";
        break;
      case "rejected":
        statusClass = "rejected";
        statusText = "Rejected";
        break;
      default:
        statusClass = "pending";
        statusText = "Pending Review";
    }

    // Build request card
    requestsHTML += `
      <div class="request-card ${statusClass}">
        <div class="request-header">
          <span class="request-username">${request.username}</span>
          <span class="request-date">${formattedDate}</span>
        </div>
        <div class="request-reason">
          <strong>Reason:</strong> ${request.reason}
        </div>
        <div class="request-status ${statusClass}">${statusText}</div>
        ${
          request.status === "pending"
            ? `
        <div class="request-actions">
          <button class="btn btn-sm btn-approve" data-index="${index}">
            <i class="fas fa-check"></i> Approve
          </button>
          <button class="btn btn-sm btn-reject" data-index="${index}">
            <i class="fas fa-times"></i> Reject
          </button>
        </div>
        `
            : ""
        }
        ${
          request.reviewedBy
            ? `
        <div class="request-review-info">
          Reviewed by ${request.reviewedBy} on ${new Date(request.reviewDate).toLocaleDateString()}
        </div>
        `
            : ""
        }
      </div>
    `;
  });

  // Update the DOM
  requestsList.innerHTML = requestsHTML;

  // Add event listeners for approve/reject buttons
  document.querySelectorAll(".btn-approve").forEach((btn) => {
    btn.addEventListener("click", function () {
      handlePasswordRequestAction(
        parseInt(this.getAttribute("data-index")),
        "approved",
      );
    });
  });
  document.querySelectorAll(".btn-reject").forEach((btn) => {
    btn.addEventListener("click", function () {
      handlePasswordRequestAction(
        parseInt(this.getAttribute("data-index")),
        "rejected",
      );
    });
  });
}

// Handle password request approval/rejection
function handlePasswordRequestAction(index, action) {
  // Get requests
  let passwordRequests = JSON.parse(
    localStorage.getItem("passwordChangeRequests") || "[]",
  );

  if (!passwordRequests[index]) return;

  // Update request status
  passwordRequests[index].status = action;
  passwordRequests[index].reviewedBy = sessionStorage.getItem("loggedInUser");
  passwordRequests[index].reviewDate = new Date().toISOString();

  // Save updated requests
  localStorage.setItem(
    "passwordChangeRequests",
    JSON.stringify(passwordRequests),
  );

  // Update the display
  populatePasswordRequests();

  // Show notification
  const actionText = action === "approved" ? "approved" : "rejected";
  showNotification(
    `Password change request ${actionText} successfully`,
    "success",
  );
}

// Admin functions for enhanced permissions

/**
 * Show all users panel - Admin function
 */
function showAllUsersPanel() {
  // Create a list of all users who have preferences stored
  const users = [];

  // Get all localStorage keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    // Check if it's a user preferences key
    if (key && key.startsWith("userPrefs_")) {
      const username = key.replace("userPrefs_", "");
      try {
        const userPrefs = JSON.parse(localStorage.getItem(key));
        users.push({
          username: username,
          displayName: userPrefs.displayName || username,
          joinDate: userPrefs.joinDate || "Unknown",
          lastLogin: userPrefs.lastLogin || "Never",
          isAdmin: ADMIN_ACCOUNTS.includes(username),
        });
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
  }

  // Sort users by admin status and then by username
  users.sort((a, b) => {
    if (a.isAdmin && !b.isAdmin) return -1;
    if (!a.isAdmin && b.isAdmin) return 1;
    return a.username.localeCompare(b.username);
  });

  // Create users panel modal
  const overlay = document.createElement("div");
  overlay.className = "admin-panel-overlay";

  const panel = document.createElement("div");
  panel.className = "admin-panel-container";

  // Create header
  const header = document.createElement("div");
  header.className = "admin-panel-header";
  header.innerHTML = `
    <h2><i class="fas fa-users"></i> User Management</h2>
    <span>${users.length} users registered</span>
  `;

  // Create user list
  const userList = document.createElement("div");
  userList.className = "admin-user-list";

  if (users.length === 0) {
    userList.innerHTML = '<p class="no-data">No users found</p>';
  } else {
    // Create table for users
    const table = document.createElement("table");
    table.className = "admin-users-table";

    // Table header
    const thead = document.createElement("thead");
    thead.innerHTML = `
      <tr>
        <th>Username</th>
        <th>Display Name</th>
        <th>Join Date</th>
        <th>Admin</th>
        <th>Actions</th>
      </tr>
    `;

    // Table body
    const tbody = document.createElement("tbody");

    users.forEach((user) => {
      const tr = document.createElement("tr");

      // Format join date
      const joinDate =
        user.joinDate !== "Unknown"
          ? new Date(user.joinDate).toLocaleDateString()
          : "Unknown";

      tr.innerHTML = `
        <td>${user.username}</td>
        <td>${user.displayName}</td>
        <td>${joinDate}</td>
        <td>${user.isAdmin ? '<span class="admin-badge">Yes</span>' : "No"}</td>
        <td class="actions">
          <button class="btn-sm view-user" data-username="${user.username}">
            <i class="fas fa-eye"></i>
          </button>
          ${
            getAdminLevel() >= 3
              ? `
          <button class="btn-sm remove-user" data-username="${user.username}">
            <i class="fas fa-trash"></i>
          </button>`
              : ""
          }
        </td>
      `;

      tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    userList.appendChild(table);
  }

  // Add close button
  const closeBtn = document.createElement("button");
  closeBtn.className = "btn";
  closeBtn.textContent = "Close";

  // Add all elements to the panel
  panel.appendChild(header);
  panel.appendChild(userList);
  panel.appendChild(closeBtn);
  overlay.appendChild(panel);

  // Add to body
  document.body.appendChild(overlay);

  // Add event listeners
  closeBtn.addEventListener("click", () => {
    document.body.removeChild(overlay);
  });

  // View user buttons
  document.querySelectorAll(".view-user").forEach((btn) => {
    btn.addEventListener("click", function () {
      const username = this.getAttribute("data-username");
      viewUserDetails(username);
    });
  });

  // Remove user buttons (for super admins only)
  if (getAdminLevel() >= 3) {
    document.querySelectorAll(".remove-user").forEach((btn) => {
      btn.addEventListener("click", function () {
        const username = this.getAttribute("data-username");
        if (username === sessionStorage.getItem("loggedInUser")) {
          showNotification("You cannot remove your own account!", "error");
          return;
        }

        if (
          confirm(
            `Are you sure you want to remove user "${username}"? This action cannot be undone.`,
          )
        ) {
          // Remove user preferences
          localStorage.removeItem(`userPrefs_${username}`);
          showNotification(`User "${username}" has been removed.`, "success");

          // Reload the panel
          document.body.removeChild(overlay);
          showAllUsersPanel();
        }
      });
    });
  }
}

/**
 * View user details - Admin function
 * @param {string} username - The username to view
 */
function viewUserDetails(username) {
  const userPrefsKey = `userPrefs_${username}`;
  const userPrefs = JSON.parse(localStorage.getItem(userPrefsKey) || "{}");

  if (!userPrefs) {
    showNotification("User preferences not found", "error");
    return;
  }

  // Create user details modal
  const overlay = document.createElement("div");
  overlay.className = "user-details-overlay";

  const panel = document.createElement("div");
  panel.className = "user-details-container";

  // Add user avatar
  const avatar = document.createElement("div");
  avatar.className = "user-avatar large";
  avatar.style.backgroundColor = userPrefs.avatarColor || "#ED1F27";
  avatar.textContent = userPrefs.avatarEmoji || "👤";

  // Format dates
  const joinDate = userPrefs.joinDate
    ? new Date(userPrefs.joinDate).toLocaleString()
    : "Unknown";

  // Build details content
  const details = document.createElement("div");
  details.className = "user-details-content";
  details.innerHTML = `
    <h2>${username}</h2>
    <div class="user-info-grid">
      <div class="info-row">
        <span class="info-label">Display Name:</span>
        <span class="info-value">${userPrefs.displayName || username}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Join Date:</span>
        <span class="info-value">${joinDate}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Admin Status:</span>
        <span class="info-value">${
          ADMIN_ACCOUNTS.includes(username)
            ? `Admin Level ${ADMIN_PERMISSIONS[username] || 1}`
            : "Regular User"
        }</span>
      </div>
      <div class="info-row">
        <span class="info-label">Theme:</span>
        <span class="info-value">${userPrefs.theme || "Default"}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Dark Mode:</span>
        <span class="info-value">${userPrefs.darkMode ? "Enabled" : "Disabled"}</span>
      </div>
    </div>
  `;

  // Close button
  const closeBtn = document.createElement("button");
  closeBtn.className = "btn";
  closeBtn.textContent = "Close";

  // Assemble the panel
  panel.appendChild(avatar);
  panel.appendChild(details);
  panel.appendChild(closeBtn);
  overlay.appendChild(panel);

  // Add to body
  document.body.appendChild(overlay);

  // Add event listener to close
  closeBtn.addEventListener("click", () => {
    document.body.removeChild(overlay);
  });
}

/**
 * Show suggestions management panel - Admin Level 2+ function
 */
function showSuggestionsManagementPanel() {
  // Get suggestions
  const staffSuggestions = JSON.parse(
    localStorage.getItem("staffSuggestions") || "[]",
  );

  // Create panel
  const overlay = document.createElement("div");
  overlay.className = "admin-panel-overlay";

  const panel = document.createElement("div");
  panel.className = "admin-panel-container wider";

  // Create header
  const header = document.createElement("div");
  header.className = "admin-panel-header";
  header.innerHTML = `
    <h2><i class="fas fa-tasks"></i> Suggestions Management</h2>
    <span>${staffSuggestions.length} suggestions in system</span>
  `;

  // Create suggestions list
  const suggestionsList = document.createElement("div");
  suggestionsList.className = "admin-suggestions-list";

  if (staffSuggestions.length === 0) {
    suggestionsList.innerHTML = '<p class="no-data">No suggestions found</p>';
  } else {
    // Sort suggestions by vote count (highest first)
    staffSuggestions.sort((a, b) => b.votes - a.votes);

    // Create table
    const table = document.createElement("table");
    table.className = "admin-suggestions-table";

    // Table header
    const thead = document.createElement("thead");
    thead.innerHTML = `
      <tr>
        <th>Author</th>
        <th>Suggestion</th>
        <th>Date</th>
        <th>Votes</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    `;

    // Table body
    const tbody = document.createElement("tbody");

    staffSuggestions.forEach((suggestion, index) => {
      const tr = document.createElement("tr");

      // Format date
      const date = new Date(suggestion.date);
      const formattedDate = date.toLocaleDateString();

      // Set row class based on status
      tr.className = suggestion.status;

      // Create status dropdown options
      const statusOptions = ["pending", "approved", "rejected"]
        .map(
          (status) =>
            `<option value="${status}" ${suggestion.status === status ? "selected" : ""}>${
              status.charAt(0).toUpperCase() + status.slice(1)
            }</option>`,
        )
        .join("");

      tr.innerHTML = `
        <td>${suggestion.author}</td>
        <td class="suggestion-text">${suggestion.text}</td>
        <td>${formattedDate}</td>
        <td>${suggestion.votes}</td>
        <td>
          <select class="status-select" data-index="${index}">
            ${statusOptions}
          </select>
        </td>
        <td class="actions">
          <button class="btn-sm delete-suggestion" data-index="${index}">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;

      tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    suggestionsList.appendChild(table);
  }

  // Close button
  const closeBtn = document.createElement("button");
  closeBtn.className = "btn";
  closeBtn.textContent = "Close";

  // Build panel
  panel.appendChild(header);
  panel.appendChild(suggestionsList);
  panel.appendChild(closeBtn);
  overlay.appendChild(panel);

  // Add to DOM
  document.body.appendChild(overlay);

  // Add event listeners
  closeBtn.addEventListener("click", () => {
    document.body.removeChild(overlay);
  });

  // Status select change events
  document.querySelectorAll(".status-select").forEach((select) => {
    select.addEventListener("change", function () {
      const index = parseInt(this.getAttribute("data-index"));
      const newStatus = this.value;

      // Update status
      staffSuggestions[index].status = newStatus;
      staffSuggestions[index].reviewedBy =
        sessionStorage.getItem("loggedInUser");
      staffSuggestions[index].reviewDate = new Date().toISOString();

      // Save changes
      localStorage.setItem(
        "staffSuggestions",
        JSON.stringify(staffSuggestions),
      );

      // Update row class
      this.closest("tr").className = newStatus;

      showNotification(
        `Suggestion status updated to "${newStatus}"`,
        "success",
      );
    });
  });

  // Delete suggestion buttons
  document.querySelectorAll(".delete-suggestion").forEach((btn) => {
    btn.addEventListener("click", function () {
      const index = parseInt(this.getAttribute("data-index"));

      if (confirm("Are you sure you want to delete this suggestion?")) {
        // Remove the suggestion
        staffSuggestions.splice(index, 1);

        // Save changes
        localStorage.setItem(
          "staffSuggestions",
          JSON.stringify(staffSuggestions),
        );

        // Refresh panel
        document.body.removeChild(overlay);
        showSuggestionsManagementPanel();

        showNotification("Suggestion deleted successfully", "success");
      }
    });
  });
}

/**
 * Initialize enhanced mobile menu for better navigation
 */
function initializeMobileMenu() {
  const nav = document.querySelector("nav");
  if (!nav) return;

  // Add mobile class for styling
  if (window.innerWidth <= 768) {
    nav.classList.add("mobile-nav");

    // Create dropdown categorization for mobile
    const navItems = nav.querySelectorAll("li a");
    let categories = {
      Main: [],
      Guides: [],
      Support: [],
      Admin: [],
    };

    // Categorize nav items
    navItems.forEach((item) => {
      const href = item.getAttribute("href");
      const text = item.textContent;

      if (href.includes("guide-")) {
        categories["Guides"].push(item.parentElement);
      } else if (
        href.includes("#script") ||
        href.includes("#bug") ||
        href.includes("#template")
      ) {
        categories["Support"].push(item.parentElement);
      } else if (href.includes("account") || href.includes("password")) {
        categories["Admin"].push(item.parentElement);
      } else {
        categories["Main"].push(item.parentElement);
      }
    });

    // Clear existing nav
    nav.querySelector("ul").innerHTML = "";

    // Rebuild nav with categories for mobile
    Object.entries(categories).forEach(([category, items]) => {
      if (items.length === 0) return;

      const categoryHeader = document.createElement("li");
      categoryHeader.className = "nav-category";
      categoryHeader.innerHTML = `<span>${category}</span>`;
      nav.querySelector("ul").appendChild(categoryHeader);

      items.forEach((item) => {
        nav.querySelector("ul").appendChild(item.cloneNode(true));
      });
    });

    // Add swipe gesture support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.changedTouches[0].screenX;
      },
      false,
    );

    document.addEventListener(
      "touchend",
      (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
      },
      false,
    );

    const handleSwipe = () => {
      if (touchEndX < touchStartX && touchStartX - touchEndX > 100) {
        // Swipe left - close menu
        nav.style.display = "none";
        const mobileMenuBtn = document.querySelector(".mobile-menu-toggle");
        if (mobileMenuBtn) {
          mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i> Menu';
        }
      }

      if (touchEndX > touchStartX && touchEndX - touchStartX > 100) {
        // Swipe right - open menu
        nav.style.display = "block";
        const mobileMenuBtn = document.querySelector(".mobile-menu-toggle");
        if (mobileMenuBtn) {
          mobileMenuBtn.innerHTML = '<i class="fas fa-times"></i> Close';
        }
      }
    };
  }
}

/**
 * Reset all site data - Super Admin (Level 3) function
 */
function resetAllSiteData() {
  // This is a dangerous action! Only allow for level 3 admins
  if (getAdminLevel() < 3) {
    showNotification(
      "You do not have permission to perform this action",
      "error",
    );
    return;
  }

  // Create a backup of critical data
  const backup = {
    timestamp: new Date().toISOString(),
    userData: {},
    suggestions: JSON.parse(localStorage.getItem("staffSuggestions") || "[]"),
    backupCreator: sessionStorage.getItem("loggedInUser"),
  };

  // Backup all user preferences
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("userPrefs_")) {
      backup.userData[key] = JSON.parse(localStorage.getItem(key) || "{}");
    }
  }

  // Store backup in localStorage
  localStorage.setItem(
    "siteBackup_" + new Date().getTime(),
    JSON.stringify(backup),
  );

  // Clear all localStorage except the backup
  const backupKeys = Object.keys(localStorage).filter((key) =>
    key.startsWith("siteBackup_"),
  );
  localStorage.clear();

  // Restore backups
  backupKeys.forEach((key) => {
    localStorage.setItem(key, backup);
  });

  // Keep current user logged in
  const currentUser = sessionStorage.getItem("loggedInUser");
  sessionStorage.setItem("staffLoggedIn", "true");
  localStorage.setItem("staffLoggedIn", "true");
  sessionStorage.setItem("loggedInUser", currentUser);
  localStorage.setItem("loggedInUser", currentUser);

  showNotification(
    "All site data has been reset. Reloading page...",
    "success",
  );

  // Reload page after delay
  setTimeout(() => {
    location.reload();
  }, 2000);
}
// Copy template to clipboard
document.querySelectorAll(".copy-template").forEach((button) => {
  button.addEventListener("click", function () {
    const templateId = this.getAttribute("data-template");
    let textToCopy = "";

    if (templateId === "clan-requirements") {
      textToCopy = `Hey! 👋 To alliance with our server, you must meet these requirements:

✅ Clan Requirements:
🌟 Your server must have 1,000+ members
💬 Your community must be actively engaged and friendly

----------
📣 Promotion & Listing Conditions:
📢 Our promo post must be placed in a channel accessible to everyone
🔔 You must ping @everyone, @here, or a notification role

----------
💸 Don't Meet the Requirements? No Problem!
You can still get featured with a paid promo:

💵 Just $5 to bypass all requirements
🖼️ We'll place your clan banner on our most visited pages
📣 We'll make a post about your clan that stays up for 30 days

### Donation Link: https://donate.stripe.com/00gcPYdimdq0f1m9AA

Let me know if you're interested or have any questions! 😎`;
    }
  });
});
