const agents=[
 {id:"researcher",name:"ORION",role:"Researcher",icon:"🔎",lines:[
  "I’ll break the mission into the information we actually need.",
  "I found the key constraints: clarity, safety, and a measurable result.",
  "I’m passing the requirements to the planner."
 ]},
 {id:"planner",name:"NOVA",role:"Planner",icon:"🧠",lines:[
  "I’ll turn those requirements into a sequence of manageable steps.",
  "The plan should include checkpoints so another agent can verify each stage.",
  "Sending the draft plan to the builder."
 ]},
 {id:"builder",name:"ATLAS",role:"Builder",icon:"🔧",lines:[
  "I can turn that plan into a concrete workflow.",
  "I’ll keep the workflow modular so it is easy to change.",
  "Draft complete. Handing it to the critic."
 ]},
 {id:"critic",name:"ECHO",role:"Critic",icon:"🛡️",lines:[
  "I’m checking the proposal for gaps and unnecessary complexity.",
  "The main improvement is to add a final verification step.",
  "Approved. The swarm has a complete plan."
 ]}
];

const $=id=>document.getElementById(id);
const agentBox=$("agents"), log=$("log"), count=$("count"), statusText=$("statusText"), dot=$("dot");
let running=false, timer=null, step=0, messages=0;

agentBox.innerHTML=agents.map(a=>`<article class="agent" id="agent-${a.id}">
  <div class="icon">${a.icon}</div><h3>${a.name}</h3><div class="role">${a.role}</div>
  <div class="thought" id="thought-${a.id}">Waiting...</div>
</article>`).join("");

function setActive(id,text){
  document.querySelectorAll(".agent").forEach(x=>x.classList.remove("active"));
  const card=$("agent-"+id); if(card){card.classList.add("active");$("thought-"+id).textContent=text}
}
function addMessage(agent,text){
  if(messages===0) log.innerHTML="";
  const now=new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit",second:"2-digit"});
  const row=document.createElement("div"); row.className="message";
  row.innerHTML=`<div class="from">${agent.name}<small>${agent.role}</small></div><div class="text">${text}<span class="time">${now}</span></div>`;
  log.appendChild(row); log.scrollTop=log.scrollHeight; messages++; count.textContent=messages+" message"+(messages===1?"":"s");
}
function finish(){
  running=false; clearInterval(timer); timer=null;
  document.body.classList.remove("running"); statusText.textContent="COMPLETE";
  document.querySelectorAll(".agent").forEach(x=>x.classList.remove("active"));
}
function tick(){
  if(!running)return;
  const a=agents[step%agents.length];
  const text=a.lines[Math.floor(step/agents.length)%a.lines.length];
  setActive(a.id,text);
  addMessage(a,text);
  step++;
  if(step>=12) setTimeout(finish,900);
}
$("start").onclick=()=>{
  if(running)return;
  running=true; step=0; messages=0; count.textContent="0 messages"; log.innerHTML="";
  document.body.classList.add("running"); statusText.textContent="RUNNING";
  addMessage(agents[0],"Mission received: "+$("mission").value);
  step=0; tick(); timer=setInterval(tick,1500);
};
$("stop").onclick=()=>{
  if(!running)return;
  running=false; clearInterval(timer); timer=null; document.body.classList.remove("running"); statusText.textContent="PAUSED";
  addMessage(agents[0],"Simulation paused. No external systems are being contacted.");
};
$("clear").onclick=()=>{
  if(running)return;
  log.innerHTML='<div class="empty">Press Start to begin the simulation.</div>';
  messages=0; step=0; count.textContent="0 messages"; statusText.textContent="READY";
  agents.forEach(a=>$("thought-"+a.id).textContent="Waiting...");
};