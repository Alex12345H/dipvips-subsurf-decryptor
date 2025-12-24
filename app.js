const K=new Uint8Array([
57,114,107,120,67,80,108,106,83,77,49,71,86,81,104,87,
119,49,114,49,114,75,79,72,71,99,99,98,50,105,74,53
]);

let activeEditor;
let isTree=false,isSplit=false;
let stacks={ed1:[""],ed2:[""]};
let idx={ed1:0,ed2:0};

window.onload=()=>{
    activeEditor=document.getElementById("ed1");
};

function setActive(id){
    activeEditor=document.getElementById(id);
    document.getElementById("nInput").value="profile.json";
}

function showToast(msg){
    const t=document.getElementById("toast");
    t.textContent=msg;
    t.classList.add("show");
    setTimeout(()=>t.classList.remove("show"),2000);
}

async function runDecrypt(){
    try{
        const o=JSON.parse(activeEditor.value);
        const key=await crypto.subtle.importKey("raw",K,{name:"AES-CBC"},false,["decrypt"]);
        const enc=Uint8Array.from(atob(o.data),c=>c.charCodeAt(0));
        const dec=await crypto.subtle.decrypt(
            {name:"AES-CBC",iv:new Uint8Array(16)},key,enc
        );
        const inner=JSON.parse(new TextDecoder().decode(dec));
        activeEditor.value=JSON.stringify({version:o.version||2,data:inner},null,2);
        showToast("Decrypted 🔓");
    }catch{
        showToast("Decrypt failed ❌");
    }
}

async function runEncrypt(){
    try{
        const o=JSON.parse(activeEditor.value);
        const key=await crypto.subtle.importKey("raw",K,{name:"AES-CBC"},false,["encrypt"]);
        const enc=await crypto.subtle.encrypt(
            {name:"AES-CBC",iv:new Uint8Array(16)},
            key,new TextEncoder().encode(JSON.stringify(o.data))
        );
        activeEditor.value=JSON.stringify({
            version:o.version||2,
            data:btoa(String.fromCharCode(...new Uint8Array(enc)))
        });
        showToast("Encrypted 🔒");
    }catch{
        showToast("Encrypt failed ❌");
    }
}

function toggleTree(){isTree=!isTree}
function toggleSplit(){
    isSplit=!isSplit;
    document.getElementById("ws").classList.toggle("split-active",isSplit);
    document.getElementById("p2").style.display=isSplit?"flex":"none";
    document.getElementById("file2Container").style.display=isSplit?"flex":"none";
}
function toggleFull(){
    document.fullscreenElement?
        document.exitFullscreen():
        document.documentElement.requestFullscreen();
}
function runSave(){
    const a=document.createElement("a");
    a.href=URL.createObjectURL(new Blob([activeEditor.value]));
    a.download=document.getElementById("nInput").value;
    a.click();
}
