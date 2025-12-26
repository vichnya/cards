let users = JSON.parse(localStorage.getItem("users")) || {};
let currentUser = localStorage.getItem("currentUser");

let currentFolder = null;
let currentCardIndex = 0;
let flipped = false;

// ===== BURGER =====
function toggleSidebar() {
    document.querySelector(".sidebar").classList.toggle("hidden");
}

// ===== AUTH =====
function register() {
    const email = email.value.trim();
    const password = password.value.trim();

    if (!email || !password) return alert("Введите email и пароль");
    if (users[email]) return alert("Аккаунт уже существует");

    users[email] = { password, folders: {} };
    save();
    alert("Аккаунт создан");
}

function login() {
    const emailVal = email.value.trim();
    const passVal = password.value.trim();

    if (!users[emailVal] || users[emailVal].password !== passVal)
        return alert("Неверный email или пароль");

    currentUser = emailVal;
    localStorage.setItem("currentUser", emailVal);
    showApp();
}

function logout() {
    localStorage.removeItem("currentUser");
    location.reload();
}

function showApp() {
    authArea.style.display = "none";
    appArea.style.display = "block";
    userInfo.textContent = currentUser;
    renderFolders();
}

// ===== FOLDERS =====
function createFolder() {
    const name = folderName.value.trim();
    if (!name) return;

    users[currentUser].folders[name] = [];
    save();
    renderFolders();
}

function renderFolders() {
    foldersList.innerHTML = "";
    for (let name in users[currentUser].folders) {
        const li = document.createElement("li");
        li.textContent = name;
        li.onclick = () => openFolder(name);
        foldersList.appendChild(li);
    }
}

function openFolder(name) {
    currentFolder = name;
    currentFolderTitle.textContent = name;
    renderCards();
}

// ===== CARDS =====
function addCard() {
    const q = question.value.trim();
    const a = answer.value.trim();
    if (!q || !a) return;

    users[currentUser].folders[currentFolder].push({ q, a });
    save();
    renderCards();
}

function renderCards() {
    cardsGrid.innerHTML = "";
    users[currentUser].folders[currentFolder].forEach((c, i) => {
        const div = document.createElement("div");
        div.className = "card-preview";
        div.textContent = c.q;
        div.onclick = () => openFullscreen(i);
        cardsGrid.appendChild(div);
    });
}

// ===== FULLSCREEN =====
function openFullscreen(index) {
    currentCardIndex = index;
    flipped = false;
    fullscreen.style.display = "flex";
    renderFullscreen();
}

function closeFullscreen() {
    fullscreen.style.display = "none";
}

function renderFullscreen() {
    const card = users[currentUser].folders[currentFolder][currentCardIndex];
    document.getElementById("card").classList.remove("flipped");
    document.getElementById("cardFront").textContent = card.q;
    document.getElementById("cardBack").textContent = card.a;
}

function flipCard() {
    flipped = !flipped;
    document.getElementById("card").classList.toggle("flipped");
}

function nextCard() {
    const cards = users[currentUser].folders[currentFolder];
    currentCardIndex = (currentCardIndex + 1) % cards.length;
    flipped = false;
    renderFullscreen();
}

function prevCard() {
    const cards = users[currentUser].folders[currentFolder];
    currentCardIndex =
        (currentCardIndex - 1 + cards.length) % cards.length;
    flipped = false;
    renderFullscreen();
}

// ===== SAVE =====
function save() {
    localStorage.setItem("users", JSON.stringify(users));
}

// ===== AUTOLOGIN =====
if (currentUser && users[currentUser]) showApp();
