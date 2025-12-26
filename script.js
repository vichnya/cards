let users = JSON.parse(localStorage.getItem("users")) || {};
let currentUser = localStorage.getItem("currentUser");

let currentFolder = null;
let currentCardIndex = 0;
let flipped = false;
let selectedCards = new Set();

// ===== BURGER =====
function toggleSidebar() { document.querySelector(".sidebar").classList.toggle("hidden"); }

// ===== AUTH =====
function register() {
    const emailVal = email.value.trim();
    const passVal = password.value.trim();
    if(!emailVal||!passVal)return alert("Введите email и пароль");
    if(users[emailVal])return alert("Аккаунт уже существует");
    users[emailVal] = { password:passVal, folders:{} };
    save(); alert("Аккаунт создан");
}

function login() {
    const emailVal=email.value.trim(); const passVal=password.value.trim();
    if(!users[emailVal]||users[emailVal].password!==passVal) return alert("Неверный email или пароль");
    currentUser=emailVal; localStorage.setItem("currentUser",emailVal); showApp();
}

function logout() { localStorage.removeItem("currentUser"); location.reload(); }

function showApp() { authArea.style.display="none"; appArea.style.display="block"; userInfo.textContent=currentUser; renderFolders(); }

// ===== FOLDERS =====
function createFolder() {
    const name=folderName.value.trim(); if(!name) return;
    users[currentUser].folders[name]=[]; save(); renderFolders();
}

function renderFolders() {
    foldersList.innerHTML="";
    Object.keys(users[currentUser].folders).forEach(name=>{
        const li=document.createElement("li");
        li.textContent=name;
        const btns=document.createElement("span");
        btns.innerHTML=`<button onclick="renameFolder('${name}')">✎</button>
                        <button onclick="deleteFolder('${name}')">🗑</button>`;
        li.appendChild(btns);
        li.onclick=()=>openFolder(name);
        li.draggable=true;
        li.ondragstart=e=>{e.dataTransfer.setData("text/plain",name);}
        li.ondragover=e=>e.preventDefault();
        li.ondrop=e=>{let from=e.dataTransfer.getData("text"); swapFolders(from,name);}
        foldersList.appendChild(li);
    });
}

function renameFolder(name){
    const newName=prompt("Новое название папки:",name);
    if(!newName || newName===name)return;
    users[currentUser].folders[newName]=users[currentUser].folders[name];
    delete users[currentUser].folders[name];
    save(); renderFolders();
}

function deleteFolder(name){ if(confirm("Удалить папку "+name+"?")){ delete users[currentUser].folders[name]; save(); renderFolders(); if(currentFolder===name){cardsGrid.innerHTML=""; currentFolderTitle.textContent="";} } }

function swapFolders(a,b){
    const f=users[currentUser].folders;
    const keys=Object.keys(f);
    const idxA=keys.indexOf(a),idxB=keys.indexOf(b);
    keys[idxA]=b; keys[idxB]=a;
    const newObj={};
    keys.forEach(k=>newObj[k]=f[k]);
    users[currentUser].folders=newObj; save(); renderFolders();
}

function openFolder(name){ currentFolder=name; currentFolderTitle.textContent=name; renderCards(); selectedCards.clear(); }

// ===== CARDS =====
function addCard(){
    const q=question.value.trim(),a=answer.value.trim(); if(!q||!a) return;
    users[currentUser].folders[currentFolder].push({q,a}); save(); renderCards();
}

function renderCards(){
    cardsGrid.innerHTML="";
    users[currentUser].folders[currentFolder].forEach((c,i)=>{
        const div=document.createElement("div");
        div.className="card-preview";
        div.textContent=c.q;
        const chk=document.createElement("input");
        chk.type="checkbox"; chk.onchange=e=>{ if(chk.checked){ selectedCards.add(i); }else{ selectedCards.delete(i); } }
        div.appendChild(chk);

        const btns=document.createElement("span");
        btns.innerHTML=`<button onclick="editCard(${i})">✎</button>
                        <button onclick="deleteCard(${i})">🗑</button>`;
        div.appendChild(btns);

        div.onclick=()=>openFullscreen(i);
        div.draggable=true;
        div.ondragstart=e=>{e.dataTransfer.setData("text/plain",i);}
        div.ondragover=e=>e.preventDefault();
        div.ondrop=e=>{let from=e.dataTransfer.getData("text"); swapCards(Number(from),i);}
        cardsGrid.appendChild(div);
    });
}

function editCard(i){
    const q=prompt("Вопрос:",users[currentUser].folders[currentFolder][i].q);
    const a=prompt("Ответ:",users[currentUser].folders[currentFolder][i].a);
    if(q!=null && a!=null){ users[currentUser].folders[currentFolder][i]={q,a}; save(); renderCards();}
}

function deleteCard(i){ if(confirm("Удалить карточку?")){ users[currentUser].folders[currentFolder].splice(i,1); save(); renderCards(); } }

function deleteSelectedCards(){
    if(!selectedCards.size) return alert("Выберите карточки");
    if(confirm("Удалить выбранные карточки?")){
        const arr=[...selectedCards].sort((a,b)=>b-a);
        arr.forEach(i=>users[currentUser].folders[currentFolder].splice(i,1));
        selectedCards.clear(); save(); renderCards();
    }
}

function swapCards(a,b){
    const cards=users[currentUser].folders[currentFolder];
    [cards[a],cards[b]]=[cards[b],cards[a]];
    save(); renderCards();
}

// ===== FULLSCREEN =====
function openFullscreen(index){ currentCardIndex=index; flipped=false; fullscreen.style.display="flex"; renderFullscreen(); }
function closeFullscreen(){ fullscreen.style.display="none"; }
function renderFullscreen(){ const c=users[currentUser].folders[currentFolder][currentCardIndex];
    cardFront.textContent=c.q; cardBack.textContent=c.a; card.classList.remove("flipped");
}
function flipCard(){ flipped=!flipped; card.classList.toggle("flipped"); }
function nextCard(){ const cards=users[currentUser].folders[currentFolder]; currentCardIndex=(currentCardIndex+1)%cards.length; flipped=false; renderFullscreen(); }
function prevCard(){ const cards=users[currentUser].folders[currentFolder]; currentCardIndex=(currentCardIndex-1+cards.length)%cards.length; flipped=false; renderFullscreen(); }

// ===== SAVE =====
function save(){ localStorage.setItem("users",JSON.stringify(users)); }

// ===== AUTOLOGIN =====
if(currentUser && users[currentUser]) showApp();
