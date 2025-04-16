// Knowledge Base Search functionality
document.addEventListener("DOMContentLoaded", function () {
  initializeSearch();
});

function initializeSearch() {
  // Create search container if it doesn't exist
  if (!document.getElementById("kb-search-container")) {
    createSearchInterface();
  }

  // Initialize search event listeners
  const searchInput = document.getElementById("kb-search-input");
  const searchButton = document.getElementById("kb-search-button");

  if (searchInput && searchButton) {
    searchInput.addEventListener("keyup", function (event) {
      if (event.key === "Enter") {
        performSearch();
      }
    });

    searchButton.addEventListener("click", performSearch);
  }
}

function createSearchInterface() {
  // Create search container
  const searchContainer = document.createElement("div");
  searchContainer.id = "kb-search-container";
  searchContainer.className = "kb-search-container";

  // Create search input and button
  searchContainer.innerHTML = `
    <div class="kb-search-inner">
      <input type="text" id="kb-search-input" placeholder="Search knowledge base...">
      <button id="kb-search-button"><i class="fas fa-search"></i></button>
    </div>
    <div id="kb-search-results" class="kb-search-results"></div>
  `;

  // Insert after header
  const header = document.querySelector("header");
  if (header && header.nextElementSibling) {
    header.parentNode.insertBefore(searchContainer, header.nextElementSibling);
  }
}

function performSearch() {
  const searchTerm = document
    .getElementById("kb-search-input")
    .value.trim()
    .toLowerCase();
  const resultsContainer = document.getElementById("kb-search-results");

  if (!searchTerm) {
    resultsContainer.innerHTML = "";
    resultsContainer.classList.remove("active");
    return;
  }

  // Show loading indicator
  resultsContainer.innerHTML =
    '<div class="search-loading"><i class="fas fa-spinner fa-spin"></i> Searching...</div>';
  resultsContainer.classList.add("active");

  // Gather content from all pages (in a real app, this would be a backend search)
  fetchAllContent()
    .then((allContent) => {
      const results = searchContent(allContent, searchTerm);
      displaySearchResults(results);
    })
    .catch((error) => {
      console.error("Search error:", error);
      resultsContainer.innerHTML =
        '<div class="search-error">An error occurred during search. Please try again.</div>';
    });
}

function fetchAllContent() {
  // In a production environment, this would be an API call to search content on the server
  // For now, we'll use a simplified approach that searches visible content on the current page

  return new Promise((resolve) => {
    const allContent = [];

    // Search in current page sections
    document.querySelectorAll("section").forEach((section) => {
      const sectionId = section.id;
      const sectionTitle = section.querySelector("h2")
        ? section.querySelector("h2").textContent
        : "Untitled Section";

      // Get text content from key elements within section
      const contentElements = section.querySelectorAll(
        "p, h3, h4, li, .template-content, .guide-content",
      );

      contentElements.forEach((element) => {
        allContent.push({
          id: sectionId,
          title: sectionTitle,
          text: element.textContent,
          source: "current-page",
          element: element,
        });
      });
    });

    // Add guides to searchable content if on guides page
    document.querySelectorAll(".guide-card").forEach((card) => {
      const title = card.querySelector("h3")
        ? card.querySelector("h3").textContent
        : "Untitled Guide";
      const description = card.querySelector("p")
        ? card.querySelector("p").textContent
        : "";
      const link = card.querySelector("a")
        ? card.querySelector("a").getAttribute("href")
        : "#";

      allContent.push({
        id: "guide",
        title: title,
        text: description,
        source: "guide",
        link: link,
      });
    });

    // Add templates to searchable content
    document.querySelectorAll(".template-card").forEach((card) => {
      const title = card.querySelector("h3")
        ? card.querySelector("h3").textContent
        : "Untitled Template";
      const content = Array.from(card.querySelectorAll(".template-content p"))
        .map((p) => p.textContent)
        .join(" ");

      allContent.push({
        id: "template",
        title: title,
        text: content,
        source: "template",
        element: card,
      });
    });

    // In a real app, we would fetch content from other pages too
    // Simulating additional content from guides
    const guidesList = [
      {
        title: "All Keys Mode",
        description: "Efficiently combine and use keys in the game.",
        link: "guide-keymaster.html",
      },
      {
        title: "Rankup Macro",
        description: "Automatically rankup in the game.",
        link: "guide-rankup.html",
      },
      {
        title: "Advanced Digging FAQ",
        description: "Frequently asked questions about Advanced Digging Mode.",
        link: "guide-digging.html",
      },
      {
        title: "Clan Mode FAQ",
        description: "Common questions and answers for Clan Mode Macro issues.",
        link: "guide-clan.html",
      },
      {
        title: "Garden Mode FAQ",
        description: "Common questions and answers for Garden Mode Macro.",
        link: "guide-garden.html",
      },
      {
        title: "Treehouse Mode FAQ",
        description: "Frequently asked questions about Treehouse Mode.",
        link: "guide-treehouse.html",
      },
      {
        title: "Deep Fishing Mode FAQ",
        description: "Common questions and answers for Deep Fishing Mode.",
        link: "guide-fishing.html",
      },
      {
        title: "Fuse Pets Mode FAQ",
        description: "Common questions and answers for Fuse Pets Mode.",
        link: "guide-fusepets.html",
      },
      {
        title: "Bubble Gum Simulator FAQ",
        description: "Common questions and answers for Bubble Gum Simulator Mode.",
        link: "guide-bubblegum.html",
      },
      {
        title: "Level Up Mode FAQ",
        description: "Frequently asked questions about Alt Level Up Mode.",
        link: "guide-levelup.html",
      },
      {
        title: "Market Overlord Mode FAQ",
        description:
          "Troubleshooting for Market Snipe functionality in Trading Plaza.",
        link: "guide-market.html",
      },
      {
        title: "Fisch Mode FAQ",
        description:
          "Troubleshooting for automated fishing in Pet Simulator 99.",
        link: "guide-fisch.html",
      },
      {
        title: "Anime Adventures Mode FAQ",
        description:
          "Troubleshooting for automated gameplay in Anime Adventures.",
        link: "guide-anime.html",
      },
      {
        title: "Common Issues FAQ",
        description: "General troubleshooting FAQ for issues across all modes.",
        link: "guide-common.html",
      },
    ];

    guidesList.forEach((guide) => {
      allContent.push({
        id: "guide",
        title: guide.title,
        text: guide.description,
        source: "guide-list",
        link: guide.link,
      });
    });

    resolve(allContent);
  });
}

function searchContent(content, searchTerm) {
  // Filter content by search term
  return content
    .filter((item) => {
      const titleMatch = item.title.toLowerCase().includes(searchTerm);
      const textMatch = item.text.toLowerCase().includes(searchTerm);
      return titleMatch || textMatch;
    })
    .slice(0, 10); // Limit to top 10 results
}

function displaySearchResults(results) {
  const resultsContainer = document.getElementById("kb-search-results");

  if (results.length === 0) {
    resultsContainer.innerHTML =
      '<div class="no-results">No results found. Try different keywords.</div>';
    return;
  }

  // Group results by type
  const groupedResults = {
    guides: results.filter(
      (r) => r.source === "guide" || r.source === "guide-list",
    ),
    templates: results.filter((r) => r.source === "template"),
    content: results.filter((r) => r.source === "current-page"),
  };

  let resultsHTML = "";

  // Add guides
  if (groupedResults.guides.length > 0) {
    resultsHTML +=
      '<div class="result-group"><h4><i class="fas fa-book"></i> Guides</h4><ul>';
    groupedResults.guides.forEach((result) => {
      resultsHTML += `
        <li class="result-item">
          <a href="${result.link}" class="result-link">
            <div class="result-title">${result.title}</div>
            <div class="result-excerpt">${truncateText(result.text, 100)}</div>
          </a>
        </li>
      `;
    });
    resultsHTML += "</ul></div>";
  }

  // Add templates
  if (groupedResults.templates.length > 0) {
    resultsHTML +=
      '<div class="result-group"><h4><i class="fas fa-clipboard-list"></i> Templates</h4><ul>';
    groupedResults.templates.forEach((result) => {
      resultsHTML += `
        <li class="result-item" data-element-id="${result.id}">
          <div class="result-title">${result.title}</div>
          <div class="result-excerpt">${truncateText(result.text, 100)}</div>
        </li>
      `;
    });
    resultsHTML += "</ul></div>";
  }

  // Add page content
  if (groupedResults.content.length > 0) {
    resultsHTML +=
      '<div class="result-group"><h4><i class="fas fa-file-alt"></i> Page Content</h4><ul>';
    groupedResults.content.forEach((result) => {
      resultsHTML += `
        <li class="result-item" data-section-id="${result.id}">
          <div class="result-content">
            <div class="result-title">${result.title}</div>
            <div class="result-excerpt">${truncateText(result.text, 100)}</div>
          </div>
        </li>
      `;
    });
    resultsHTML += "</ul></div>";
  }

  resultsContainer.innerHTML = resultsHTML;

  // Add click handlers
  document.querySelectorAll(".result-item[data-section-id]").forEach((item) => {
    item.addEventListener("click", function () {
      const sectionId = this.getAttribute("data-section-id");
      const section = document.getElementById(sectionId);
      if (section) {
        // Close search results
        resultsContainer.classList.remove("active");

        // Scroll to section
        section.scrollIntoView({ behavior: "smooth" });

        // Highlight the section briefly
        section.classList.add("highlight-section");
        setTimeout(() => {
          section.classList.remove("highlight-section");
        }, 2000);
      }
    });
  });

  // Add click handlers for guide links
  document.querySelectorAll(".result-item .result-link").forEach((link) => {
    link.addEventListener("click", function () {
      // Close search results
      resultsContainer.classList.remove("active");
    });
  });
}

function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

// Handle click outside to close search results
document.addEventListener("click", function (event) {
  const searchContainer = document.getElementById("kb-search-container");
  const resultsContainer = document.getElementById("kb-search-results");

  if (searchContainer && !searchContainer.contains(event.target)) {
    if (resultsContainer) {
      resultsContainer.classList.remove("active");
    }
  }
});

// Add intelligent search suggestions based on input
function addSearchSuggestions() {
  const searchInput = document.getElementById("kb-search-input");
  const resultsContainer = document.getElementById("kb-search-results");

  if (!searchInput) return;

  // Common search terms and categories
  const suggestions = [
    { term: "macro", category: "common issue" },
    { term: "vip", category: "access" },
    { term: "password", category: "account" },
    { term: "rankup", category: "macro" },
    { term: "digging", category: "macro" },
    { term: "fishing", category: "macro" },
    { term: "clan", category: "mode" },
    { term: "donation", category: "vip" },
    { term: "error", category: "troubleshooting" },
    { term: "template", category: "support" },
  ];

  // Add input event listener for suggestions
  searchInput.addEventListener("input", function () {
    const inputText = this.value.trim().toLowerCase();

    // Only show suggestions if input has at least 2 characters
    if (inputText.length < 2) {
      if (resultsContainer) {
        resultsContainer.classList.remove("active");
      }
      return;
    }

    // Filter suggestions based on input
    const matchedSuggestions = suggestions
      .filter(
        (sugg) =>
          sugg.term.includes(inputText) || inputText.includes(sugg.term),
      )
      .slice(0, 5); // Limit to 5 suggestions

    if (matchedSuggestions.length > 0) {
      let suggestionsHTML =
        '<div class="search-suggestions"><h4>Suggestions</h4><ul>';

      matchedSuggestions.forEach((sugg) => {
        suggestionsHTML += `
          <li class="suggestion-item" data-term="${sugg.term}">
            <i class="fas fa-search-plus"></i>
            <span>${sugg.term}</span>
            <small>${sugg.category}</small>
          </li>
        `;
      });

      suggestionsHTML += "</ul></div>";

      resultsContainer.innerHTML = suggestionsHTML;
      resultsContainer.classList.add("active");

      // Add click handlers for suggestions
      document.querySelectorAll(".suggestion-item").forEach((item) => {
        item.addEventListener("click", function () {
          const term = this.getAttribute("data-term");
          searchInput.value = term;
          performSearch();
        });
      });
    }
  });
}

// Call this function when initializing search
document.addEventListener("DOMContentLoaded", function () {
  initializeSearch();
  addSearchSuggestions();
});
