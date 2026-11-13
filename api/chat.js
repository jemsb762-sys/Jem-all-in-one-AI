const MODES = {
  chat:"Be a helpful, accurate, versatile AI assistant.",
  write:"Help write, edit, rewrite and proofread practical content.",
  code:"Act as an expert software engineer. Provide complete code when requested.",
  translate:"Translate accurately and preserve meaning, tone and formatting.",
  learn:"Teach step by step using clear examples.",
  business:"Help with business ideas, planning, marketing and operations. State assumptions.",
  creative:"Help brainstorm original creative projects.",
  summarize:"Summarize clearly while preserving important facts and caveats."
};
export default async function handler(req,res){
  res.setHeader("Cache-Control","no-store");
  if(req.method!=="POST")return res.status(405).json({error:"Method not allowed."});
  const key=process.env.OPENAI_API_KEY;
  if(!key)return res.status(500).json({error:"OPENAI_API_KEY is missing in Vercel Environment Variables."});
  try{
    const mode=typeof req.body?.mode==="string"?req.body.mode:"chat";
    const messages=Array.isArray(req.body?.messages)?req.body.messages:[];
    const safe=messages.slice(-20).filter(m=>m&&["user","assistant"].includes(m.role)&&typeof m.content==="string"&&m.content.length<=10000);
    if(!safe.length||safe[safe.length-1].role!=="user")return res.status(400).json({error:"Please enter a message."});
    const upstream=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({model:"gpt-4o-mini",temperature:.5,max_tokens:1800,messages:[{role:"system",content:`You are Jem AI, a general-purpose AI assistant. ${MODES[mode]||MODES.chat} Be honest about uncertainty and do not claim actions you cannot perform.`},...safe]})});
    const data=await upstream.json();
    if(!upstream.ok)return res.status(upstream.status>=500?502:upstream.status).json({error:data?.error?.message||"AI provider request failed."});
    const reply=data?.choices?.[0]?.message?.content?.trim();
    if(!reply)return res.status(502).json({error:"AI provider returned an empty response."});
    return res.status(200).json({reply});
  }catch{return res.status(500).json({error:"Unexpected server error. Please try again."});}
}
