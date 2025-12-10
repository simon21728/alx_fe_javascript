// -----------------------------
// Dynamic Quote Generator v2
// Features:
// - localStorage persistence for quotes
// - sessionStorage for last viewed quote
// - import/export JSON
// - dynamic form & category buttons
// -----------------------------

// Default quotes (used only if none in localStorage)
const DEFAULT_QUOTES = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" },
];

// Keys for storage
const LS_KEY = "dqg_quotes_v1";
const SS_KEY_LAST_QUOTE = "dqg_last_quote_v1";

// Quotes array (in-memory)
let quotes = [];

// DOM references
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categoryFilterContainer = document.getElementById("categoryFilter");

// -----------------------------
// Storage helpers
// -----------------------------
function saveQuotes() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(quotes));
  } catch (e) {
    console.error("Failed to save quotes to localStorage:", e);
  }
}

function loadQuotes() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) {
      quotes = DEFAULT_QUOTES.slice();
      saveQuotes();
      return;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      quotes = parsed;
    } else {
      // if stored something unexpected, reset to defaults
      quotes = DEFAULT_QUOTES.slice();
      saveQuotes();
    }
  } catch (e) {
    console.error("Failed to load quotes from localStorage:", e);
    quotes = DEFAULT_QUOTES.slice();
    saveQuotes();
  }
}

function saveLastQuoteToSession(quoteObj) {
  try {
    sessionStorage.setItem(SS_KEY_LAST_QUOTE, JSON.stringify(quoteObj));
  } catch (e) {
    console.error("Failed to save last quote to sessionStorage:", e);
  }
}

function loadLastQuoteFromSession() {
  try {
    const raw = sessionStorage.getItem(SS_KEY_LAST_QUOTE);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

// -----------------------------
// UI Rendering & Manipulation
// -----------------------------
function showRandomQuote(category = null) {
  let filtered = quotes;
  if (category) filtered = quotes.filter(q => q.category === category);

  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }

  const idx = Math.floor(Math.random() * filtered.length);
  const q = filtered[idx];
  renderQuoteToDOM(q);
  saveLastQuoteToSession(q);
}

function renderQuoteToDOM(q) {
  quoteDisplay.textContent = `"${q.text}" — ${q.category}`;
}

function renderCategoryButtons() {
  // Build unique categories
  const categories = [...new Set(quotes.map(q => q.category))];

  categoryFilterContainer.innerHTML = ""; // clear
  const header = document.createElement("h3");
  header.textContent = "Filter by Category:";
  categoryFilterContainer.appendChild(header);

  // "All" button
  const allBtn = document.createElement("button");
  allBtn.textContent = "All";
  allBtn.className = "secondary";
  allBtn.addEventListener("click", () => showRandomQuote());
  categoryFilterContainer.appendChild(allBtn);

  categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.textContent = cat;
    btn.addEventListener("click", () => showRandomQuote(cat));
    categoryFilterContainer.appendChild(btn);
  });
}

// -----------------------------
// Dynamic Form & Controls
// -----------------------------
function createAddQuoteForm() {
  const container = document.createElement("div");
  container.className = "form-section";
  container.id = "add-quote-section";

  const title = document.createElement("h3");
  title.textContent = "Add a New Quote";
  container.appendChild(title);

  const inputText = document.createElement("input");
  inputText.type = "text";
  inputText.id = "newQuoteText";
  inputText.placeholder = "Enter a new quote";
  container.appendChild(inputText);

  const inputCategory = document.createElement("input");
  inputCategory.type = "text";
  inputCategory.id = "newQuoteCategory";
  inputCategory.placeholder = "Enter quote category";
  container.appendChild(inputCategory);

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote";
  addBtn.addEventListener("click", addQuote);
  container.appendChild(addBtn);

  // Export button
  const exportBtn = document.createElement("button");
  exportBtn.textContent = "Export Quotes (JSON)";
  exportBtn.style.marginLeft = "8px";
  exportBtn.addEventListener("click", exportToJsonFile);
  container.appendChild(exportBtn);

  // Import file input
  const importLabel = document.createElement("label");
  importLabel.style.display = "block";
  importLabel.style.marginTop = "10px";
  importLabel.textContent = "Import quotes from JSON file:";
  container.appendChild(importLabel);

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.id = "importFile";
  fileInput.accept = ".json,application/json";
  fileInput.addEventListener("change", importFromJsonFile);
  container.appendChild(fileInput);

  // small help text
  const hint = document.createElement("small");
  hint.textContent = "Imported JSON must be an array of objects with 'text' and 'category' properties.";
  container.appendChild(hint);

  document.body.appendChild(container);
}

// -----------------------------
// Add Quote Logic
// -----------------------------
function addQuote(event) {
  // if called from button click, prevent default behavior
  if (event && event.preventDefault) event.preventDefault();

  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const text = textInput.value ? textInput.value.trim() : "";
  const category = categoryInput.value ? categoryInput.value.trim() : "";

  if (!text || !category) {
    alert("Please provide both quote text and category.");
    return;
  }

  const newObj = { text, category };
  quotes.push(newObj);
  saveQuotes();
  renderCategoryButtons();

  // clear inputs
  textInput.value = "";
  categoryInput.value = "";

  alert("Quote added and saved!");
}

// -----------------------------
// JSON Export / Import
// -----------------------------
function exportToJsonFile() {
  try {
    const dataStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    // suggested filename with date
    const now = new Date().toISOString().slice(0,19).replace(/[:T]/g, "-");
    a.download = `quotes-export-${now}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error("Export failed:", e);
    alert("Failed to export quotes.");
  }
}

function importFromJsonFile(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (ev) {
    try {
      const parsed = JSON.parse(ev.target.result);
      if (!Array.isArray(parsed)) {
        alert("Imported JSON must be an array of quote objects.");
        return;
      }

      // Validate and collect valid entries
      const valid = [];
      parsed.forEach(item => {
        if (item && typeof item.text === "string" && typeof item.category === "string") {
          valid.push({ text: item.text.trim(), category: item.category.trim() });
        }
      });

      if (valid.length === 0) {
        alert("No valid quotes found in file. Each item must have 'text' and 'category' strings.");
        return;
      }

      quotes.push(...valid);
      saveQuotes();
      renderCategoryButtons();
      alert(`Imported ${valid.length} quote(s) successfully!`);

      // Clear file input to allow re-importing same file if needed
      event.target.value = "";
    } catch (e) {
      console.error("Import failed:", e);
      alert("Failed to import JSON. Ensure the file contains valid JSON.");
      event.target.value = "";
    }
  };

  reader.readAsText(file);
}

// -----------------------------
// Initialization
// -----------------------------
function initializeApp() {
  loadQuotes();
  renderCategoryButtons();

  // Recreate dynamic form and controls
  createAddQuoteForm();

  // Event listener on Show New Quote button (explicit requirement)
  newQuoteBtn.addEventListener("click", () => showRandomQuote());

  // If session has a last-quote, show it
  const last = loadLastQuoteFromSession();
  if (last && last.text && last.category) {
    renderQuoteToDOM(last);
  } else {
    // show a random quote from all
    // (do not overwrite sessionStorage when loading initial random)
    // showRandomQuote();
  }
}

// Run
initializeApp();
