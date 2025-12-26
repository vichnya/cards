const folders = {};
let currentFolder = null;
let currentCardIndex = 0;
let showQuestion = true;

// Создание папки
function createFolder() {
    const name = document.getElementById("folderName").value;
    if (!name || folders[name]) return;

    folders[name] = [];
    document.getElementById("folderName").value = "";
    renderFolders();
}

// Отрисовка списка папок
function renderFolders() {
    const list = document.getElementById("foldersList");
    list.innerHTML = "";

    for (let name in folders) {
        const li = document.createElement("li");
        li.textContent = name;
        li.onclick = () => openFolder(name);
        list.appendChild(li);
    }
}

// Открытие папки
function openFolder(name) {
    currentFolder = name;
    currentCardIndex = 0;
    showQuestion = true;

    document.getElementById("folderArea").style.display = "block";
    document.getElementById("currentFolderTitle").textContent =
        "Папка: " + name;

    renderCard();
}

// Добавление карточки
function addCard() {
    const q = document.getElementById("question").value;
    const a = document.getElementById("answer").value;

    if (!q || !a) return;

    folders[currentFolder].push({
        question: q,
        answer: a
    });

    document.getElementById("question").value = "";
    document.getElementById("answer").value = "";

    currentCardIndex = folders[currentFolder].length - 1;
    showQuestion = true;
    renderCard();
}

// Отображение карточки
function renderCard() {
    const area = document.getElementById("cardArea");
    const cards = folders[currentFolder];

    if (!cards || cards.length === 0) {
        area.textContent = "Карточек пока нет";
        return;
    }

    const card = cards[currentCardIndex];
    area.textContent = showQuestion ? card.question : card.answer;
}

// Переворот карточки
function flipCard() {
    showQuestion = !showQuestion;
    renderCard();
}

// Следующая карточка
function nextCard() {
    const cards = folders[currentFolder];
    if (!cards || cards.length === 0) return;

    currentCardIndex = (currentCardIndex + 1) % cards.length;
    showQuestion = true;
    renderCard();
}

// Предыдущая карточка
function prevCard() {
    const cards = folders[currentFolder];
    if (!cards || cards.length === 0) return;

    currentCardIndex =
        (currentCardIndex - 1 + cards.length) % cards.length;
    showQuestion = true;
    renderCard();
}
