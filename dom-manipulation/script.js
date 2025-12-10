/* Dynamic Quote Generator - Full script.js with Sync & Conflict Resolution */

// ===================== Local Data ===================== //
let quotes = JSON.parse(localStorage.getItem("quotes")) || [];

// ===================== DOM Elements ===================== //
const quoteText = document.getElementById("quote-text");
const quoteAuthor = document.getElementById("quote-author");
const showNewQuoteBtn = document.getElementById("show-quote-btn");
const exportBtn = document.getElementById("export-btn");
const importInput = document.getElementById("import-input");
const notificationBox = document.getElementById("notification");
const syncStatus = document.getElementById("sync-status");

// ===================== Random Quote Generator ===================== //
function showNewQuote() {
    if (quotes.length === 0) return;
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const q = quotes[randomIndex];
    quoteText.textContent = q.text;
    quoteAuthor.textContent = `— ${q.author}`;
}

showNewQuoteBtn.addEventListener("click", showNewQuote);

// ===================== Add Quote Form ===================== //
function createAddQuoteForm() {
    const form = document.getElementById("add-quote-form");
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = document.getElementById("quote-input").value.trim();
        const author = document.getElementById("author-input").value.trim();

        if (!text || !author) return;

        const newQuote = { id: Date.now(), text, author };
        quotes.push(newQuote);
        saveQuotes();
        form.reset();
        notify("Quote added locally!");
    });
}

createAddQuoteForm();

// ===================== Export Quotes ===================== //
function exportToJsonFile() {
    const dataStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "quotes_export.json";
    a.click();

    notify("Quotes exported successfully!");
}

exportBtn.addEventListener("click", exportToJsonFile);

// ===================== Import Quotes ===================== //
function importFromJsonFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const imported = JSON.parse(e.target.result);
            if (!Array.isArray(imported)) throw new Error();

            quotes = [...quotes, ...imported];
            saveQuotes();
            notify("Quotes imported successfully!");
        } catch (err) {
            notify("Invalid JSON file!", true);
        }
    };
    reader.readAsText(file);
}

importInput.addEventListener("change", importFromJsonFile);

// ===================== Sync With Server ===================== //
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

async function fetchServerQuotes() {
    try {
        syncStatus.textContent = "Syncing...";

        const response = await fetch(SERVER_URL);
        const data = await response.json();

        const serverQuotes = data.slice(0, 10).map((p) => ({
            id: p.id,
            text: p.title,
            author: "Server"
        }));

        resolveConflicts(serverQuotes);
        syncStatus.textContent = "Quotes synced with server!";
        notify("Quotes synced with server!");
    } catch (err) {
        syncStatus.textContent = "Sync error";
        notify("Server sync failed!", true);
    }
}

function resolveConflicts(serverData) {
    let updated = false;

    serverData.forEach((sv) => {
        const exists = quotes.some((q) => q.id === sv.id);
        if (!exists) {
            quotes.push(sv);
            updated = true;
        }
    });

    if (updated) {
        saveQuotes();
        notify("New updates arrived from the server (server wins)!", false);
    }
}

// Sync every 10 seconds
setInterval(fetchServerQuotes, 10000);

// ===================== Helpers ===================== //
function notify(message, isError = false) {
    if (!notificationBox) return;
    notificationBox.textContent = message;
    notificationBox.style.background = isError ? "#ff8080" : "#90ee90";
    notificationBox.style.display = "block";
    setTimeout(() => (notificationBox.style.display = "none"), 3000);
}

function saveQuotes() {
    localStorage.setItem("quotes", JSON.stringify(quotes));
}
