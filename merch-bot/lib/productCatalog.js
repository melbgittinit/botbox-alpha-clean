const PRODUCT_TEMPLATES = {
  Tee: {
    product:"Tee",
    designClasses:["SIMPLE MARK","STATEMENT GRAPHIC","PREMIUM TYPOGRAPHY","DETAILED ILLUSTRATION"],
    preferredMethods:["DTG","DTF","Screen Print"],
    specialtyRisks:["Large solid-ink fields may feel heavy","Screen print may require color separations"],
    printStatusRule:"Template Ready only after blank/SKU and exact print area are known.",
    matchEase:{Hoodie:"EASY",Crewneck:"EASY",Tote:"EASY",Poster:"RECOMPOSE",Hat:"SIMPLIFY",Mug:"RECOMPOSE",Tumbler:"RECOMPOSE",Apron:"EASY",Pillow:"RECOMPOSE"}
  },
  Hoodie: {
    product:"Hoodie",
    designClasses:["SIMPLE MARK","STATEMENT GRAPHIC","PREMIUM TYPOGRAPHY","DETAILED ILLUSTRATION"],
    preferredMethods:["DTG","DTF","Screen Print","Embroidery for simplified marks"],
    specialtyRisks:["Pocket/zipper geometry can restrict front placement","Embroidery requires digitization or vendor prep"],
    printStatusRule:"Do not call embroidery art print-ready until digitization/vendor prep is complete.",
    matchEase:{Tee:"EASY",Crewneck:"EASY",Tote:"EASY",Poster:"RECOMPOSE",Hat:"SIMPLIFY",Mug:"RECOMPOSE",Tumbler:"RECOMPOSE",Apron:"EASY",Pillow:"RECOMPOSE"}
  },
  Crewneck: {
    product:"Crewneck",
    designClasses:["SIMPLE MARK","STATEMENT GRAPHIC","PREMIUM TYPOGRAPHY","DETAILED ILLUSTRATION"],
    preferredMethods:["DTG","DTF","Screen Print","Embroidery for simplified marks"],
    specialtyRisks:["Embroidery requires digitization or vendor prep"],
    printStatusRule:"Exact blank and decoration method required before final preflight.",
    matchEase:{Tee:"EASY",Hoodie:"EASY",Tote:"EASY",Poster:"RECOMPOSE",Hat:"SIMPLIFY",Mug:"RECOMPOSE",Tumbler:"RECOMPOSE",Apron:"EASY",Pillow:"RECOMPOSE"}
  },
  Tote: {
    product:"Tote",
    designClasses:["SIMPLE MARK","STATEMENT GRAPHIC","PREMIUM TYPOGRAPHY","DETAILED ILLUSTRATION"],
    preferredMethods:["DTG","DTF","Screen Print"],
    specialtyRisks:["Seams and gussets can reduce usable print area"],
    printStatusRule:"Confirm bag size and printable panel before final placement.",
    matchEase:{Tee:"EASY",Hoodie:"EASY",Crewneck:"EASY",Poster:"EASY",Hat:"SIMPLIFY",Mug:"RECOMPOSE",Tumbler:"RECOMPOSE",Apron:"EASY",Pillow:"RECOMPOSE"}
  },
  Mug: {
    product:"Mug",
    designClasses:["WRAP DESIGN","PREMIUM TYPOGRAPHY","SIMPLE MARK","REPEAT PATTERN"],
    preferredMethods:["Sublimation","UV Print"],
    specialtyRisks:["Wrap artwork needs left/right handle-safe placement","Color appearance varies by substrate/coating"],
    printStatusRule:"Exact mug template required for wrap and safe-zone checks.",
    matchEase:{Tumbler:"EASY",Tote:"RECOMPOSE",Poster:"RECOMPOSE",Tee:"RECOMPOSE",Hoodie:"RECOMPOSE",Hat:"SIMPLIFY",Apron:"RECOMPOSE",Pillow:"RECOMPOSE"}
  },
  Tumbler: {
    product:"Tumbler",
    designClasses:["WRAP DESIGN","PREMIUM TYPOGRAPHY","SIMPLE MARK","REPEAT PATTERN"],
    preferredMethods:["Sublimation","UV Print","Laser Engraving on compatible blanks"],
    specialtyRisks:["Tapered shapes distort wraps","Engraving is material-specific"],
    printStatusRule:"Exact tumbler dimensions/template required before wrap preflight.",
    matchEase:{Mug:"EASY",Tote:"RECOMPOSE",Poster:"RECOMPOSE",Tee:"RECOMPOSE",Hoodie:"RECOMPOSE",Hat:"SIMPLIFY",Apron:"RECOMPOSE",Pillow:"RECOMPOSE"}
  },
  Hat: {
    product:"Hat",
    designClasses:["SIMPLE MARK","PREMIUM TYPOGRAPHY"],
    preferredMethods:["Embroidery","Patch","Heat Transfer for compatible blanks"],
    specialtyRisks:["Detailed illustration usually needs simplification","Embroidery requires digitization/vendor prep"],
    printStatusRule:"DESIGN READY until stitch method, digitization, and cap panel are confirmed.",
    matchEase:{Tee:"SIMPLIFY",Hoodie:"SIMPLIFY",Crewneck:"SIMPLIFY",Tote:"SIMPLIFY",Apron:"SIMPLIFY",Poster:"SIMPLIFY",Mug:"HARD",Tumbler:"HARD",Pillow:"HARD"}
  },
  Apron: {
    product:"Apron",
    designClasses:["SIMPLE MARK","PREMIUM TYPOGRAPHY","STATEMENT GRAPHIC"],
    preferredMethods:["DTF","Screen Print","Embroidery for simplified marks"],
    specialtyRisks:["Pockets and seams affect placement","Embroidery requires digitization/vendor prep"],
    printStatusRule:"Confirm apron pocket/seam geometry before final placement.",
    matchEase:{Tee:"EASY",Hoodie:"EASY",Crewneck:"EASY",Tote:"EASY",Hat:"SIMPLIFY",Mug:"RECOMPOSE",Tumbler:"RECOMPOSE",Poster:"RECOMPOSE",Pillow:"RECOMPOSE"}
  },
  Pillow: {
    product:"Pillow",
    designClasses:["REPEAT PATTERN","DETAILED ILLUSTRATION","PREMIUM TYPOGRAPHY","STATEMENT GRAPHIC"],
    preferredMethods:["Sublimation","DTG on compatible covers"],
    specialtyRisks:["Seam allowance can crop edge details","Front-only vs all-over templates differ materially"],
    printStatusRule:"Exact cover size and print style required before final art.",
    matchEase:{Poster:"EASY",Tote:"RECOMPOSE",Mug:"RECOMPOSE",Tumbler:"RECOMPOSE",Tee:"RECOMPOSE",Hoodie:"RECOMPOSE",Hat:"HARD",Apron:"RECOMPOSE"}
  },
  Poster: {
    product:"Poster",
    designClasses:["DETAILED ILLUSTRATION","STATEMENT GRAPHIC","PREMIUM TYPOGRAPHY"],
    preferredMethods:["Digital Print","Giclée where appropriate"],
    specialtyRisks:["Aspect ratio changes may require recomposition","Bleed and trim vary by printer"],
    printStatusRule:"Final size, bleed, trim, and paper spec required before print-ready status.",
    matchEase:{Tote:"EASY",Pillow:"EASY",Tee:"RECOMPOSE",Hoodie:"RECOMPOSE",Crewneck:"RECOMPOSE",Mug:"RECOMPOSE",Tumbler:"RECOMPOSE",Hat:"SIMPLIFY",Apron:"RECOMPOSE"}
  }
};

const REQUIRED_PRODUCTS=["Tee","Hoodie","Crewneck","Tote","Mug","Tumbler","Hat","Apron","Pillow","Poster"];
const ALLOWED_MATCH_EASE=new Set(["EASY","RECOMPOSE","SIMPLIFY","HARD"]);

function validateCatalog(){
  const names=Object.keys(PRODUCT_TEMPLATES);
  const missing=REQUIRED_PRODUCTS.filter(name=>!PRODUCT_TEMPLATES[name]);
  const extra=names.filter(name=>!REQUIRED_PRODUCTS.includes(name));
  if(missing.length) throw new Error("Product catalog missing: "+missing.join(", "));
  if(extra.length) throw new Error("Unexpected product catalog entries: "+extra.join(", "));

  for(const name of REQUIRED_PRODUCTS){
    const item=PRODUCT_TEMPLATES[name];
    if(item.product!==name) throw new Error("Product key/name mismatch: "+name);
    if(!Array.isArray(item.designClasses)||!item.designClasses.length) throw new Error("Missing design classes: "+name);
    if(!Array.isArray(item.preferredMethods)||!item.preferredMethods.length) throw new Error("Missing preferred methods: "+name);
    if(!Array.isArray(item.specialtyRisks)) throw new Error("Invalid specialty risks: "+name);
    if(!String(item.printStatusRule||"").trim()) throw new Error("Missing print status rule: "+name);
    for(const [target,ease] of Object.entries(item.matchEase||{})){
      if(!REQUIRED_PRODUCTS.includes(target)) throw new Error(name+" references unknown match target "+target);
      if(!ALLOWED_MATCH_EASE.has(ease)) throw new Error(name+" has invalid match rating "+ease+" for "+target);
    }
  }
  return {ok:true,products:REQUIRED_PRODUCTS.length};
}

function getTemplate(product){
  return PRODUCT_TEMPLATES[product] || null;
}

function getMatchPlan(fromProduct){
  const src=getTemplate(fromProduct);
  if(!src) return [];
  return Object.entries(src.matchEase||{}).map(([product,ease])=>{
    let note="Compatible with adaptation.";
    if(ease==="EASY") note="Strong transfer; light product-specific adaptation.";
    if(ease==="RECOMPOSE") note="Keep the approved idea, but rebuild the layout for the new shape.";
    if(ease==="SIMPLIFY") note="Use a simplified mark or reduced design rather than shrinking the full art.";
    if(ease==="HARD") note="Not a direct match. A simplified or new composition is recommended.";
    return {product,ease,note};
  });
}

module.exports={PRODUCT_TEMPLATES,REQUIRED_PRODUCTS,validateCatalog,getTemplate,getMatchPlan};
