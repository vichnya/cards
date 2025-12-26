let users = JSON.parse(localStorage.getItem("users")) || {};
let currentUser = localStorage.getItem("currentUser");

let currentFolder = null;
let currentCardIndex = 0;
let showQuestion = true;

// ===== AUTH =====
function register() {
    const email = emailInput().value.trim();
    const password = passwordInput().value.trim();

    if (!email || !password) {
        alert("Введите email и пароль");
        return;
    }
    if (users[email]) {
        alert("Аккаунт с таким email уже существует");
        return;
    }

    users[email] = { password, folders: {} };
    save();
    alert("Аккаунт создан");
}

function login() {
    const email = emailInput().value.trim();
    const password = passwordInput().value.trim();

    if (!users[email] || users[email].password !== password) {
        alert("Неверный email или пароль");
        return;
    }

    currentUser = email;
    localStorage.setItem("currentUser", email);
    showApp();
}

function logout() {
    localStorage.removeItem("currentUser");
    location.reload();
}

function showApp() {
    document.getElementById("authArea").style.display = "none";
    document.getElementById("appArea").style.display = "block";
    document.getElementById("userInfo").textContent = currentUser;
    renderFolders();
}

function emailInput() { return document.getElementById("email"); }
function passwordInput() { return document.getElementById("password"); }

// ===== FOLDERS =====
function createFolder() {
    const name = document.getElementById("folderName").value.trim();
    if (!name) return;

    users[currentUser].folders[name] = [];
    save();
    renderFolders();
}

function renderFolders() {
    const list = document.getElementById("foldersList");
    list.innerHTML = "";

    for (let name in users[currentUser].folders) {
        const li = document.createElement("li");
        li.textContent = name;
        li.onclick = () => openFolder(name);
        list.appendChild(li);
    }
}

function openFolder(name) {
    currentFolder = name;
    document.getElementById("currentFolderTitle").textContent = name;
    renderCards();
}

// ===== CARDS =====
function addCard() {
    const q = document.getElementById("question").value.trim();
    const a = document.getElementById("answer").value.trim();
    if (!q || !a) return;

    users[currentUser].folders[currentFolder].push({ q, a });
    save();
    renderCards();
}

function renderCards() {
    const grid = document.getElementById("cardsGrid");
    grid.innerHTML = "";

    users[currentUser].folders[currentFolder].forEach((card, index) => {
        const div = document.createElement("div");
        div.className = "card-preview";
        div.textContent = card.q;
        div.onclick = () => openFullscreen(index);
        grid.appendChild(div);
    });
}

function openFullscreen(index) {
    currentCardIndex = index;
    showQuestion = true;
    document.getElementById("fullscreen").style.display = "flex";
    renderFullscreen();
}

function closeFullscreen() {
    document.getElementById("fullscreen").style.display = "none";
}

function renderFullscreen() {
    const card = users[currentUser].folders[currentFolder][currentCardIndex];
    const el = document.getElementById("card");
    el.classList.remove("flipped");
    el.textContent = showQuestion ? card.q : card.a;
}

function flipCard() {
    showQuestion = !showQuestion;
    document.getElementById("card").classList.toggle("flipped");
    renderFullscreen();
}

function nextCard() {
    const cards = users[currentUser].folders[currentFolder];
    currentCardIndex = (currentCardIndex + 1) % cards.length;
    showQuestion = true;
    renderFullscreen();
}

function prevCard() {
    const cards = users[currentUser].folders[currentFolder];
    currentCardIndex = (currentCardIndex - 1 + cards.length) % cards.length;
    showQuestion = true;
    renderFullscreen();
}

// ===== SAVE =====
function save() {
    localStorage.setItem("users", JSON.stringify(users));
}

// ===== AUTOLOGIN =====
if (currentUser && users[currentUser]) {
    showApp();
}
