const CONTEXT_TOOLS = {
  FOOD: [
    {key:"staff_retail",label:"Staff vs Retail Split",kind:"split",description:"Separate what employees need from what customers may actually buy."},
    {key:"counter_drop",label:"Counter Drop Planner",kind:"drop",description:"Build a small in-store merch set instead of over-ordering."}
  ],
  BEAUTY: [
    {key:"staff_retail",label:"Staff vs Retail Split",kind:"split",description:"Keep uniforms and client-facing retail merchandise from becoming one muddled line."},
    {key:"shelf_capsule",label:"Retail Shelf Capsule",kind:"drop",description:"Choose a tight, premium set for the salon/barber retail area."}
  ],
  CHURCH: [
    {key:"fundraiser",label:"Fundraiser Goal",kind:"fundraiser",description:"Estimate how many units need to sell to reach a ministry or event goal."},
    {key:"event_pack",label:"Event Pack",kind:"drop",description:"Separate member, staff and keepsake merchandise for one event."}
  ],
  MUSIC: [
    {key:"fan_drop",label:"Fan Drop Planner",kind:"drop",description:"Keep the release focused around one hero item, one add-on and one collector item."},
    {key:"bundle",label:"Bundle Builder",kind:"bundle",description:"Test a simple fan bundle without turning every song into a full collection."}
  ],
  AUTHOR: [
    {key:"signing_pack",label:"Signing / Event Pack",kind:"drop",description:"Build a small book-event merch set around the title or author brand."},
    {key:"reader_bundle",label:"Reader Bundle",kind:"bundle",description:"Pair one useful item with a book-world add-on."}
  ],
  EVENT: [
    {key:"deadline",label:"Deadline Guard",kind:"deadline",description:"Work backward from the event date and protect the production deadline."},
    {key:"event_pack",label:"Minimum Event Pack",kind:"drop",description:"Keep the assortment small enough to deliver reliably."}
  ],
  PROFESSIONAL: [
    {key:"gift_budget",label:"Client Gift Budget",kind:"gift",description:"Work from the total budget to a realistic per-client merchandise target."},
    {key:"gift_capsule",label:"Client Gift Capsule",kind:"drop",description:"Prioritize useful premium pieces over generic swag."}
  ],
  ORGANIZATION: [
    {key:"fundraiser",label:"Fundraiser Goal",kind:"fundraiser",description:"Estimate unit sales needed to reach a school, team or organization goal."},
    {key:"role_split",label:"Role / Team Split",kind:"split",description:"Keep staff, team, fundraiser and event versions organized."}
  ],
  MERCH_SELLER: [
    {key:"clean_house",label:"KEEP / PUSH / CHANGE / STOP",kind:"audit",description:"Audit an existing product instead of automatically adding another SKU."},
    {key:"bundle",label:"Bundle Builder",kind:"bundle",description:"Test whether a hero product and add-on improve the offer."}
  ],
  GENERAL: [
    {key:"first_test",label:"First Test Planner",kind:"drop",description:"Keep the first merchandise test small and easy to measure."}
  ]
};

function toolsFor(job){
  const key=job?.playbook?.key||"GENERAL";
  return CONTEXT_TOOLS[key]||CONTEXT_TOOLS.GENERAL;
}

module.exports={CONTEXT_TOOLS,toolsFor};
