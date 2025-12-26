let users = JSON.parse(localStorage.getItem("users")) || {};
let currentUser = localStorage.getItem("currentUser");

let currentFolder = null;
let currentCardIndex = 0;
let flipped = false;

// ===== BURGER =====
function toggleSidebar(){ document.querySelector(".sidebar").classList.toggle("hidden"); }

// ===== AUTH =====
function register(){
    const e=email.value.trim(), p=password.value.trim();
    if(!e||!p)return alert("Введите email и пароль");
    if(users[e])return alert("Аккаунт уже существует");
    users[e]={password:p, folders:{}};
    save(); alert("Аккаунт создан");
}
function login(){
    const e=email.value.trim(), p=password.value.trim();
    if(!users[e]||users[e].password!==p)return alert("Неверный email или пароль");
    currentUser=e; localStorage.setItem("currentUser",e); showApp();
}
function logout(){ localStorage.removeItem("currentUser"); location.reload(); }
function showApp(){ authArea.style.display="none"; appArea.style.display="block"; userInfo.textContent=currentUser; renderFolders(); }

// ===== FOLDERS =====
function createFolder(){ const n=folderName.value.trim(); if(!n)return; users[currentUser].folders[n]=[]; save(); renderFolders(); }
function renderFolders(){
    foldersList.innerHTML="";
    Object.keys(users[currentUser].folders).forEach(name=>{
        const li=document.createElement("li");
        li.textContent=name;

        const menu=document.createElement("div"); menu.className="dropdown";
        menu.innerHTML=`<button onclick="renameFolder('${name}')">✎ Переименовать</button>
                        <button onclick="deleteFolder('${name}')">🗑 Удалить</button>`;

        const dots=document.createElement("button"); dots.textContent="⋮";
        dots.onclick=e=>{ e.stopPropagation(); menu.style.display=menu.style.display==="flex"?"none":"flex"; }

        li.appendChild(dots); li.appendChild(menu);
        li.onclick=()=>openFolder(name);

        li.draggable=true;
        li.ondragstart=e=>e.dataTransfer.setData("text/plain",name);
        li.ondragover=e=>e.preventDefault();
        li.ondrop=e=>{let from=e.dataTransfer.getData("text"); swapFolders(from,name);}
        foldersList.appendChild(li);
    });
}
function renameFolder(name){ const newName=prompt("Новое имя:",name); if(!newName||newName===name)return; users[currentUser].folders[newName]=users[currentUser].folders[name]; delete users[currentUser].folders[name]; save(); renderFolders(); }
function deleteFolder(name){ if(confirm("Удалить папку "+name+"?")){ delete users[currentUser].folders[name]; save(); renderFolders(); if(currentFolder===name){cardsGrid.innerHTML=""; currentFolderTitle.textContent="";} } }
function swapFolders(a,b){ const f=users[currentUser].folders; const keys=Object.keys(f); const iA=keys.indexOf(a),iB=keys.indexOf(b); keys[iA]=b; keys[iB]=a; const newObj={}; keys.forEach(k=>newObj[k]=f[k]); users[currentUser].folders=newObj; save(); renderFolders(); }
function openFolder(name){ currentFolder=name; currentFolderTitle.textContent=name; renderCards(); }

// ===== CARDS =====
function addCard(){ const q=question.value.trim(), a=answer.value.trim(); if(!q||!a)return; users[currentUser].folders[currentFolder].push({q,a}); save(); renderCards(); }
function renderCards(){
    cardsGrid.innerHTML="";
    users[currentUser].folders[currentFolder].forEach((c,i)=>{
        const div=document.createElement("div"); div.className="card-preview"; div.textContent=c.q;

        const menu=document.createElement("div"); menu.className="dropdown";
        menu.innerHTML=`<button onclick="editCard(${i})">✎ Редактировать</button>
                        <button onclick="deleteCard(${i})">🗑 Удалить</button>`;

        const dots=document.createElement("button"); dots.textContent="⋮";
        dots.onclick=e=>{ e.stopPropagation(); menu.style.display=menu.style.display==="flex"?"none":"flex"; }

        div.appendChild(dots); div.appendChild(menu);

        div.onclick=()=>openFullscreen(i);
        div.draggable=true;
        div.ondragstart=e=>e.dataTransfer.setData("text/plain",i);
        div.ondragover=e=>e.preventDefault();
        div.ondrop=e=>{let from=e.dataTransfer.getData("text"); swapCards(Number(from),i);}
        cardsGrid.appendChild(div);
    });
}

function editCard(i){ const q=prompt("Вопрос:",users[currentUser].folders[currentFolder][i].q); const a=prompt("Ответ:",users[currentUser].folders[currentFolder][i].a); if(q!=null && a!=null){ users[currentUser].folders[currentFolder][i]={q,a}; save(); renderCards();} }
function deleteCard(i){ if(confirm("Удалить карточку?")){ users[currentUser].folders[currentFolder].splice(i,1); save(); renderCards();} }
function swapCards(a,b){ const cards=users[currentUser].folders[currentFolder]; [cards[a],cards[b]]=[cards[b],cards[a]]; save(); renderCards(); }

// ===== FULLSCREEN =====
function openFullscreen(index){ currentCardIndex=index; flipped=false; fullscreen.style.display="flex"; renderFullscreen(); }
function closeFullscreen(){ fullscreen.style.display="none"; }
function renderFullscreen(){ const c=users[currentUser].folders[currentFolder][currentCardIndex]; cardFront.textContent=c.q; cardBack.textContent=c.a; card.classList.remove("flipped"); }
function flipCard(){ flipped=!flipped; card.classList.toggle("flipped"); }
function nextCard(){ const cards=users[currentUser].folders[currentFolder]; currentCardIndex=(currentCardIndex+1)%cards.length; flipped=false; renderFullscreen(); }
function prevCard(){ const cards=users[currentUser].folders[currentFolder]; currentCardIndex=(currentCardIndex-1+cards.length)%cards.length; flipped=false; renderFullscreen(); }

// ===== SAVE =====
function save(){ localStorage.setItem("users",JSON.stringify(users)); }

// ===== AUTOLOGIN =====
if(currentUser && users[currentUser]) showApp();
