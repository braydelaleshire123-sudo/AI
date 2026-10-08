import { pipeline } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1";

const MODEL="onnx-community/Qwen2.5-0.5B-Instruct";
let ai=null, loading=true, busy=false;
const $=id=>document.getElementById(id);
const messages=$("messages"), input=$("input"), send=$("send"), status=$("modelStatus");

function addRow(role,text,typing=false){
  const row=document.createElement("div");
  row.className="row "+role;
  row.innerHTML='<div class="avatar">'+(role==="user"?"Y":"✦")+'</div><div class="bubble"></div>';
  const bubble=row.querySelector(".bubble");
  if(typing) bubble.innerHTML='<span class="typing"><i></i><i></i><i></i></span>';
  else bubble.textContent=text;
  messages.appendChild(row); messages.scrollTop=messages.scrollHeight;
  return bubble;
}
function resetWelcome(){
  messages.innerHTML='<div class="welcome"><div class="big-logo">✦</div><h1>How can I help?</h1><p>Ask me something and I\'ll generate a response using a language model running locally in your browser.</p><div class="examples"><button>Explain black holes simply</button><button>Write a JavaScript function</button><button>Give me a fun science fact</button></div></div>';
}
async function loadModel(){
  status.textContent="Loading model…";
  try{
    const device=navigator.gpu?"webgpu":"wasm";
    ai=await pipeline("text-generation",MODEL,{device});
    loading=false; status.textContent="Ready • "+device.toUpperCase();
    send.disabled=false;
  }catch(e){
    console.error(e); loading=false; status.textContent="Model failed to load";
    addRow("assistant","I couldn't load the local AI model. Try refreshing the page. Your browser may not support the required machine-learning features.");
  }
}
async function answer(text){
  busy=true; send.disabled=true; input.disabled=true;
  addRow("user",text); const bubble=addRow("assistant","",true);
  try{
    const prompt=[{role:"system",content:"You are a helpful, friendly AI assistant. Answer clearly and concisely. Do not claim to be conscious or human."},{role:"user",content:text}];
    const out=await ai(prompt,{max_new_tokens:256,temperature:.7,top_p:.9,do_sample:true});
    const generated=out[0].generated_text;
    let answerText=Array.isArray(generated)?generated[generated.length-1]?.content:"";
    if(!answerText) answerText=String(generated).replace(text,"").trim();
    bubble.textContent=answerText||"I couldn't generate a response.";
  }catch(e){console.error(e);bubble.textContent="Something went wrong while generating that response. Try again."}
  busy=false; input.disabled=false; send.disabled=loading; input.focus();
}
$("composer").addEventListener("submit",e=>{e.preventDefault();const text=input.value.trim();if(!text||busy||loading||!ai)return;input.value="";answer(text)});
input.addEventListener("input",()=>{input.style.height="auto";input.style.height=Math.min(input.scrollHeight,160)+"px"});
input.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();$("composer").requestSubmit()}});
$("clear").onclick=()=>{if(!busy)resetWelcome()};
$("newChat").onclick=()=>{if(!busy){resetWelcome();input.focus()}};
messages.addEventListener("click",e=>{if(e.target.matches(".examples button")){input.value=e.target.textContent;input.focus();input.style.height="auto";input.style.height=input.scrollHeight+"px"}});
send.disabled=true;
loadModel();