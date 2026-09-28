const READINESS = { new: 0, active: 1, advanced: 2 };

export const ENVIRONMENTS = {
  beauty_salon:{label:'Beauty Salon / Barbershop',category:'community',scanHint:'Aim toward the storefront, business sign, public display, or community board.'},
  church:{label:'Church / Ministry',category:'community',scanHint:'Aim toward the building sign, public resource area, or event information.'},
  bookstore:{label:'Bookstore',category:'commerce',scanHint:'Aim toward the storefront, public display, or resource section.'},
  community_event:{label:'Community Event',category:'community',scanHint:'Aim toward event signage, booths, schedules, or public organizer information.'},
  vendor_market:{label:'Vendor Fair / Market',category:'commerce',scanHint:'Aim toward public vendor signage, market information, or organizer materials.'},
  womens_organization:{label:"Women's Organization",category:'community',scanHint:'Aim toward public organization signage or program information.'},
  school_learning:{label:'School / Learning Environment',category:'education',scanHint:'Aim toward the institution, public program signage, or adult-facing information — not children.'},
  coffee_cafe:{label:'Coffee Shop / Café',category:'community',scanHint:'Aim toward the storefront, community board, or public display.'},
  retail_store:{label:'Retail Store',category:'commerce',scanHint:'Aim toward storefront or public merchandise displays.'},
  community_center:{label:'Community Center',category:'education',scanHint:'Aim toward program boards, facility signage, or public schedules.'},
  senior_organization:{label:'Senior Organization',category:'community',scanHint:'Aim toward public organization or program information.'},
  professional_office:{label:'Professional Office',category:'business',scanHint:'Aim toward the public-facing business identity or service information.'},
  apartment_community:{label:'Apartment / Residential Community',category:'community',scanHint:'Aim toward the leasing office, community board, or public resident-program information.'},
  conference_venue:{label:'Conference / Event Venue',category:'business',scanHint:'Aim toward event signage, sponsor boards, or organizer information.'},
  other_unknown:{label:'Other / Unknown',category:'unknown',scanHint:'Try a clearer view of a storefront, sign, booth, display, event board, or other public information.'}
};

export const OPPORTUNITY_PATHS = [
  {
    pathKey:'SALON_WOC_001',name:'Salon Community Connection',environment:'beauty_salon',
    offerKey:'woc_network',offerName:'Women of Color — The Network',category:'community',
    status:'testing',cameraApproved:true,difficulty:'easy',baseFit:98,minConfidence:.75,minReadiness:'new',recommendedState:'go',
    action:'Ask whether the business allows a community resource QR in an approved display area.',
    why:'This type of business can function as a community connection point, and the approved WOC Network path is designed for low-pressure resource sharing.',
    scripts:{
      quick:'Hi! I’m sharing a community resource. Would you be open to displaying a QR card for customers?',
      friendly:'I’m part of Earn Mode and I’m sharing a community resource that may fit people who visit here. Would you be open to seeing the QR card?',
      professional:'I’m exploring an approved community-resource placement. Who is the right person to ask about a small QR display?'
    },
    guardrail:'Do not infer customer demographics from appearance. The opportunity comes from the public business context, not the people present.',
    trainingKey:'community-qr-placement',
    destinationUrl:'https://womenofcolorstudybibles.com/',
    commerce:{source:'community',kind:'network',priceCents:null,currency:'USD'}
  },
  {
    pathKey:'CHURCH_BIBLE_001',name:'Church Resource Introduction',environment:'church',
    offerKey:'women_bible',offerName:'Women of the Bible for Women of Color',category:'community',
    status:'testing',cameraApproved:true,difficulty:'medium',baseFit:96,minConfidence:.75,minReadiness:'new',recommendedState:'prepare',
    action:'Ask who handles women’s ministry, Bible study resources, or approved resource tables.',
    why:'A clearly identified church can be an appropriate resource environment, but relationship-based introductions are usually better than a quick sales approach.',
    scripts:{
      quick:'Hi! Who handles women’s ministry or Bible-study resources here?',
      friendly:'I’m sharing a Bible resource that may fit women’s groups or study settings. Who would be the best person to show it to?',
      professional:'I’m exploring whether an approved Bible resource fits your ministry or resource table. May I speak with the person who reviews those materials?'
    },
    guardrail:'Do not interrupt worship, prayer, funerals, counseling, or private ministry moments.',
    trainingKey:'church-resource-introduction',
    destinationUrl:'https://urbanspirit.biz/products/women-of-the-bible-for-women-of-color',
    commerce:{source:'shopify',productGid:'gid://shopify/Product/104959049744',variantGid:'gid://shopify/ProductVariant/687494070288',variantNumericId:'687494070288',handle:'women-of-the-bible-for-women-of-color',snapshot:{priceCents:1299,currency:'USD',inventory:688,verifiedAt:'2026-09-27'}}
  },
  {
    pathKey:'BOOKSTORE_WOC_001',name:'Retail Resource Conversation',environment:'bookstore',
    offerKey:'woc_study_bible',offerName:'Women of Color Study Bible — Paperback Edition',category:'commerce',
    status:'testing',cameraApproved:true,difficulty:'medium',baseFit:94,minConfidence:.78,minReadiness:'new',recommendedState:'prepare',
    action:'Ask for the buyer, manager, or person responsible for community/resource purchasing.',
    why:'Bookstores are a direct resource environment, but product placement normally requires a buyer or manager conversation.',
    scripts:{
      quick:'Hi! Who handles buying or local resource recommendations?',
      friendly:'I have an approved Bible resource that may fit your customers. Who would be the right person to show the information to?',
      professional:'I’m exploring whether this title may fit your store’s resource mix. May I connect with the person responsible for purchasing or community programming?'
    },
    guardrail:'Do not imply an existing store relationship, stocking commitment, or guaranteed demand.',
    trainingKey:'retail-buyer-introduction',
    destinationUrl:'https://urbanspirit.biz/products/women-of-color-study-bible-paperback-edition',
    commerce:{source:'shopify',productGid:'gid://shopify/Product/6846844010595',variantGid:'gid://shopify/ProductVariant/40099382362211',variantNumericId:'40099382362211',handle:'women-of-color-study-bible-paperback-edition',snapshot:{priceCents:2999,currency:'USD',inventory:3084,verifiedAt:'2026-09-27'}}
  },
  {
    pathKey:'EVENT_EARN_001',name:'Community Event Connection',environment:'community_event',
    offerKey:'earn_mode',offerName:'Earn Mode',category:'community',
    status:'ready',cameraApproved:true,difficulty:'easy',baseFit:90,minConfidence:.75,minReadiness:'new',recommendedState:'go',
    action:'Identify an approved organizer, information table, or sharing area before presenting an Earn Mode QR.',
    why:'Public community events can support low-pressure introductions when the organizer permits resource sharing.',
    scripts:{quick:'Is there an approved place where community resources can be shared?',friendly:'I’m part of Earn Mode and I have a resource QR. Is there an approved table or area where participants may share information?',professional:'Who handles approved participant or community-resource displays for this event?'},
    guardrail:'Do not claim guaranteed earnings or recruit in restricted event areas.',
    trainingKey:'event-resource-sharing'
  },
  {
    pathKey:'VENDOR_HUB_001',name:'Vendor Market Discovery',environment:'vendor_market',
    offerKey:'hub_merch_botstores',offerName:'HUB Merch / Bot Stores',category:'commerce',
    status:'ready',cameraApproved:true,difficulty:'easy',baseFit:88,minConfidence:.75,minReadiness:'new',recommendedState:'go',
    action:'Check whether the event allows vendor, affiliate, or QR-based product discovery.',
    why:'Vendor environments are already organized around products and discovery, making them a natural place to test approved HUB offers.',
    scripts:{quick:'Is QR-based product sharing allowed for participants here?',friendly:'I have a few approved HUB resources and products. What are the rules for vendor or QR sharing at this event?',professional:'Who manages vendor participation and approved digital product-sharing at this market?'},
    guardrail:'Respect event/vendor rules and do not interfere with other vendors.',
    trainingKey:'vendor-market-sharing'
  },
  {
    pathKey:'CENTER_CREATOR_001',name:'Community Creator Program',environment:'community_center',
    offerKey:'creator_college',offerName:'Creator College',category:'education',
    status:'ready',cameraApproved:true,difficulty:'medium',baseFit:91,minConfidence:.76,minReadiness:'new',recommendedState:'prepare',
    action:'Ask for the adult program director, education coordinator, or community-program manager.',
    why:'Community centers often run learning and enrichment programs, so Creator College can be explored as an adult-led program opportunity.',
    scripts:{quick:'Who handles learning or creator programs here?',friendly:'I’m sharing information about Creator College. Who would review a learning or creator-program resource?',professional:'I’d like to introduce an adult-led creator learning program. Who handles program evaluation or partnerships?'},
    guardrail:'Do not market directly to children; conversations should be with responsible adults or organizations.',
    trainingKey:'creator-program-introduction'
  },
  {
    pathKey:'SENIOR_DEVO_001',name:'Senior Resource Introduction',environment:'senior_organization',
    offerKey:'woc_devotional',offerName:'Women of Color Devotional Resources',category:'community',
    status:'ready',cameraApproved:true,difficulty:'medium',baseFit:84,minConfidence:.78,minReadiness:'new',recommendedState:'prepare',
    action:'Ask the program or resource coordinator whether devotional resources are appropriate for an existing program.',
    why:'A clearly identified senior-serving organization may have resource programs, but the fit must be determined by the organization rather than assumptions about individuals.',
    scripts:{quick:'Who reviews group resources or devotional materials here?',friendly:'I have an approved devotional resource and wanted to see whether it fits any existing programs. Who should I speak with?',professional:'May I share product information with the person responsible for program resources or group materials?'},
    guardrail:'Do not infer health, cognitive ability, religion, or personal needs from a person’s age or appearance.',
    trainingKey:'organization-resource-introduction',
    commerce:{source:'shopify',productGid:'gid://shopify/Product/4495883763811',variantGid:'gid://shopify/ProductVariant/32181573976163',handle:'women-of-color-devotional-book-with-hands-cover'}
  },
  {
    pathKey:'CAFE_COMMUNITY_001',name:'Café Community Board',environment:'coffee_cafe',
    offerKey:'woc_network',offerName:'Women of Color — The Network',category:'community',
    status:'ready',cameraApproved:true,difficulty:'easy',baseFit:80,minConfidence:.78,minReadiness:'new',recommendedState:'prepare',
    action:'Check whether the café has a manager-approved community board or resource display area.',
    why:'Some cafés function as community gathering places, but the camera should confirm an approved sharing mechanism before recommending action.',
    scripts:{quick:'Do you have a community board or approved resource area?',friendly:'I’m sharing a community resource. Is there an approved place where local information can be posted?',professional:'Who manages community-board or local-resource approvals for this location?'},
    guardrail:'Do not distribute materials without business permission.',
    trainingKey:'community-board-placement'
  },
  {
    pathKey:'OFFICE_AGENTX_001',name:'Business Discovery — Agent X',environment:'professional_office',
    offerKey:'agent_x',offerName:'Agent X',category:'business',
    status:'review',cameraApproved:true,difficulty:'advanced',baseFit:82,minConfidence:.82,minReadiness:'advanced',recommendedState:'prepare',
    action:'Prepare a short business-use case and identify an appropriate decision-maker before making an introduction.',
    why:'A professional office may present a business-process opportunity, but Agent X is an advanced offer that requires preparation and a credible business use case.',
    scripts:{quick:'Who handles business systems or operational improvement here?',friendly:'I work with an AI business tool that may help with specific workflows. Who would be appropriate to show a short use case to?',professional:'I’d like to share a concise business automation use case. Who evaluates workflow, customer-experience, or operational technology?'},
    guardrail:'Do not claim ROI, savings, or business outcomes without evidence. Do not cold-pitch employees who are not relevant decision-makers.',
    trainingKey:'advanced-business-discovery'
  },
  {
    pathKey:'APT_CREATOR_001',name:'Resident Program Opportunity',environment:'apartment_community',
    offerKey:'creator_college',offerName:'Creator College / Community Programs',category:'education',
    status:'ready',cameraApproved:true,difficulty:'medium',baseFit:81,minConfidence:.78,minReadiness:'new',recommendedState:'prepare',
    action:'Ask the leasing office or resident-events team whether educational or creator programming is part of their resident activities.',
    why:'Apartment communities can host resident programming, but the right path is through the public leasing or resident-events team, not individual residents.',
    scripts:{quick:'Who handles resident events or learning programs?',friendly:'I’m sharing information about a creator-learning program. Who handles resident programming or community events?',professional:'May I share an adult-led creator-program concept with the person responsible for resident engagement?'},
    guardrail:'Do not identify, target, or record individual residents. Keep outreach to public-facing community staff.',
    trainingKey:'resident-program-introduction'
  }
];

export function getPathsForEnvironment(environment) {
  return OPPORTUNITY_PATHS
    .filter(p => p.environment === environment && p.cameraApproved && ['testing','ready','active','review'].includes(p.status))
    .sort((a,b) => b.baseFit - a.baseFit);
}

export function evaluateOpportunity({environment, confidence, readiness='new'}) {
  if (!ENVIRONMENTS[environment] || environment === 'other_unknown') {
    return {result:'keep_looking',headline:'Keep looking.',message:ENVIRONMENTS.other_unknown.scanHint,alternatives:[]};
  }

  const candidates = getPathsForEnvironment(environment)
    .filter(p => confidence >= p.minConfidence)
    .map(p => {
      const readinessGap = Math.max(0, READINESS[p.minReadiness] - (READINESS[readiness] ?? 0));
      const score = Math.max(0, Math.min(100, Math.round(p.baseFit * .8 + confidence * 100 * .2 - readinessGap * 6)));
      const result = readinessGap > 0 || p.recommendedState === 'prepare' || p.difficulty === 'advanced' ? 'prepare' : 'go';
      return {...p,score,result,readinessGap};
    })
    .sort((a,b) => b.score - a.score);

  if (!candidates.length || candidates[0].score < 70) {
    return {result:'keep_looking',headline:'Keep looking.',message:'I do not see a strong enough approved HUB opportunity here yet.',alternatives:[]};
  }

  const primary = candidates[0];
  const alternatives = candidates.slice(1,3).map(({pathKey,offerKey,offerName,score,difficulty}) => ({pathKey,offerKey,offerName,score,difficulty}));
  return {
    result:primary.result,
    headline:primary.result === 'go' ? "There's one." : 'Good opportunity — prepare first.',
    primary,
    alternatives
  };
}

export function getKnowledgeSummary() {
  const paths = OPPORTUNITY_PATHS.filter(p => p.cameraApproved);
  return {
    environments:Object.keys(ENVIRONMENTS).length,
    opportunityPaths:paths.length,
    statuses:paths.reduce((a,p)=>(a[p.status]=(a[p.status]||0)+1,a),{}),
    categories:[...new Set(paths.map(p=>p.category))].sort(),
    pathKeys:paths.map(p=>p.pathKey)
  };
}
