import FactoryRoom from "../../components/FactoryRoom";

export default function EarnRoom(){
  return <FactoryRoom
    eyebrow="BOT EARN MODE"
    title="Sell bots. Earn from bots."
    subtitle="A real seller room for approved inventory, demonstrations, referral links, prospect matching and follow-up."
    note="LOCKED RULE: BOTxBOT² is the sales/distribution partner for BOT EARN MODE. It is not the master orchestrator of a customer's Crew or Bot Force. Only EARN READY inventory belongs here."
    cards={[
      {mark:"B²",title:"BOTxBOT²",promise:"The bot that helps you sell bots.",description:"Match prospects, prepare demos, organize leads, create referral paths, follow up and recommend the next approved offer.",status:"EARN ENGINE"},
      {mark:"QR",title:"Sell the Prebuilt Lot",promise:"Start with bots that are easy to explain and prove.",description:"Initial Earn catalog should favor stable demos, clear claims, low support burden and clean customer handoff.",status:"STARTER LANE"},
      {mark:"↗",title:"Grow My Bot Business",promise:"Move beyond one-off referrals.",description:"Bundles, local opportunities, organization sales, repeat follow-up, performance review and seller milestones.",status:"ADVANCED LANE"},
      {mark:"✓",title:"EARN READY Certification",promise:"No bot enters the seller catalog just because it exists.",description:"Requires stable Try It, purchase path, support rules, claim language, referral tracking, seller card and customer handoff.",status:"CONTROL GATE"},
      {mark:"$",title:"Earnings Dashboard",promise:"Know what sold, what converted and what to do next.",description:"Performance should be measured from verified source-of-truth transactions before payout or outcome claims.",status:"MEASUREMENT"},
      {mark:"!",title:"Trust & Governance",promise:"No hype. No disguised MLM mechanics. No misleading income promises.",description:"Seller messaging must stay specific, transparent and tied to actual products and verified commissions.",status:"PROTECTION"},
    ]}
  />;
}
