
// Knowledge Base Contribution System
document.addEventListener('DOMContentLoaded', function() {
  initializeKnowledgeBaseSystem();
});

function initializeKnowledgeBaseSystem() {
  // Add KB contribution button to guide pages
  addContributionButtons();
  
  // Initialize existing contributions
  displayExistingContributions();
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
    showContributionForm(this.getAttribute('data-guide'), this.getAttribute('data-name'));
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
  // Add event listener immediately and also with a fallback timeout
  const openKbBtn = document.getElementById('open-kb-btn');
  if (openKbBtn) {
    openKbBtn.onclick = function() {
      showContributionForm('general', 'General Knowledge Base');
    };
  }
  
  // Fallback with timeout in case DOM isn't fully loaded
  setTimeout(() => {
    const delayedBtn = document.getElementById('open-kb-btn');
    if (delayedBtn) {
      delayedBtn.onclick = function() {
        showContributionForm('general', 'General Knowledge Base');
      };
    }
  }, 500);
}

function showContributionForm(guideId, guideName) {
  console.log("Opening contribution form for:", guideName);
  
  // Remove any existing overlays or forms
  const existingOverlay = document.querySelector('.kb-contribution-overlay');
  if (existingOverlay) existingOverlay.remove();
  
  const existingForm = document.querySelector('.kb-contribution-form');
  if (existingForm) existingForm.remove();
  
  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'kb-contribution-overlay';
  
  // Create form
  const form = document.createElement('div');
  form.className = 'kb-contribution-form';
  form.innerHTML = `
    <div class="form-header">
      <h3><i class="fas fa-lightbulb"></i> Share Your Knowledge</h3>
      <button class="close-btn"><i class="fas fa-times"></i></button>
    </div>
    
    <div class="contribution-info-bar">
      <div class="contribution-guide-name">
        <i class="fas fa-book"></i> Contributing to: <strong>${guideName}</strong>
      </div>
      <div class="contribution-author">
        <i class="fas fa-user"></i> Posted as: <strong>${sessionStorage.getItem('loggedInUser') || 'Anonymous'}</strong>
      </div>
    </div>
    
    <div class="form-body">
      <div class="form-section">
        <div class="form-group">
          <label for="contribution-type">
            <i class="fas fa-tag"></i> Contribution Type
          </label>
          <select id="contribution-type" class="enhanced-select">
            <option value="addition">🔆 New Information/Tip</option>
            <option value="correction">🔧 Correction to Existing Content</option>
            <option value="faq">❓ Add FAQ Item</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="contribution-title">
            <i class="fas fa-heading"></i> Title/Subject
          </label>
          <input type="text" id="contribution-title" class="enhanced-input" placeholder="Give your contribution a clear title...">
        </div>
      </div>
      
      <div class="form-divider">
        <span>Content Details</span>
      </div>
      
      <div class="form-section">
        <div class="form-group">
          <label for="contribution-content">
            <i class="fas fa-edit"></i> Content
          </label>
          <div class="textarea-container">
            <textarea id="contribution-content" rows="6" placeholder="Share your knowledge or suggestion in detail..."></textarea>
            <div class="formatting-tips">
              <i class="fas fa-info-circle"></i> Tips: Be clear, concise, and factual. Include steps if applicable.
            </div>
          </div>
        </div>
        
        <div class="form-group">
          <label for="contribution-reason">
            <i class="fas fa-question-circle"></i> Why is this important?
          </label>
          <textarea id="contribution-reason" rows="3" placeholder="Explain why this information would be valuable for the knowledge base..."></textarea>
        </div>
      </div>
      
      <div class="form-actions">
        <button class="btn btn-outline cancel-btn">
          <i class="fas fa-times"></i> Cancel
        </button>
        <button class="btn submit-contribution pulse-animation" data-guide="${guideId}">
          <i class="fas fa-paper-plane"></i> Submit Contribution
        </button>
      </div>
    </div>
  `;
  
  // Add to body
  document.body.appendChild(overlay);
  document.body.appendChild(form);
  
  // Fade in effect
  setTimeout(() => {
    overlay.style.opacity = '1';
    form.style.transform = 'translateY(0)';
  }, 10);
  
  // Add event listeners
  const closeBtn = form.querySelector('.close-btn');
  const cancelBtn = form.querySelector('.cancel-btn');
  const submitBtn = form.querySelector('.submit-contribution');
  
  function closeForm() {
    overlay.style.opacity = '0';
    form.style.transform = 'translateY(20px)';
    setTimeout(() => {
      overlay.remove();
      form.remove();
    }, 300);
  }
  
  // Prevent form from closing when clicking inside it
  form.addEventListener('click', function(e) {
    e.stopPropagation();
  });
  
  closeBtn.addEventListener('click', closeForm);
  cancelBtn.addEventListener('click', closeForm);
  overlay.addEventListener('click', closeForm);
  
  submitBtn.addEventListener('click', function() {
    // Add loading state to button
    this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    this.disabled = true;
    
    // Small delay to show the loading state before submitting
    setTimeout(() => {
      submitContribution(guideId, guideName);
    }, 800);
  });
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
  
  // Close the form
  const overlay = document.querySelector('.kb-contribution-overlay');
  const form = document.querySelector('.kb-contribution-form');
  if (overlay && form) {
    overlay.style.opacity = '0';
    form.style.transform = 'translateY(20px)';
    setTimeout(() => {
      overlay.remove();
      form.remove();
    }, 300);
  }
  
  // Show success message
  showNotification('Your knowledge base contribution has been submitted!', 'success');
  
  // Refresh contributions list if it exists
  displayExistingContributions();
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
        <a href="#" id="view-all-contributions">
          View all ${contributions.length} contributions <i class="fas fa-arrow-right"></i>
        </a>
      </div>
    `;
  }
  
  // Update the container
  contributionsList.innerHTML = contributionsHTML;
  
  // Add event listener for view all
  const viewAllLink = document.getElementById('view-all-contributions');
  if (viewAllLink) {
    viewAllLink.addEventListener('click', function(e) {
      e.preventDefault();
      showAllContributions();
    });
  }
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

function showAllContributions() {
  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'all-contributions-overlay';
  
  // Create container
  const container = document.createElement('div');
  container.className = 'all-contributions-container';
  
  // Get all contributions
  const contributions = JSON.parse(localStorage.getItem('kbContributions')) || [];
  
  // Sort by date (newest first)
  contributions.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Group by guide
  const groupedContributions = {};
  contributions.forEach(contribution => {
    if (!groupedContributions[contribution.guideName]) {
      groupedContributions[contribution.guideName] = [];
    }
    groupedContributions[contribution.guideName].push(contribution);
  });
  
  // Build HTML
  let html = `
    <div class="container-header">
      <h3><i class="fas fa-book"></i> All Knowledge Base Contributions</h3>
      <button class="close-btn"><i class="fas fa-times"></i></button>
    </div>
    
    <div class="container-body">
  `;
  
  // Check if user is an admin
  const isAdmin = checkIfAdmin();
  
  // Add filter/search controls
  html += `
    <div class="contributions-filter">
      <input type="text" id="filter-contributions" placeholder="Search contributions..." class="contributions-search">
      <select id="filter-status" class="filter-select">
        <option value="all">All Statuses</option>
        <option value="pending">Pending Review</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>
      <select id="filter-guide" class="filter-select">
        <option value="all">All Guides</option>
        ${Object.keys(groupedContributions).map(guide => 
          `<option value="${guide}">${guide}</option>`
        ).join('')}
      </select>
    </div>
  `;
  
  // Add contributions by guide
  html += '<div class="all-contributions-list">';
  
  for (const guide in groupedContributions) {
    html += `<div class="guide-contributions" data-guide="${guide}">
      <h4 class="guide-name">${guide} (${groupedContributions[guide].length})</h4>
      <div class="contributions-grid">`;
    
    groupedContributions[guide].forEach(contribution => {
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
      
      html += `
        <div class="detailed-contribution-card ${statusClass}" data-id="${contribution.id}" data-status="${contribution.status}">
          <div class="contribution-header">
            <span class="contribution-type">${getTypeLabel(contribution.type)}</span>
            <span class="contribution-guide">${contribution.guideName}</span>
          </div>
          <h5 class="contribution-title">${contribution.title}</h5>
          <div class="contribution-content">
            <p>${contribution.content}</p>
          </div>
          <div class="contribution-reason">
            <strong>Reason:</strong> ${contribution.reason || 'No reason provided'}
          </div>
          <div class="contribution-meta">
            <span class="contribution-author">${contribution.author}</span>
            <span class="contribution-date">${formattedDate}</span>
          </div>
          <div class="contribution-status ${statusClass}">${statusText}</div>
          
          ${isAdmin && contribution.status === 'pending' ? `
            <div class="admin-actions">
              <button class="btn-sm approve-contribution" data-id="${contribution.id}">
                <i class="fas fa-check"></i> Approve
              </button>
              <button class="btn-sm reject-contribution" data-id="${contribution.id}">
                <i class="fas fa-times"></i> Reject
              </button>
            </div>
          ` : ''}
          
          <div class="contribution-actions">
            <button class="btn-vote upvote" data-id="${contribution.id}">
              <i class="fas fa-thumbs-up"></i> <span class="vote-count">${contribution.votes}</span>
            </button>
          </div>
        </div>
      `;
    });
    
    html += '</div></div>';
  }
  
  html += '</div></div>';
  
  // Set container HTML
  container.innerHTML = html;
  
  // Add to body
  document.body.appendChild(overlay);
  document.body.appendChild(container);
  
  // Add event listeners
  const closeBtn = container.querySelector('.close-btn');
  closeBtn.addEventListener('click', function() {
    overlay.remove();
    container.remove();
  });
  
  // Add filter functionality
  const searchInput = container.querySelector('#filter-contributions');
  const statusFilter = container.querySelector('#filter-status');
  const guideFilter = container.querySelector('#filter-guide');
  
  function filterContributions() {
    const searchTerm = searchInput.value.toLowerCase();
    const statusValue = statusFilter.value;
    const guideValue = guideFilter.value;
    
    const cards = container.querySelectorAll('.detailed-contribution-card');
    const guideContainers = container.querySelectorAll('.guide-contributions');
    
    // Reset guide visibility
    guideContainers.forEach(guide => {
      guide.style.display = 'block';
    });
    
    // Filter cards
    cards.forEach(card => {
      const title = card.querySelector('.contribution-title').textContent.toLowerCase();
      const content = card.querySelector('.contribution-content').textContent.toLowerCase();
      const status = card.getAttribute('data-status');
      const guide = card.closest('.guide-contributions').getAttribute('data-guide');
      
      // Check if card matches all filters
      const matchesSearch = title.includes(searchTerm) || content.includes(searchTerm);
      const matchesStatus = statusValue === 'all' || status === statusValue;
      const matchesGuide = guideValue === 'all' || guide === guideValue;
      
      card.style.display = (matchesSearch && matchesStatus && matchesGuide) ? 'block' : 'none';
    });
    
    // Hide empty guide sections
    guideContainers.forEach(guide => {
      const visibleCards = guide.querySelectorAll('.detailed-contribution-card[style="display: block;"]');
      if (visibleCards.length === 0) {
        guide.style.display = 'none';
      }
    });
  }
  
  searchInput.addEventListener('input', filterContributions);
  statusFilter.addEventListener('change', filterContributions);
  guideFilter.addEventListener('change', filterContributions);
  
  // Add voting functionality
  const voteButtons = container.querySelectorAll('.btn-vote');
  voteButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      handleContributionVote(this.getAttribute('data-id'), this);
    });
  });
  
  // Add admin action handlers
  if (isAdmin) {
    const approveButtons = container.querySelectorAll('.approve-contribution');
    const rejectButtons = container.querySelectorAll('.reject-contribution');
    
    approveButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        updateContributionStatus(this.getAttribute('data-id'), 'approved');
        // Update UI
        const card = this.closest('.detailed-contribution-card');
        card.classList.remove('pending');
        card.classList.add('approved');
        card.querySelector('.contribution-status').className = 'contribution-status approved';
        card.querySelector('.contribution-status').textContent = 'Approved';
        this.parentNode.remove();
      });
    });
    
    rejectButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        updateContributionStatus(this.getAttribute('data-id'), 'rejected');
        // Update UI
        const card = this.closest('.detailed-contribution-card');
        card.classList.remove('pending');
        card.classList.add('rejected');
        card.querySelector('.contribution-status').className = 'contribution-status rejected';
        card.querySelector('.contribution-status').textContent = 'Rejected';
        this.parentNode.remove();
      });
    });
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
  
  return ADMIN_ACCOUNTS.includes(currentUser);
}
