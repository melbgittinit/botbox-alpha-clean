export const metadata = {
  title: "Tanya thought this might help | Pretty Girl Palace",
  description: "A customer-flow idea shared through Tanya's Pretty Girl Palace Key.",
};

export default function TanyaActionSignsKey() {
  return (
    <main style={{
      minHeight:"100vh",
      background:"radial-gradient(circle at 50% 0%, rgba(214,179,95,.18), transparent 24rem), linear-gradient(180deg,#25102d,#120a16 58%,#0c0810)",
      color:"#fff8e8",
      fontFamily:"Arial, Helvetica, sans-serif",
      padding:"28px 18px 70px"
    }}>
      <section style={{maxWidth:760,margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:40}}>
          <div style={{width:42,height:42,borderRadius:"50%",display:"grid",placeItems:"center",border:"1px solid rgba(243,218,146,.45)",color:"#f3da92"}}>♛</div>
          <div>
            <strong style={{display:"block",fontFamily:"Georgia,serif",letterSpacing:".12em",color:"#f3da92"}}>PGP</strong>
            <small style={{letterSpacing:".12em",opacity:.7}}>PALACE KEY</small>
          </div>
        </div>

        <div style={{
          border:"1px solid rgba(243,218,146,.26)",
          borderRadius:30,
          padding:"clamp(26px,5vw,52px)",
          background:"linear-gradient(180deg,rgba(77,34,82,.78),rgba(28,14,34,.9))",
          boxShadow:"0 24px 70px rgba(0,0,0,.28)"
        }}>
          <p style={{fontSize:11,fontWeight:900,letterSpacing:".16em",color:"#f3da92",textTransform:"uppercase"}}>TANYA THOUGHT THIS MIGHT HELP</p>
          <h1 style={{fontFamily:"Georgia,serif",fontSize:"clamp(42px,8vw,74px)",lineHeight:.98,margin:"10px 0 18px",color:"#fff0cc"}}>
            Could customers do more without standing in the same line?
          </h1>
          <p style={{fontSize:18,lineHeight:1.65,color:"#eadde8"}}>
            Action Signs turns a sign or QR into a clear next step—ordering, registering, checking in,
            learning more, or taking another simple customer action.
          </p>

          <div style={{display:"grid",gap:12,margin:"28px 0"}}>
            {[
              ["THE IDEA","Give customers one obvious scan-to-action path."],
              ["WHY TANYA SENT THIS","You were talking about customer flow and waiting."],
              ["WHAT THIS DOESN’T PROMISE","No guarantee of shorter lines, more sales, or a particular business result."]
            ].map(([k,v])=>(
              <div key={k} style={{borderTop:"1px solid rgba(255,255,255,.09)",paddingTop:14}}>
                <small style={{display:"block",fontWeight:900,letterSpacing:".12em",color:"#f3da92",marginBottom:6}}>{k}</small>
                <div style={{lineHeight:1.55}}>{v}</div>
              </div>
            ))}
          </div>

          <button style={{
            width:"100%",border:0,borderRadius:16,padding:"17px 18px",fontWeight:900,
            background:"linear-gradient(135deg,#f3da92,#d6b35f)",color:"#2b1730",fontSize:16
          }}>
            SHOW ME AN EXAMPLE
          </button>
          <button style={{
            width:"100%",marginTop:10,border:"1px solid rgba(243,218,146,.32)",borderRadius:16,
            padding:"16px 18px",fontWeight:800,background:"rgba(255,255,255,.035)",color:"#fff8e8",fontSize:16
          }}>
            COULD THIS WORK HERE?
          </button>
        </div>

        <p style={{textAlign:"center",fontSize:11,opacity:.55,marginTop:20}}>
          Shared through Pretty Girl Palace™ · Alpha customer-view prototype
        </p>
      </section>
    </main>
  );
}
