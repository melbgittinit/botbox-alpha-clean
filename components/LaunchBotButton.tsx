"use client";

import { useState } from "react";

export default function LaunchBotButton({token}:{token:string}){
  const [loading,setLoading]=useState(false);
  const [message,setMessage]=useState("");

  async function launch(){
    setLoading(true); setMessage("");
    try{
      const response=await fetch("/api/core/launch",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({token}),
      });
      const data=await response.json();
      if(!response.ok) throw new Error(data?.error||"Launch failed");
      setMessage(data.message||"Your bot is active.");
      window.location.reload();
    }catch(error){
      setMessage(error instanceof Error?error.message:"Launch could not be completed.");
    }finally{setLoading(false);}
  }

  return <div>
    <button onClick={launch} disabled={loading} style={{display:"inline-block",background:"white",color:"#07101d",padding:"12px 18px",borderRadius:999,fontWeight:900,border:0,cursor:"pointer"}}>{loading?"LAUNCHING…":"LAUNCH BOT →"}</button>
    {message&&<p style={{color:"#aeb9c8",marginTop:12}}>{message}</p>}
  </div>;
}
