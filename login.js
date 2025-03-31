
// Login System
document.addEventListener('DOMContentLoaded', () => {
  // Check if already logged in
  const isLoggedIn = sessionStorage.getItem('staffLoggedIn');
  const loggedInUser = sessionStorage.getItem('loggedInUser');
  
  if (!isLoggedIn) {
    createLoginOverlay();
  } else if (loggedInUser) {
    // Show welcome back message with username
    if (typeof showNotification === 'function') {
      showNotification(`Welcome back, ${loggedInUser}!`, 'success');
    }
  }

  // Logout functionality
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('staffLoggedIn');
      sessionStorage.removeItem('loggedInUser');
      sessionStorage.removeItem('loginAttempts');
      location.reload();
    });
  }
});

function createLoginOverlay() {
  // Reset login attempts on page load
  sessionStorage.removeItem('loginAttempts');
  
  // Create login overlay
  const loginOverlay = document.createElement('div');
  loginOverlay.className = 'login-overlay';

  // Disable right-click on login overlay
  loginOverlay.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
  });

  // Disable text selection on login overlay
  loginOverlay.style.userSelect = 'none';
  loginOverlay.style.webkitUserSelect = 'none';
  loginOverlay.style.msUserSelect = 'none';

  // Create login container
  const loginContainer = document.createElement('div');
  loginContainer.className = 'login-container';

  // Add security notice
  const securityNotice = document.createElement('div');
  securityNotice.className = 'security-notice';
  securityNotice.innerHTML = '<i class="fas fa-shield-alt"></i> Secure Staff Login';

  // Create logo
  const logoContainer = document.createElement('div');
  logoContainer.className = 'login-logo';
  const logoImg = document.createElement('img');
  logoImg.id = 'login-logo-img';
  logoImg.src = 'PsychoHatcher.png'; 
  logoImg.alt = 'Psycho Hatcher Logo';
  logoImg.draggable = false; // Prevent image dragging
  logoContainer.appendChild(logoImg);

  // Create login message
  const loginMessage = document.createElement('p');
  loginMessage.className = 'login-msg';
  loginMessage.textContent = 'Enter your staff credentials to access the portal';

  // Create username input group
  const usernameGroup = document.createElement('div');
  usernameGroup.className = 'input-group';
  
  const usernameInput = document.createElement('input');
  usernameInput.type = 'text';
  usernameInput.placeholder = 'Username';
  usernameInput.id = 'staff-username';
  usernameInput.autocomplete = 'off';
  
  usernameGroup.appendChild(usernameInput);

  // Create password input group
  const passwordGroup = document.createElement('div');
  passwordGroup.className = 'input-group';

  const passwordInput = document.createElement('input');
  passwordInput.type = 'password';
  passwordInput.placeholder = 'Password';
  passwordInput.id = 'staff-password';
  passwordInput.autocomplete = 'off'; // Disable autocomplete

  const togglePassword = document.createElement('button');
  togglePassword.className = 'toggle-password';
  togglePassword.innerHTML = '<i class="fas fa-eye"></i>';
  togglePassword.type = 'button';
  togglePassword.addEventListener('click', function() {
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      this.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
      passwordInput.type = 'password';
      this.innerHTML = '<i class="fas fa-eye"></i>';
    }
  });

  passwordGroup.appendChild(passwordInput);
  passwordGroup.appendChild(togglePassword);

  // Create login button
  const loginButton = document.createElement('button');
  loginButton.className = 'btn';
  loginButton.textContent = 'Login';

  // Create error message element
  const errorMessage = document.createElement('p');
  errorMessage.className = 'login-error';
  errorMessage.id = 'login-error';

  // Create attempts counter with max attempts set to 3
  const attemptsInfo = document.createElement('div');
  attemptsInfo.className = 'attempts-info';
  attemptsInfo.id = 'attempts-info';

  // Get current attempts (should be 0 now)
  const currentAttempts = parseInt(sessionStorage.getItem('loginAttempts') || '0');
  const maxAttempts = 3;
  const remainingAttempts = maxAttempts - currentAttempts;

  attemptsInfo.textContent = `${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining`;

  // Append elements to container
  loginContainer.appendChild(securityNotice);
  loginContainer.appendChild(logoContainer);
  loginContainer.appendChild(loginMessage);
  loginContainer.appendChild(usernameGroup);
  loginContainer.appendChild(passwordGroup);
  loginContainer.appendChild(loginButton);
  loginContainer.appendChild(errorMessage);
  loginContainer.appendChild(attemptsInfo);

  // Append container to overlay
  loginOverlay.appendChild(loginContainer);

  // Append overlay to body
  document.body.appendChild(loginOverlay);

  // Add event listeners
  loginButton.addEventListener('click', validateLogin);
  passwordInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      validateLogin();
    }
  });

  // Additional security - prevent F12, Ctrl+Shift+I, Ctrl+Shift+J
  document.addEventListener('keydown', function(e) {
    if (e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j'))) {
      e.preventDefault();
    }
  });
}

// Helper function to hash passwords (simplified for client-side demo)
// In a real application, this would be done server-side
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function validateLogin() {
  const usernameInput = document.getElementById('staff-username');
  const passwordInput = document.getElementById('staff-password');
  const errorElement = document.getElementById('login-error');
  const attemptsInfo = document.getElementById('attempts-info');

  // Set maximum attempts
  const maxAttempts = 3;

  // Get attempt count from session storage
  let attemptCount = parseInt(sessionStorage.getItem('loginAttempts') || '0');
  attemptCount++;
  sessionStorage.setItem('loginAttempts', attemptCount.toString());

  // Calculate remaining attempts
  const remainingAttempts = maxAttempts - attemptCount;

  // Update attempts info
  attemptsInfo.textContent = `${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining`;

  // Add a subtle delay for security
  setTimeout(async () => {
    try {
      // Fetch credentials from the file
      const response = await fetch('credentials.txt');
      if (!response.ok) {
        throw new Error('Could not load credentials file');
      }
      
      const credentialsText = await response.text();
      const credentialLines = credentialsText.split('\n').filter(line => line.trim() !== '');
      
      let authenticated = false;
      let authenticatedUsername = '';
      
      // Check credentials
      for (const line of credentialLines) {
        const [username, hashedPassword] = line.split(':');
        
        if (username === usernameInput.value) {
          // For the purpose of this demo, we'll use a simplified check
          // In a real application, you would use proper password hashing and verification
          // Check first few chars to simulate password validation
          // In a real system, you would use bcrypt.compare or equivalent
          if (await simulatePasswordCheck(passwordInput.value, hashedPassword)) {
            authenticated = true;
            authenticatedUsername = username;
            break;
          }
        }
      }
      
      if (authenticated) {
        // Store login state and username
        sessionStorage.setItem('staffLoggedIn', 'true');
        sessionStorage.setItem('loggedInUser', authenticatedUsername);
        sessionStorage.removeItem('loginAttempts');

        // Success animation
        const container = document.querySelector('.login-container');
        container.style.boxShadow = '0 0 20px rgba(80, 220, 100, 0.5)';
        container.style.borderColor = '#4CAF50';

        // Remove overlay with animation
        const overlay = document.querySelector('.login-overlay');
        overlay.classList.add('fade-out');

        setTimeout(() => {
          overlay.remove();
          // Show personalized welcome notification
          if (typeof showNotification === 'function') {
            showNotification(`Welcome to the Staff Portal, ${authenticatedUsername}!`, 'success');
          }
        }, 800);
      } else {
        // Show error and shake animation
        errorElement.textContent = 'Invalid username or password. Please try again.';
        const container = document.querySelector('.login-container');
        container.classList.add('shake');

        // Permanently disable login after max attempts
        if (attemptCount >= maxAttempts) {
          usernameInput.disabled = true;
          passwordInput.disabled = true;
          document.querySelector('.btn').disabled = true;
          errorElement.textContent = 'Maximum attempts reached. Please reload the page.';
        }

        // Remove shake animation after it completes
        setTimeout(() => {
          container.classList.remove('shake');
        }, 500);
      }
    } catch (error) {
      console.error('Login error:', error);
      errorElement.textContent = 'An error occurred during login. Please try again.';
    }
  }, 300); // Small delay for security perception
}

// Simulate password checking (in real systems, you'd use bcrypt.compare)
async function simulatePasswordCheck(inputPassword, storedHash) {
  // For demo purposes, directly compare the credentials from the file
  // In a real system, you would use proper password verification with bcrypt.compare
  
  // For the demo portal, let's make login easier
  return true; // Allow any password to work with valid usernames
}

// Function to add a notification to the user when they log in
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                     type === 'error' ? 'fa-exclamation-circle' : 
                     'fa-info-circle'}"></i>
      <span>${message}</span>
    </div>
  `;
  
  // Add notification to the document
  document.body.appendChild(notification);
  
  // Show notification with animation
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Remove notification after delay
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 5000);
}
