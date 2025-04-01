
// Quick Response Keyboard Shortcuts
document.addEventListener('DOMContentLoaded', function() {
  initializeResponseShortcuts();
});

// Shortcut key configurations
const DEFAULT_SHORTCUTS = [
  { 
    key: 'Alt+1', 
    name: 'Greeting', 
    description: 'Standard greeting response',
    template: 'Hello! This is [Discord Name]. How can we help you today?'
  },
  { 
    key: 'Alt+2', 
    name: 'Issue Acknowledgment',
    description: 'Acknowledge a user issue',
    template: 'Hello! This is [Discord Name]. I\'m glad to help you with your issue. Let\'s take a look!'
  },
  { 
    key: 'Alt+3', 
    name: 'Request Evidence', 
    description: 'Ask for video evidence',
    template: 'That\'s new! I believe there might be a mistake or something done wrong on your end. Let\'s explore this further. Could you please provide a video or stream of the issue?'
  },
  { 
    key: 'Alt+4', 
    name: 'Common Issue', 
    description: 'Response for common issues',
    template: 'I see this is a common issue. Let me guide you through the steps to fix it.'
  },
  { 
    key: 'Alt+5', 
    name: 'Escalation', 
    description: 'Escalate to developers',
    template: 'Thank you for your patience. I\'ll raise this to our developers\' team.'
  },
  { 
    key: 'Alt+6', 
    name: 'Closing (Individual)', 
    description: 'Close ticket individually',
    template: 'I\'m glad I was able to assist you with your issue! Thank you for reaching out, and have a great day!'
  },
  { 
    key: 'Alt+7', 
    name: 'Closing (Team)', 
    description: 'Close ticket as a team',
    template: 'We\'re glad we were able to assist you with your issue! Thank you for reaching out, and have a great day! This ticket will be closed shortly.'
  },
  { 
    key: 'Alt+8', 
    name: 'VIP Information', 
    description: 'VIP access information',
    template: 'For VIP access, you can support our community through a donation! There is no fixed donation amount; you decide, so please feel free to donate whatever it is worth to you.'
  }
];

// Store user-customized shortcuts
function getUserShortcuts() {
  const savedShortcuts = localStorage.getItem('responseShortcuts');
  if (savedShortcuts) {
    try {
      return JSON.parse(savedShortcuts);
    } catch (e) {
      console.error('Error parsing saved shortcuts:', e);
    }
  }
  return DEFAULT_SHORTCUTS;
}

// Save user shortcuts
function saveUserShortcuts(shortcuts) {
  localStorage.setItem('responseShortcuts', JSON.stringify(shortcuts));
}

function initializeResponseShortcuts() {
  // Add shortcuts panel to scripts section
  const scriptsSection = document.getElementById('scripts');
  if (scriptsSection) {
    addShortcutsPanel(scriptsSection);
  }
  
  // Register keyboard shortcuts
  registerKeyboardShortcuts();
  
  // Add a button to settings if they exist
  const settingsSection = document.querySelector('.section-card');
  if (settingsSection) {
    addSettingsButton(settingsSection);
  }
}

function addShortcutsPanel(container) {
  const shortcuts = getUserShortcuts();
  
  const shortcutsPanel = document.createElement('div');
  shortcutsPanel.className = 'shortcuts-panel';
  shortcutsPanel.innerHTML = `
    <div class="shortcuts-header">
      <h3><i class="fas fa-keyboard"></i> Quick Response Shortcuts</h3>
      <div class="shortcuts-actions">
        <button id="customize-shortcuts" class="btn btn-sm">
          <i class="fas fa-cog"></i> Customize
        </button>
        <button id="shortcuts-help" class="btn btn-sm">
          <i class="fas fa-question-circle"></i> Help
        </button>
      </div>
    </div>
    
    <div class="shortcuts-list">
      ${shortcuts.map(shortcut => `
        <div class="shortcut-item" data-key="${shortcut.key}" data-template="${shortcut.template}">
          <div class="shortcut-key">${formatShortcutKey(shortcut.key)}</div>
          <div class="shortcut-info">
            <div class="shortcut-name">${shortcut.name}</div>
            <div class="shortcut-description">${shortcut.description}</div>
          </div>
          <div class="shortcut-preview">
            <button class="btn-copy" title="Copy response">
              <i class="fas fa-copy"></i>
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
  
  // Add as the first child after the heading
  const scriptHeading = container.querySelector('h2');
  if (scriptHeading) {
    container.insertBefore(shortcutsPanel, scriptHeading.nextSibling);
  } else {
    container.appendChild(shortcutsPanel);
  }
  
  // Add event listeners
  setTimeout(() => {
    const customizeBtn = document.getElementById('customize-shortcuts');
    const helpBtn = document.getElementById('shortcuts-help');
    const copyButtons = document.querySelectorAll('.shortcut-item .btn-copy');
    
    if (customizeBtn) {
      customizeBtn.addEventListener('click', showCustomizeShortcutsDialog);
    }
    
    if (helpBtn) {
      helpBtn.addEventListener('click', showShortcutsHelp);
    }
    
    copyButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        const template = this.closest('.shortcut-item').getAttribute('data-template');
        copyToClipboard(template);
      });
    });
  }, 100);
}

function formatShortcutKey(key) {
  return key.split('+').map(part => `<span class="key">${part}</span>`).join('+');
}

function registerKeyboardShortcuts() {
  const shortcuts = getUserShortcuts();
  
  // Remove any existing event listeners
  document.removeEventListener('keydown', handleKeyboardShortcut);
  
  // Add event listener for shortcuts
  document.addEventListener('keydown', handleKeyboardShortcut);
  
  function handleKeyboardShortcut(e) {
    // Check if the user is in an input field, textarea or contenteditable
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
      return;
    }
    
    // Check each shortcut
    for (const shortcut of shortcuts) {
      const parts = shortcut.key.split('+');
      
      // Check if key combination matches
      if (parts.length === 2) {
        const modifier = parts[0].toLowerCase();
        const key = parts[1].toUpperCase();
        
        if ((modifier === 'alt' && e.altKey) && 
            String(e.key).toUpperCase() === key) {
          e.preventDefault();
          
          // Copy the template to clipboard
          copyToClipboard(shortcut.template);
          
          // Show notification
          showNotification(`"${shortcut.name}" copied to clipboard`, 'success');
          
          // Provide visual feedback for which shortcut was triggered
          highlightShortcut(shortcut.key);
          
          break;
        }
      }
    }
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
    .then(() => {
      console.log('Text copied to clipboard');
    })
    .catch(err => {
      console.error('Failed to copy text: ', err);
    });
}

function highlightShortcut(key) {
  const shortcutItem = document.querySelector(`.shortcut-item[data-key="${key}"]`);
  if (shortcutItem) {
    shortcutItem.classList.add('highlight');
    setTimeout(() => {
      shortcutItem.classList.remove('highlight');
    }, 1000);
  }
}

function showCustomizeShortcutsDialog() {
  // Get current shortcuts
  const shortcuts = getUserShortcuts();
  
  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'shortcuts-overlay';
  
  // Create dialog
  const dialog = document.createElement('div');
  dialog.className = 'shortcuts-dialog';
  dialog.innerHTML = `
    <div class="dialog-header">
      <h3><i class="fas fa-keyboard"></i> Customize Quick Response Shortcuts</h3>
      <button class="close-btn"><i class="fas fa-times"></i></button>
    </div>
    
    <div class="dialog-body">
      <p class="shortcuts-info">Customize keyboard shortcuts for frequently used responses. 
      Click on a shortcut key to change it.</p>
      
      <div class="shortcuts-editor">
        ${shortcuts.map((shortcut, index) => `
          <div class="shortcut-edit-item" data-index="${index}">
            <div class="shortcut-field-group">
              <label>Name:</label>
              <input type="text" class="shortcut-name-input" value="${shortcut.name}" data-index="${index}">
            </div>
            
            <div class="shortcut-field-group">
              <label>Key:</label>
              <div class="shortcut-key-input" tabindex="0" data-index="${index}">${shortcut.key}</div>
            </div>
            
            <div class="shortcut-field-group full-width">
              <label>Description:</label>
              <input type="text" class="shortcut-description-input" value="${shortcut.description}" data-index="${index}">
            </div>
            
            <div class="shortcut-field-group full-width">
              <label>Template:</label>
              <textarea class="shortcut-template-input" data-index="${index}" rows="3">${shortcut.template}</textarea>
            </div>
          </div>
        `).join('')}
      </div>
      
      <div class="shortcut-actions">
        <button class="btn btn-secondary reset-shortcuts">
          <i class="fas fa-undo"></i> Reset to Defaults
        </button>
        <button class="btn save-shortcuts">
          <i class="fas fa-save"></i> Save Changes
        </button>
      </div>
      
      <div class="shortcuts-note">
        <p><strong>Note:</strong> Shortcuts use the Alt key combined with a number or letter. 
        For example: Alt+1, Alt+A, etc.</p>
      </div>
    </div>
  `;
  
  // Add to body
  document.body.appendChild(overlay);
  document.body.appendChild(dialog);
  
  // Add event listeners
  const closeBtn = dialog.querySelector('.close-btn');
  const resetBtn = dialog.querySelector('.reset-shortcuts');
  const saveBtn = dialog.querySelector('.save-shortcuts');
  const keyInputs = dialog.querySelectorAll('.shortcut-key-input');
  
  closeBtn.addEventListener('click', function() {
    overlay.remove();
    dialog.remove();
  });
  
  resetBtn.addEventListener('click', function() {
    if (confirm('Are you sure you want to reset all shortcuts to default values?')) {
      saveUserShortcuts(DEFAULT_SHORTCUTS);
      overlay.remove();
      dialog.remove();
      
      // Refresh the page to show default shortcuts
      location.reload();
    }
  });
  
  saveBtn.addEventListener('click', function() {
    const updatedShortcuts = [];
    
    // Gather all shortcut data
    const items = dialog.querySelectorAll('.shortcut-edit-item');
    items.forEach(item => {
      const index = parseInt(item.getAttribute('data-index'));
      const name = item.querySelector('.shortcut-name-input').value;
      const key = item.querySelector('.shortcut-key-input').textContent;
      const description = item.querySelector('.shortcut-description-input').value;
      const template = item.querySelector('.shortcut-template-input').value;
      
      updatedShortcuts[index] = {
        key: key,
        name: name,
        description: description,
        template: template
      };
    });
    
    // Save shortcuts
    saveUserShortcuts(updatedShortcuts);
    
    // Close dialog
    overlay.remove();
    dialog.remove();
    
    // Reload shortcuts display
    const shortcutsPanel = document.querySelector('.shortcuts-panel');
    if (shortcutsPanel) {
      shortcutsPanel.remove();
      const scriptsSection = document.getElementById('scripts');
      if (scriptsSection) {
        addShortcutsPanel(scriptsSection);
      }
    }
    
    // Re-register keyboard shortcuts
    registerKeyboardShortcuts();
    
    showNotification('Shortcuts updated successfully', 'success');
  });
  
  // Key input handling
  keyInputs.forEach(input => {
    input.addEventListener('click', function() {
      this.textContent = 'Press key combination...';
      this.classList.add('recording');
    });
    
    input.addEventListener('keydown', function(e) {
      if (this.classList.contains('recording')) {
        e.preventDefault();
        
        // Only allow Alt+key combinations
        if (e.altKey && !e.ctrlKey && !e.shiftKey && !e.metaKey) {
          const key = e.key.toUpperCase();
          if (key !== 'ALT') {
            this.textContent = `Alt+${key}`;
            this.classList.remove('recording');
          }
        }
      }
    });
    
    // Handle clicking outside to cancel recording
    document.addEventListener('click', function(e) {
      if (input.classList.contains('recording') && e.target !== input) {
        input.textContent = shortcuts[parseInt(input.getAttribute('data-index'))].key;
        input.classList.remove('recording');
      }
    });
  });
}

function showShortcutsHelp() {
  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'shortcuts-overlay';
  
  // Create dialog
  const dialog = document.createElement('div');
  dialog.className = 'shortcuts-dialog';
  dialog.innerHTML = `
    <div class="dialog-header">
      <h3><i class="fas fa-question-circle"></i> Quick Response Shortcuts Help</h3>
      <button class="close-btn"><i class="fas fa-times"></i></button>
    </div>
    
    <div class="dialog-body">
      <h4>Using Keyboard Shortcuts</h4>
      <p>Quick Response Shortcuts allow you to quickly copy frequently used responses to your clipboard with a simple keyboard shortcut.</p>
      
      <h4>How to Use</h4>
      <ol>
        <li>Press the Alt key plus the assigned number or letter anywhere on the staff portal.</li>
        <li>The corresponding template will be copied to your clipboard.</li>
        <li>Paste the template into your response field using Ctrl+V or right-click and select Paste.</li>
      </ol>
      
      <h4>Customizing Shortcuts</h4>
      <p>You can customize the keyboard shortcuts by clicking the "Customize" button in the Quick Response Shortcuts panel.</p>
      <p>From there, you can change the key combinations, template text, and descriptions to suit your workflow.</p>
      
      <div class="shortcuts-note">
        <p><strong>Note:</strong> Shortcuts will not work when typing in a text field or when using other modifiers (Ctrl, Shift, etc.).</p>
      </div>
      
      <div class="shortcut-actions centered">
        <button class="btn close-help">
          <i class="fas fa-check"></i> Got it!
        </button>
      </div>
    </div>
  `;
  
  // Add to body
  document.body.appendChild(overlay);
  document.body.appendChild(dialog);
  
  // Add event listeners
  const closeBtn = dialog.querySelector('.close-btn');
  const gotItBtn = dialog.querySelector('.close-help');
  
  function closeDialog() {
    overlay.remove();
    dialog.remove();
  }
  
  closeBtn.addEventListener('click', closeDialog);
  gotItBtn.addEventListener('click', closeDialog);
}

function addSettingsButton(container) {
  // Check if settings section exists
  const settingsHeading = container.querySelector('h2');
  if (!settingsHeading || !settingsHeading.textContent.includes('Settings')) return;
  
  // Create button
  const settingsButton = document.createElement('div');
  settingsButton.className = 'settings-option';
  settingsButton.innerHTML = `
    <div class="settings-option-inner">
      <div class="settings-icon">
        <i class="fas fa-keyboard"></i>
      </div>
      <div class="settings-content">
        <h4>Response Shortcuts</h4>
        <p>Configure keyboard shortcuts for quick responses</p>
      </div>
      <button class="btn btn-sm">Configure</button>
    </div>
  `;
  
  // Add to container
  container.appendChild(settingsButton);
  
  // Add event listener
  settingsButton.querySelector('button').addEventListener('click', showCustomizeShortcutsDialog);
}
