// Initial Quotes
let quotes = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "The purpose of our lives is to be happy.", category: "Life" },
  { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" },
];

// DOM Elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const categoryFilterContainer = document.getElementById("categoryFilter");

// Step 1: Show a random quote
function showRandomQuote(category = null) {
  let filteredQuotes = quotes;

  if (category) {
    filteredQuotes = quotes.filter(q => q.category === category);
  }

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  quoteDisplay.textContent = `"${filteredQuotes[randomIndex].text}" — ${filteredQuotes[randomIndex].category}`;
}

// Step 2: Create dynamic category buttons
function renderCategoryButtons() {
  const categories = [...new Set(quotes.map(q => q.category))];

  categoryFilterContainer.innerHTML = "<h3>Filter by Category:</h3>";

  categories.forEach(category => {
    const btn = document.createElement("button");
    btn.textContent = category;
    btn.style.margin = "5px";
    btn.onclick = () => showRandomQuote(category);
    categoryFilterContainer.appendChild(btn);
  });
}

// Step 3: Add new quote dynamically
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (text === "" || category === "") {
    alert("Please fill in both fields.");
    return;
  }

  // Add new quote to array
  quotes.push({ text, category });

  // Update category buttons
  renderCategoryButtons();

  // Clear inputs
  textInput.value = "";
  categoryInput.value = "";

  alert("Quote added successfully!");
}

// Event Listeners
newQuoteBtn.addEventListener("click", () => showRandomQuote());
addQuoteBtn.addEventListener("click", addQuote);

// Initial Render
renderCategoryButtons();
