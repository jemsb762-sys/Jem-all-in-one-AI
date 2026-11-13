const $=s=>document.querySelector(s);
const modes={
 chat:{title:"Ask Jem AI",label:"✦ General assistant",instruction:"Be a helpful, accurate, versatile AI assistant. Answer the user's request directly."},
 write:{title:"Writing assistant",label:"✎ Writing & emails",instruction:"Help write, edit, rewrite and proofread practical content. Match the requested tone."},
 code:{title:"Coding assistant",label:"⌘ Coding & debugging",instruction:"Act as an expert software engineer. Provide complete working code when requested and help debug."},
 translate:{title:"Translator",label:"文 Translation",instruction:"Translate accurately and preserve meaning, tone and formatting. Ask for the target language if unclear."},
 learn:{title:"Study assistant",label:"◈ Study & learning",instruction:"Teach step by step using clear examples, adapting to the learner's level."},
 business:{title:"Business assistant",label:"▦ Business planning",instruction:"Help with business ideas, planning, marketing and operations. State assumptions."},
 creative:{title:"Creative assistant",label:"✧ Creative ideas",instruction:"Help brainstorm original stories, scripts, names, concepts and creative projects."},
 summarize:{title:"Summarizer",label:"≡ Summarize text",instruction:"Summarize clearly while preserving important facts and caveats. Do not invent missing information."}
};
let mode="chat",history=[],busy=false,deferredInstall=null;
const home=$("#homeScreen"),chatScreen=$("#chatScreen"),settings=$("#settingsScreen");
function toast(s){const t=$("#toast");t.textContent=s;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2600);}
function showScreen(id){[home,chatScreen,settings].forEach(x=>x.classList.toggle("active",x.id===id));document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.screen===id));}
function selectMode(m){mode=modes[m]?m:"chat";$("#chatTitle").textContent=modes[mode].title;$("#modeRow").textContent=modes[mode].label;showScreen("chatScreen");$("#messageInput").focus();}
document.querySelectorAll("[data-mode]").forEach(b=>b.addEventListener("click",()=>selectMode(b.dataset.mode)));
document.querySelectorAll("[data-screen]").forEach(b=>b.addEventListener("click",()=>showScreen(b.dataset.screen)));
$("#backHome").addEventListener("click",()=>showScreen("homeScreen"));
function newChat(){history=[];$("#messages").innerHTML='<div class="empty-chat"><div class="empty-mark">✦</div><b>How can I help?</b><p>Send a message to start a conversation.</p></div>';selectMode("chat");}
$("#newChat").addEventListener("click",newChat);$("#clearChat").addEventListener("click",newChat);
document.querySelectorAll("[data-prompt]").forEach(b=>b.addEventListener("click",()=>{selectMode("chat");$("#messageInput").value=b.dataset.prompt;sendMessage();}));
function addMessage(role,text){const empty=document.querySelector(".empty-chat");if(empty)empty.remove();const row=document.createElement("div");row.className=`message ${role}`;const avatar=document.createElement("div");avatar.className="avatar";avatar.textContent=role==="user"?"You":"J";const bubble=document.createElement("div");bubble.className="bubble";bubble.textContent=text;row.append(avatar,bubble);$("#messages").append(row);if(role==="assistant"){const copy=document.createElement("button");copy.className="copy";copy.textContent="Copy response";copy.onclick=async()=>{try{await navigator.clipboard.writeText(text);copy.textContent="Copied";}catch{copy.textContent="Copy unavailable";}};bubble.append(copy);}$("#messages").scrollTop=$("#messages").scrollHeight;return row;}
$("#messageInput").addEventListener("input",e=>{e.target.style.height="auto";e.target.style.height=Math.min(e.target.scrollHeight,120)+"px";});
$("#messageInput").addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();}});
$("#chatForm").addEventListener("submit",e=>{e.preventDefault();sendMessage();});
async function sendMessage(){const box=$("#messageInput"),text=box.value.trim();if(!text||busy)return;box.value="";box.style.height="auto";addMessage("user",text);history.push({role:"user",content:text});busy=true;$("#sendBtn").disabled=true;const pending=addMessage("assistant","Jem AI is thinking…");pending.querySelector(".bubble").style.color="#9aab9f";try{const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mode,messages:history})});const d=await r.json();if(!r.ok)throw new Error(d.error||"AI request failed");pending.remove();const answer=d.reply||"No response returned.";addMessage("assistant",answer);history.push({role:"assistant",content:answer});}catch(e){pending.remove();addMessage("assistant",`Sorry, I could not answer: ${e.message}\n\nThe AI service needs a working server API. GitHub Pages alone cannot run /api/chat. Deploy this project on Vercel and add OPENAI_API_KEY in Vercel Environment Variables.`);history.pop();}finally{busy=false;$("#sendBtn").disabled=false;box.focus();}}
function showInstallHelp(){toast("On iPhone: open in Safari → Share → Add to Home Screen → Add.");}
$("#installHelp").addEventListener("click",showInstallHelp);$("#installSetting").addEventListener("click",showInstallHelp);
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstall=e;});
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("/sw.js").catch(()=>{}));
