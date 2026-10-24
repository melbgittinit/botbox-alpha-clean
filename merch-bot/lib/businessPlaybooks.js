const PLAYBOOKS={
  FOOD:{
    key:"FOOD",label:"Food & Hospitality",
    triggers:/bakery|restaurant|cafe|coffee|chef|cater|bbq|food|donut|barbecue/i,
    priorities:["Useful customer merch","Staff-ready pieces","Repeat-visibility products","Easy local-printer handoff"],
    cautions:["Avoid over-ordering apparel before demand is proven","Keep food-service uniform and retail merch goals separate"],
    nextMoves:["Build a counter-display mini drop","Create staff + customer versions","Use QR/signage to connect in-store traffic to merch"]
  },
  BEAUTY:{
    key:"BEAUTY",label:"Beauty / Salon / Barber",
    triggers:/salon|beauty|barber|spa|hair|nail|esthetic/i,
    priorities:["Lifestyle products","Staff/client crossover","Premium visual consistency","Giftable add-ons"],
    cautions:["Keep luxury positioning consistent across blanks and packaging","Avoid cheap-looking product mixes"],
    nextMoves:["Build a retail shelf capsule","Create staff uniforms separately","Match the hero design to tumblers/totes/crewnecks"]
  },
  CHURCH:{
    key:"CHURCH",label:"Church / Ministry",
    triggers:/church|ministry|choir|faith|pastor|congregation/i,
    priorities:["Event/fundraiser clarity","Member participation","Ministry-specific versions","Easy local-printer workflow"],
    cautions:["Separate fundraiser economics from staff/member gifting","Confirm permissions for ministry logos and scripture/creative assets"],
    nextMoves:["Build an event drop","Create ministry/team variants","Prepare a printer-ready brief for the church vendor"]
  },
  MUSIC:{
    key:"MUSIC",label:"Music / DJ / Artist",
    triggers:/music|artist|singer|dj|band|album|song|rapper|producer/i,
    priorities:["Fan identity","Drop timing","Collector appeal","Song/album visual consistency"],
    cautions:["Confirm commercial rights to supplied lyrics/artwork","Do not turn every song into a full product line"],
    nextMoves:["Build a 3-piece fan drop","Create a poster-led collector lane","Match the approved design across apparel selectively"]
  },
  AUTHOR:{
    key:"AUTHOR",label:"Author / Publisher",
    triggers:/author|book|publisher|writer|novel|devotional/i,
    priorities:["Book-world extension","Giftability","Event/signing merchandise","Cover/brand consistency"],
    cautions:["Do not assume book-cover art can be repurposed without rights clearance","Keep merchandise supportive of the book, not distracting"],
    nextMoves:["Build an author-event capsule","Create reader gifts/add-ons","Match book-world visuals to tote/mug/poster"]
  },
  EVENT:{
    key:"EVENT",label:"Event / Occasion",
    triggers:/event|wedding|conference|festival|reunion|retreat|convention/i,
    priorities:["Deadline awareness","Quantity planning","Guest/staff separation","Simple production path"],
    cautions:["Deadline and fulfillment reliability matter more than adding more products","Avoid complex specialty methods too close to the event"],
    nextMoves:["Build the minimum viable event pack","Separate staff and guest products","Lock printer deadline before expanding the line"]
  },
  PROFESSIONAL:{
    key:"PROFESSIONAL",label:"Professional Service",
    triggers:/realtor|real estate|attorney|lawyer|consult|broker|insurance|accountant|advisor/i,
    priorities:["Client gifting","Premium usefulness","Subtle branding","Higher perceived value"],
    cautions:["Avoid overly promotional apparel unless the audience actually wants it","Prefer useful premium items over generic swag"],
    nextMoves:["Build a client-gift capsule","Create open-house/event add-ons","Use premium drinkware/totes before broad apparel"]
  },
  ORGANIZATION:{
    key:"ORGANIZATION",label:"Organization / School / Club / Team",
    triggers:/school|club|team|nonprofit|association|organization|chapter|foundation/i,
    priorities:["Identity","Fundraising","Role-based variants","Repeatable event use"],
    cautions:["Define who can approve logo/brand use","Keep staff/team/fundraiser SKUs organized"],
    nextMoves:["Build a fundraiser starter line","Create role-based variants","Set an approval owner before print"]
  },
  MERCH_SELLER:{
    key:"MERCH_SELLER",label:"Existing Merch Seller",
    triggers:/merch|apparel brand|clothing brand|streetwear|shopify store|merchandise/i,
    priorities:["Audit existing SKUs","Prune weak items","Improve bundles","Protect margin"],
    cautions:["Do not add products just because MB can","Prioritize conversion, margin and repeatability"],
    nextMoves:["Run KEEP / PUSH / CHANGE / STOP","Build a bundle plan","Identify one hero product and one add-on"]
  },
  GENERAL:{
    key:"GENERAL",label:"General Business",
    triggers:/.*/,
    priorities:["Find the best first product","Keep the first test simple","Protect margin","Use a clear production path"],
    cautions:["Do not make everything at once","Use MB estimates only as estimates until a live quote exists"],
    nextMoves:["Start with Smart Drop","Test one hero product","Expand only after the first result is validated"]
  }
};

function inferPlaybook(input){
  const text=[input.businessType,input.brandName,input.useCase,input.audience].filter(Boolean).join(" ");
  for(const key of ["FOOD","BEAUTY","CHURCH","MUSIC","AUTHOR","EVENT","PROFESSIONAL","ORGANIZATION","MERCH_SELLER"]){
    const p=PLAYBOOKS[key];
    if(p.triggers.test(text)) return {...p,triggers:undefined};
  }
  const p=PLAYBOOKS.GENERAL;
  return {...p,triggers:undefined};
}

module.exports={PLAYBOOKS,inferPlaybook};
