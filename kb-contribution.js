// Knowledge Base Contribution System
document.addEventListener('DOMContentLoaded', function() {
  initializeKnowledgeBaseSystem();
});

function initializeKnowledgeBaseSystem() {
  // Add KB contribution button to guide pages
  addContributionButtons();

  // Initialize existing contributions
  displayExistingContributions();

  // Initialize contribution form if it exists on page load
  const urlParams = new URLSearchParams(window.location.search);
  const guideId = urlParams.get('guide');
  const guideName = urlParams.get('name');

  if (guideId && guideName) {
    showContributionForm(guideId, decodeURIComponent(guideName));
  }
}

function addContributionButtons() {
  // Add to guide pages
  if (document.body.classList.contains('guides-page')) {
    // Add to each guide card
    const guideCards = document.querySelectorAll('.guide-card');
    guideCards.forEach(card => {
      addContributeButton(card);
    });
  } else {
    // For main pages, add to troubleshooting section
    const troubleshootingSection = document.getElementById('troubleshooting');
    if (troubleshootingSection) {
      const infoBox = troubleshootingSection.querySelector('.troubleshooting-info');
      if (infoBox) {
        addKnowledgeBaseSection(infoBox);
      }
    }
  }
}

function addContributeButton(guideCard) {
  const btnContainer = guideCard.querySelector('.btn').parentNode;
  if (!btnContainer) return;

  const guideId = guideCard.id;
  const guideName = guideCard.querySelector('h3').textContent;

  // Check if button already exists
  if (btnContainer.querySelector('.contribute-btn')) return;

  const contributeBtn = document.createElement('button');
  contributeBtn.className = 'btn btn-sm contribute-btn';
  contributeBtn.innerHTML = '<i class="fas fa-plus-circle"></i> Contribute';
  contributeBtn.setAttribute('data-guide', guideId);
  contributeBtn.setAttribute('data-name', guideName);

  // Use direct click function
  contributeBtn.onclick = function(e) {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = `kb-contribute.html?guide=${encodeURIComponent(this.getAttribute('data-guide'))}&name=${encodeURIComponent(this.getAttribute('data-name'))}`;
  };

  btnContainer.appendChild(contributeBtn);
}

function addKnowledgeBaseSection(container) {
  const kbSection = document.createElement('div');
  kbSection.className = 'kb-contribution-section';
  kbSection.innerHTML = `
    <div class="info-panel">
      <div class="info-icon">
        <i class="fas fa-book"></i>
      </div>
      <div class="info-content">
        <h4>Knowledge Base Contributions</h4>
        <p>Help improve our guides by suggesting new content or corrections to existing documentation.</p>
        <button id="open-kb-btn" class="btn btn-sm">
          <i class="fas fa-plus-circle"></i> Contribute to Knowledge Base
        </button>
      </div>
    </div>

    <div id="kb-contributions-list" class="kb-contributions-list">
      <!-- Existing contributions will be loaded here -->
    </div>
  `;

  container.appendChild(kbSection);

  // Add event listener
  const openKbBtn = document.getElementById('open-kb-btn');
  if (openKbBtn) {
    openKbBtn.onclick = function() {
      window.location.href = `kb-contribute.html?guide=general&name=${encodeURIComponent('General Knowledge Base')}`;
    };
  }
}

function showContributionForm(guideId, guideName) {
  // This function is now primarily used when direct URL access is done
  console.log("Opening contribution form for:", guideName);

  // Update page title and form if they exist
  const pageTitle = document.getElementById('contribution-page-title');
  if (pageTitle) {
    pageTitle.textContent = `Contribute to ${guideName}`;
  }

  const guideNameField = document.getElementById('guide-name-display');
  if (guideNameField) {
    guideNameField.textContent = guideName;
  }

  const submitBtn = document.getElementById('submit-contribution-btn');
  if (submitBtn) {
    submitBtn.setAttribute('data-guide', guideId);
  }
}

function submitContribution(guideId, guideName) {
  const title = document.getElementById('contribution-title').value.trim();
  const content = document.getElementById('contribution-content').value.trim();
  const reason = document.getElementById('contribution-reason').value.trim();
  const type = document.getElementById('contribution-type').value;

  if (!title || !content) {
    showNotification('Please fill in all required fields', 'error');
    return;
  }

  // Get current user or use default
  const currentUser = sessionStorage.getItem('loggedInUser') || 'Anonymous';

  // Format the contribution
  const now = new Date();

  // Create contribution object
  const contribution = {
    id: 'contrib_' + Date.now(),
    title: title,
    content: content,
    reason: reason,
    type: type,
    guide: guideId,
    guideName: guideName,
    author: currentUser,
    date: now.toISOString(),
    status: 'pending', // pending, approved, rejected
    votes: 0,
    votedUsers: []
  };

  // Save to localStorage
  saveContribution(contribution);

  // Show success message
  showNotification('Your knowledge base contribution has been submitted!', 'success');

  // Redirect back to main page
  setTimeout(() => {
    window.location.href = 'index.html#troubleshooting';
  }, 2000);
}

function saveContribution(contribution) {
  // Get existing contributions
  let contributions = JSON.parse(localStorage.getItem('kbContributions')) || [];

  // Add new contribution
  contributions.push(contribution);

  // Save back to localStorage
  localStorage.setItem('kbContributions', JSON.stringify(contributions));
}

function displayExistingContributions() {
  const contributionsList = document.getElementById('kb-contributions-list');
  if (!contributionsList) return;

  // Get all contributions
  const contributions = JSON.parse(localStorage.getItem('kbContributions')) || [];

  if (contributions.length === 0) {
    contributionsList.innerHTML = '<p class="no-contributions">No contributions yet. Be the first to suggest new knowledge base content!</p>';
    return;
  }

  // Sort by date (newest first)
  contributions.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Build HTML
  let contributionsHTML = '<h4>Recent Knowledge Base Contributions</h4>';

  // Take only the most recent 5 contributions
  const recentContributions = contributions.slice(0, 5);

  contributionsHTML += '<div class="contributions-grid">';

  recentContributions.forEach(contribution => {
    // Format date
    const date = new Date(contribution.date);
    const formattedDate = `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;

    // Status badge
    let statusClass = 'pending';
    let statusText = 'Pending Review';

    if (contribution.status === 'approved') {
      statusClass = 'approved';
      statusText = 'Approved';
    } else if (contribution.status === 'rejected') {
      statusClass = 'rejected';
      statusText = 'Rejected';
    }

    contributionsHTML += `
      <div class="contribution-card ${statusClass}">
        <div class="contribution-header">
          <span class="contribution-type">${getTypeLabel(contribution.type)}</span>
          <span class="contribution-guide">${contribution.guideName}</span>
        </div>
        <h5 class="contribution-title">${contribution.title}</h5>
        <div class="contribution-meta">
          <span class="contribution-author">${contribution.author}</span>
          <span class="contribution-date">${formattedDate}</span>
        </div>
        <div class="contribution-status ${statusClass}">${statusText}</div>
      </div>
    `;
  });

  contributionsHTML += '</div>';

  // Add view all link if there are more than 5
  if (contributions.length > 5) {
    contributionsHTML += `
      <div class="view-all-link">
        <a href="kb-contributions.html">
          View all ${contributions.length} contributions <i class="fas fa-arrow-right"></i>
        </a>
      </div>
    `;
  }

  // Update the container
  contributionsList.innerHTML = contributionsHTML;
}

function getTypeLabel(type) {
  switch(type) {
    case 'addition':
      return '<i class="fas fa-plus-circle"></i> Addition';
    case 'correction':
      return '<i class="fas fa-edit"></i> Correction';
    case 'faq':
      return '<i class="fas fa-question-circle"></i> FAQ';
    default:
      return '<i class="fas fa-info-circle"></i> Information';
  }
}

function handleContributionVote(contributionId, buttonElement) {
  // Get current user
  const currentUser = sessionStorage.getItem('loggedInUser') || 'Anonymous';

  // Get all contributions
  let contributions = JSON.parse(localStorage.getItem('kbContributions')) || [];

  // Find the contribution
  const contributionIndex = contributions.findIndex(c => c.id === contributionId);
  if (contributionIndex === -1) return;

  // Check if user already voted
  if (!contributions[contributionIndex].votedUsers) {
    contributions[contributionIndex].votedUsers = [];
  }

  if (contributions[contributionIndex].votedUsers.includes(currentUser)) {
    showNotification('You have already voted on this contribution', 'info');
    return;
  }

  // Add vote
  contributions[contributionIndex].votes++;
  contributions[contributionIndex].votedUsers.push(currentUser);

  // Save back to localStorage
  localStorage.setItem('kbContributions', JSON.stringify(contributions));

  // Update UI
  const voteCount = buttonElement.querySelector('.vote-count');
  if (voteCount) {
    voteCount.textContent = contributions[contributionIndex].votes;
  }

  showNotification('Your vote has been counted!', 'success');
}

function updateContributionStatus(contributionId, newStatus) {
  // Get all contributions
  let contributions = JSON.parse(localStorage.getItem('kbContributions')) || [];

  // Find the contribution
  const contributionIndex = contributions.findIndex(c => c.id === contributionId);
  if (contributionIndex === -1) return;

  // Update status
  contributions[contributionIndex].status = newStatus;

  // Add reviewer info
  contributions[contributionIndex].reviewedBy = sessionStorage.getItem('loggedInUser') || 'Admin';
  contributions[contributionIndex].reviewDate = new Date().toISOString();

  // Save back to localStorage
  localStorage.setItem('kbContributions', JSON.stringify(contributions));

  // Show notification
  const statusText = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
  showNotification(`Contribution ${statusText} successfully`, 'success');

  // Update main page if it exists
  displayExistingContributions();
}

function checkIfAdmin() {
  // Check if current user is an admin
  const currentUser = sessionStorage.getItem('loggedInUser') || 'Anonymous';
  const ADMIN_ACCOUNTS = ['Santa', 'Dr. Mo Psycho', 'WaterMelone', 'Waktool'];
  
  const isUserAdmin = ADMIN_ACCOUNTS.includes(currentUser);
  
  // Hide admin controls if not an admin
  if (!isUserAdmin) {
    // Hide admin elements in contribution pages
    document.querySelectorAll('.admin-actions, .admin-controls, .approve-contribution, .reject-contribution').forEach(el => {
      if (el) el.style.display = 'none';
    });
  }

  return isUserAdmin;
}

function showNotification(message, type = 'info') {
  // Create notification element if it doesn't exist
  let notification = document.querySelector('.notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.className = 'notification';
    document.body.appendChild(notification);
  }

  // Set notification content and type
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
      <span>${message}</span>
    </div>
    <button class="notification-close"><i class="fas fa-times"></i></button>
  `;
  notification.className = `notification ${type}`;

  // Show notification
  setTimeout(() => {
    notification.classList.add('notification-show');
  }, 10);

  // Add close button functionality
  const closeBtn = notification.querySelector('.notification-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      notification.classList.remove('notification-show');
      notification.classList.add('notification-closing');
      setTimeout(() => {
        notification.remove();
      }, 300);
    });
  }

  // Auto hide after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.classList.remove('notification-show');
      notification.classList.add('notification-closing');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }
  }, 5000);
}