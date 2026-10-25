const MISSIONS={
  SELL:{
    key:"SELL",label:"Sell for Profit",
    triggers:["Retail / sell it","Launch / drop"],
    productRoles:["Hero seller","Easy add-on","Brand builder","Higher-ticket item","Special item"],
    moneyPrompt:"Prioritize margin, repeatability, and conversion before adding more SKUs.",
    nextAction:"Test one hero product, then expand only after demand is visible."
  },
  STAFF:{
    key:"STAFF",label:"Staff / Team Use",
    triggers:["Staff"],
    productRoles:["Primary uniform","Layering piece","Role identifier","Event backup","Optional retail crossover"],
    moneyPrompt:"Treat staff utility and replacement cost separately from retail margin.",
    nextAction:"Lock garment consistency, sizing, and reorder simplicity before decorative complexity."
  },
  GIFT:{
    key:"GIFT",label:"Gift / Giveaway",
    triggers:["Gift / giveaway"],
    productRoles:["Primary gift","Useful add-on","Premium upgrade","Packaging-friendly item","Low-cost backup"],
    moneyPrompt:"Optimize perceived value, usefulness, and all-in delivered cost rather than retail spread.",
    nextAction:"Choose one useful gift first, then add packaging or a premium tier only if budget supports it."
  },
  EVENT:{
    key:"EVENT",label:"Event Merchandise",
    triggers:["Event"],
    productRoles:["Main event item","Staff item","Guest add-on","Premium keepsake","Post-event carryover"],
    moneyPrompt:"Deadline reliability and quantity accuracy matter more than maximizing assortment.",
    nextAction:"Lock the date, printer deadline, quantity range, and one hero product before expanding."
  },
  BRAND:{
    key:"BRAND",label:"Brand Building",
    triggers:["Brand building"],
    productRoles:["Visibility item","Daily-use item","Staff/client crossover","Premium brand piece","Conversation starter"],
    moneyPrompt:"Judge success by visibility and usefulness as well as direct margin.",
    nextAction:"Choose products people will actually use in public, not simply items that can hold a logo."
  }
};

function inferMission(input){
  const use=String(input.useCase||"");
  for(const mission of Object.values(MISSIONS)){
    if(mission.triggers.includes(use)) return mission;
  }
  if(String(input.audience||"").toLowerCase().includes("profit")) return MISSIONS.SELL;
  if(String(input.audience||"").toLowerCase().includes("staff")) return MISSIONS.STAFF;
  if(String(input.audience||"").toLowerCase().includes("gift")) return MISSIONS.GIFT;
  return MISSIONS.SELL;
}

module.exports={MISSIONS,inferMission};
