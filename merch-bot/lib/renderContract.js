const RENDER_STATES = [
  "READY_TO_RENDER",
  "RENDERING",
  "RENDERED",
  "PREFLIGHT",
  "CORRECTION_REQUESTED",
  "COMPLETE",
  "FAILED",
  "CANCELLED"
];

const REQUIRED_RENDER_RESULT_FIELDS = [
  "provider",
  "taskId",
  "assetUrl",
  "width",
  "height",
  "mimeType",
  "sourceJobId",
  "conceptId"
];

function validateRenderResult(result){
  if(!result || typeof result!=="object") return {ok:false,error:"result_required"};
  for(const key of REQUIRED_RENDER_RESULT_FIELDS){
    if(result[key]===undefined || result[key]===null || result[key]===""){
      return {ok:false,error:"missing_"+key};
    }
  }
  if(!/^https:///.test(String(result.assetUrl))) return {ok:false,error:"asset_url_must_be_https"};
  if(!Number.isFinite(Number(result.width)) || Number(result.width)<=0) return {ok:false,error:"invalid_width"};
  if(!Number.isFinite(Number(result.height)) || Number(result.height)<=0) return {ok:false,error:"invalid_height"};
  return {ok:true};
}

function preflightChecklist({product,production,result}){
  const checks = [
    {key:"render_result",label:"Render payload complete",pass:validateRenderResult(result).ok},
    {key:"product_known",label:"Selected product known",pass:Boolean(product)},
    {key:"method_guidance",label:"Production guidance present",pass:Boolean(production?.preferredMethods?.length)},
    {key:"print_status_rule",label:"Print-readiness rule present",pass:Boolean(production?.printStatusRule)}
  ];

  if(product==="Hat"){
    checks.push({key:"embroidery_guard",label:"Embroidery/digitization warning present",pass:(production?.specialtyRisks||[]).some(x=>/digitization|embroidery/i.test(x))});
  }
  if(product==="Mug"||product==="Tumbler"){
    checks.push({key:"wrap_guard",label:"Wrap/template warning present",pass:/template|wrap/i.test(String(production?.printStatusRule||""))});
  }
  if(product==="Poster"){
    checks.push({key:"bleed_trim_guard",label:"Bleed/trim requirement present",pass:/bleed|trim/i.test(String(production?.printStatusRule||""))});
  }

  return {
    checks,
    passed:checks.every(c=>c.pass),
    status:checks.every(c=>c.pass)?"PREFLIGHT_READY":"NEEDS_REVIEW"
  };
}

module.exports={
  RENDER_STATES,
  REQUIRED_RENDER_RESULT_FIELDS,
  validateRenderResult,
  preflightChecklist
};
