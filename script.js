const menuBtn = document.createElement("button");
menuBtn.textContent = "⋮";
menuBtn.className = "folder-menu-btn";
document.addEventListener("DOMContentLoaded", () => {
    // События авторизации
    document.getElementById("loginBtn").addEventListener("click", login);
    document.getElementById("registerBtn").addEventListener("click", register);
    document.getElementById("addFolderBtn").addEventListener("click", createFolder);
    document.getElementById("addCardBtn").addEventListener("click", addCard);

    if(currentUser && users[currentUser]) showApp();
});

// ===== DATA =====
let users = JSON.parse(localStorage.getItem("users")) || {};
let currentUser = localStorage.getItem("currentUser");
let currentFolder = null;
let currentCardIndex = 0;
let flipped = false;
let editMode = false;
let deleteMode = false;
let selectedCards = new Set();

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

function showApp(){ 
    authArea.style.display="none"; 
    appArea.style.display="block"; 
    userInfo.textContent=currentUser; 
    renderFolders(); 
    createCardActionsMenu();
}

// ===== FOLDERS =====
function createFolder(){ 
    const n=folderName.value.trim(); 
    if(!n) return; 
    users[currentUser].folders[n]=[]; 
    save(); renderFolders(); 
}
function renderFolders(){
    foldersList.innerHTML="";
    Object.keys(users[currentUser].folders).forEach(name=>{
        const li=document.createElement("li");
        li.textContent=name; li.style.position="relative";

        const menuBtn=document.createElement("button"); menuBtn.textContent="⋮"; let menuOpen=false;
        const menu=document.createElement("div"); menu.className="folder-menu";
        menu.innerHTML=`<button onclick="renameFolder('${name}')">Редактировать</button>
                        <button onclick="deleteFolder('${name}')">Удалить</button>`;

        menuBtn.addEventListener("click", e=>{
            e.stopPropagation(); menu.style.display="flex"; menuOpen=true;
            const rect=menuBtn.getBoundingClientRect();
            menu.style.top = rect.bottom - li.getBoundingClientRect().top + "px";
            menu.style.left = rect.left - li.getBoundingClientRect().left + "px";
        });
        menuBtn.addEventListener("mouseleave", ()=>{ setTimeout(()=>{ if(!menu.matches(':hover')&&menuOpen){ menu.style.display="none"; menuOpen=false;} },100); });
        menu.addEventListener("mouseenter", ()=>{ menu.style.display="flex"; menuOpen=true; });
        menu.addEventListener("mouseleave", ()=>{ menu.style.display="none"; menuOpen=false; });

        li.addEventListener("click", ()=>openFolder(name));
        li.draggable=true; li.ondragstart=e=>e.dataTransfer.setData("text/plain",name);
        li.ondragover=e=>e.preventDefault();
        li.ondrop=e=>{ let from=e.dataTransfer.getData("text"); swapFolders(from,name); }

        li.appendChild(menuBtn); li.appendChild(menu);
        foldersList.appendChild(li);
    });
}

function renameFolder(name){ const newName=prompt("Новое имя:",name); if(!newName||newName===name)return; users[currentUser].folders[newName]=users[currentUser].folders[name]; delete users[currentUser].folders[name]; save(); renderFolders(); }
function deleteFolder(name){ if(confirm("Удалить папку "+name+"?")){ delete users[currentUser].folders[name]; save(); renderFolders(); if(currentFolder===name){cardsGrid.innerHTML=""; currentFolderTitle.textContent="";} } }
function swapFolders(a,b){ const f=users[currentUser].folders; const keys=Object.keys(f); const iA=keys.indexOf(a), iB=keys.indexOf(b); keys[iA]=b; keys[iB]=a; const newObj={}; keys.forEach(k=>newObj[k]=f[k]); users[currentUser].folders=newObj; save(); renderFolders(); }
function openFolder(name){ currentFolder=name; currentFolderTitle.textContent=name; editMode=false; deleteMode=false; selectedCards.clear(); renderCards(); hideCardActionsMenu(); }

// ===== CARD ACTIONS MENU =====
function createCardActionsMenu(){
    const menu=document.getElementById("cardActionsMenu");
    const btn=document.getElementById("folderCardMenuBtn"); let open=false;

    btn.addEventListener("click", e=>{
        e.stopPropagation(); menu.style.display="flex"; open=true;
        const rect=btn.getBoundingClientRect();
        menu.style.top = rect.bottom - btn.parentElement.getBoundingClientRect().top + "px";
        menu.style.left = rect.left - btn.parentElement.getBoundingClientRect().left + "px";
    });
    btn.addEventListener("mouseleave", ()=>{ setTimeout(()=>{ if(!menu.matches(':hover')&&open){ menu.style.display="none"; open=false; } },100); });
    menu.addEventListener("mouseenter", ()=>{ menu.style.display="flex"; open=true; });
    menu.addEventListener("mouseleave", ()=>{ menu.style.display="none"; open=false; });
    document.addEventListener("click", e=>{ if(open && !menu.contains(e.target) && e.target!==btn){ menu.style.display="none"; open=false; } });

    document.getElementById("editCardBtn").addEventListener("click", e=>{ e.stopPropagation(); enterEditMode(); menu.style.display="none"; open=false; });
    document.getElementById("deleteCardBtn").addEventListener("click", e=>{ e.stopPropagation(); enterDeleteMode(); menu.style.display="none"; open=false; });
}

// ===== MODE HANDLERS =====
function enterEditMode(){ editMode=true; deleteMode=false; selectedCards.clear(); renderCards(); showModeExitButton(); hideCardActionsMenu(); }
function enterDeleteMode(){ deleteMode=true; editMode=false; selectedCards.clear(); renderCards(); showModeExitButton(); hideCardActionsMenu(); }
function showModeExitButton(){ currentFolderTitle.innerHTML=currentFolder+` <button id="modeExitBtn" onclick="exitMode()">✖</button>`; }
function exitMode(){ editMode=false; deleteMode=false; selectedCards.clear(); renderCards(); currentFolderTitle.textContent=currentFolder; }
function updateDeleteExitButton(){ const btn=document.getElementById("modeExitBtn"); if(selectedCards.size>0){ btn.textContent="🗑"; btn.onclick=confirmDeleteSelectedCards; } else { btn.textContent="✖"; btn.onclick=exitMode; } }

// ===== CARDS =====
function addCard(){ const q=question.value.trim(), a=answer.value.trim(); if(!q||!a)return; users[currentUser].folders[currentFolder].push({q,a}); save(); renderCards(); }
function renderCards(){
    cardsGrid.innerHTML="";
    users[currentUser].folders[currentFolder].forEach((c,i)=>{
        const div=document.createElement("div"); div.className="card-preview"; div.textContent=c.q;

        div.onclick=e=>{
            if(deleteMode){ if(selectedCards.has(i)){ selectedCards.delete(i); div.classList.remove("card-selected"); } else { selectedCards.add(i); div.classList.add("card-selected"); } updateDeleteExitButton(); }
            else if(editMode){ const q=prompt("Вопрос:",c.q); const a=prompt("Ответ:",c.a); if(q!=null && a!=null){ users[currentUser].folders[currentFolder][i]={q,a}; save(); renderCards(); } }
            else openFullscreen(i);
        }

        div.draggable=true; div.ondragstart=e=>e.dataTransfer.setData("text/plain",i);
        div.ondragover=e=>e.preventDefault(); div.ondrop=e=>{ let from=e.dataTransfer.getData("text"); swapCards(Number(from),i); }
        if(selectedCards.has(i)) div.classList.add("card-selected");
        cardsGrid.appendChild(div);
    });
}
function confirmDeleteSelectedCards(){ if(!selectedCards.size)return; if(confirm("Подтвердите удаление выбранных карточек")){ const arr=[...selectedCards].sort((a,b)=>b-a); arr.forEach(i=>users[currentUser].folders[currentFolder].splice(i,1)); selectedCards.clear(); save(); renderCards(); exitMode(); } }
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
