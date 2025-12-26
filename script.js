// =================================================
// ХРАНЕНИЕ ДАННЫХ (ЛОКАЛЬНЫЙ КОМПЬЮТЕР / БРАУЗЕР)
// =================================================
let users = JSON.parse(localStorage.getItem("users")) || {};
let currentUser = localStorage.getItem("currentUser");

// =================================================
// СОСТОЯНИЕ ПРИЛОЖЕНИЯ
// =================================================
let currentFolder = null;
let currentCardIndex = 0;
let showQuestion = true;

// =================================================
// АВТОРИЗАЦИЯ
// =================================================
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

    users[email] = {
        password: password,
        folders: {}
    };

    saveUsers();
    alert("Аккаунт успешно создан");
}

function login() {
    const email = emailInput().value.trim();
    const password = passwordInput().value.trim();

    if (!email || !password) {
        alert("Введите email и пароль");
        return;
    }

    if (!users[email] || users[email].password !== password) {
        alert("Неверный email или пароль");
        return;
    }

    localStorage.setItem("currentUser", email);
    currentUser = email;
    showApp();
}

function logout() {
    localStorage.removeItem("currentUser");
    location.reload();
}

function showApp() {
    document.getElementById("authArea").style.display = "none";
    document.getElementById("appArea").style.display = "block";
    document.getElementById("userInfo").textContent =
        "Пользователь: " + currentUser;
    renderFolders();
}

function emailInput() {
    return document.getElementById("email");
}

function passwordInput() {
    return document.getElementById("password");
}

// =================================================
// ПАПКИ
// =================================================
function createFolder() {
    const name = document.getElementById("folderName").value.trim();
    if (!name) return;

    users[currentUser].folders[name] = [];
    saveUsers();
    renderFolders();
}

function renderFolders() {
    const list = document.getElementById("foldersList");
    list.innerHTML = "";

    const folders = users[currentUser].folders;

    for (let name in folders) {
        const li = document.createElement("li");
        li.textContent = name;
        li.onclick = () => openFolder(name);
        list.appendChild(li);
    }
}

function openFolder(name) {
    currentFolder = name;
    currentCardIndex = 0;
    showQuestion = true;

    document.getElementById("folderArea").style.display = "block";
    document.getElementById("currentFolderTitle").textContent =
        "Папка: " + name;

    renderCard();
}

// =================================================
// КАРТОЧКИ
// =================================================
function addCard() {
    const q = document.getElementById("question").value.trim();
    const a = document.getElementById("answer").value.trim();
    if (!q || !a) return;

    users[currentUser].folders[currentFolder].push({
        question: q,
        answer: a
    });

    saveUsers();
    currentCardIndex =
        users[currentUser].folders[currentFolder].length - 1;
    showQuestion = true;
    renderCard();
}

function renderCard() {
    const area = document.getElementById("cardArea");
    const cards = users[currentUser].folders[currentFolder];

    if (!cards || cards.length === 0) {
        area.textContent = "Карточек пока нет";
        return;
    }

    const card = cards[currentCardIndex];
    area.textContent = showQuestion ? card.question : card.answer;
}

function flipCard() {
    showQuestion = !showQuestion;
    renderCard();
}

function nextCard() {
    const cards = users[currentUser].folders[currentFolder];
    if (!cards.length) return;

    currentCardIndex = (currentCardIndex + 1) % cards.length;
    showQuestion = true;
    renderCard();
}

function prevCard() {
    const cards = users[currentUser].folders[currentFolder];
    if (!cards.length) return;

    currentCardIndex =
        (currentCardIndex - 1 + cards.length) % cards.length;
    showQuestion = true;
    renderCard();
}

// =================================================
// УТИЛИТЫ
// =================================================
function saveUsers() {
    localStorage.setItem("users", JSON.stringify(users));
}

// =================================================
// АВТОВХОД
// =================================================
if (currentUser && users[currentUser]) {
    showApp();
}
