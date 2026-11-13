const $=s=>document.querySelector(s);
const promptBox=$("#prompt"),chat=$("#chat"),welcome=$("#welcome"),send=$("#send");
let mode="chat",busy=false;
const modes={
 chat:{label:"✦ General assistant",instruction:"Act as a helpful, accurate, versatile AI assistant. Answer the user's request directly."},
 write:{label:"✎ Writing & emails",instruction:"Help the user write, edit, rewrite, proofread, and improve practical written content. Match the requested tone."},
 code:{label:"⌘ Coding & debugging",instruction:"Act as an expert software engineer. Explain briefly, provide complete working code when requested, and help debug carefully."},
 translate:{label:"文 Translation",instruction:"Translate accurately. Preserve meaning, tone, names, formatting, and context. If the target language is unclear, ask which language."},
 summarize:{label:"≡ Summarize text",instruction:"Summarize the provided content clearly. Preserve important facts, figures, and caveats. Do not invent missing information."},
 learn:{label:"◈ Study & learning",instruction:"Teach step by step, adapt to the learner, use clear examples, and check understanding when useful."},
 business:{label:"▦ Business ideas",instruction:"Help with business planning, marketing, operations, budgeting, and practical business ideas. State assumptions and avoid pretending estimates are guaranteed."},
 creative:{label:"✧ Creative ideas",instruction:"Be imaginative and original. Help brainstorm concepts, stories, names, scripts, plans, and creative projects."}
};
let history=[];
function setMode(next){
 mode=next in modes?next:"chat";
 document.querySelectorAll("[data-mode]").forEach(el=>el.classList.toggle("active",el.dataset.mode===mode));
 $("#modeIndicator").textContent=modes[mode].label;
 if(window.innerWidth<650)$("#sidebar").classList.remove("open");
 promptBox.focus();
}
document.querySelectorAll("[data-mode]").forEach(el=>el.addEventListener("click",()=>setMode(el.dataset.mode)));
function addMessage(role,text){
 welcome.style.display="none";
 const row=document.createElement("div");row.className=`message ${role}`;
 const av=document.createElement("div");av.className="bubble-avatar";av.textContent=role==="user"?"You":"J";
 const body=document.createElement("div");body.className="bubble";body.textContent=text;
 row.append(av,body);chat.append(row);
 if(role==="assistant"){
  const copy=document.createElement("button");copy.className="copy";copy.textContent="Copy response";
  copy.onclick=async()=>{try{await navigator.clipboard.writeText(text);copy.textContent="Copied";}catch{copy.textContent="Unable to copy";}};
  body.append(copy);
 }
 $("#workspace").scrollTop=$("#workspace").scrollHeight;
 return row;
}
function newChat(){history=[];chat.innerHTML="";welcome.style.display="block";setMode("chat");}
$("#newChat").addEventListener("click",newChat);
$("#menuBtn").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));
promptBox.addEventListener("input",()=>{promptBox.style.height="auto";promptBox.style.height=Math.min(promptBox.scrollHeight,140)+"px";});
promptBox.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();}});
$("#chatForm").addEventListener("submit",e=>{e.preventDefault();sendMessage();});
async function sendMessage(){
 const text=promptBox.value.trim();if(!text||busy)return;
 promptBox.value="";promptBox.style.height="auto";
 addMessage("user",text);
 history.push({role:"user",content:text});
 busy=true;send.disabled=true;
 const pending=addMessage("assistant","Jem AI is thinking…");pending.querySelector(".bubble").classList.add("thinking");
 try{
  const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mode,messages:history})});
  const data=await r.json();if(!r.ok)throw new Error(data.error||"AI request failed.");
  const answer=data.reply||"No response was returned.";
  pending.remove();addMessage("assistant",answer);history.push({role:"assistant",content:answer});
 }catch(err){
  pending.remove();addMessage("assistant",`I couldn't complete that request: ${err.message}\n\nCheck your Vercel OPENAI_API_KEY setting and redeploy. Your API key must stay in Vercel, not in this app's public files.`);
  history.pop();
 }finally{busy=false;send.disabled=false;promptBox.focus();}
}
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("/sw.js").catch(()=>{}));
