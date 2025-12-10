// =======================
// Load Quotes From Storage
// =======================
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "Be yourself; everyone else is already taken.", category: "Inspiration" },
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" }
];

// =======================
// Save Quotes to LocalStorage
// =======================
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// =======================
// Populate Categories Dropdown
// =======================
function populateCategories() {
  const select = document.getElementById("categoryFilter");
  const currentFilter = localStorage.getItem("selectedCategory") || "all";

  // Clear old items except "All Categories"
  select.innerHTML = `<option value="all">All Categories</option>`;

  // Get unique categories
  const categories = [...new Set(quotes.map(q => q.category))];

  // Add categories to dropdown
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });

  // Restore last saved filter
  select.value = currentFilter;
}

// =======================
// Show Random Quote
// =======================
function showRandomQuote(filteredQuotes = null) {
  const qDisplay = document.getElementById("quoteDisplay");

  const list = filteredQuotes || quotes;
  if (list.length === 0) {
    qDisplay.textContent = "No quotes available for this category.";
    return;
  }

  const random = list[Math.floor(Math.random() * list.length)];
  qDisplay.textContent = random.text;
}

// =======================
// Filter Quotes by Category
// =======================
function filterQuotes() {
  const selected = document.getElementById("categoryFilter").value;

  // Save selected filter to localStorage
  localStorage.setItem("selectedCategory", selected);

  if (selected === "all") {
    showRandomQuote(quotes);
    return;
  }

  const filteredList = quotes.filter(q => q.category === selected);
  showRandomQuote(filteredList);
}

// =======================
// Add Quote Function
// =======================
function addQuote(text, category) {
  quotes.push({ text, category });
  saveQuotes();
  populateCategories(); // Refresh categories dropdown
}

// =======================
// EXPORT Quotes as JSON
// =======================
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();

  URL.revokeObjectURL(url);
}

// =======================
// IMPORT Quotes From JSON
// =======================
function importFromJsonFile(event) {
  const fileReader = new FileReader();

  fileReader.onload = function(e) {
    const importedQuotes = JSON.parse(e.target.result);

    quotes.push(...importedQuotes);
    saveQuotes();

    populateCategories(); // Update filter dropdown after import

    alert("Quotes imported successfully!");
  };

  fileReader.readAsText(event.target.files[0]);
}

// =======================
// On Page Load
// =======================
document.addEventListener("DOMContentLoaded", () => {
  populateCategories();
  filterQuotes();

  document.getElementById("newQuote").addEventListener("click", filterQuotes);
});
