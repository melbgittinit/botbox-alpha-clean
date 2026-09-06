import FactoryRoom from "../../components/FactoryRoom";

export default function ServiceRoom(){
  return <FactoryRoom
    eyebrow="SERVICE DEPARTMENT"
    title="Tune it. Train it. Upgrade it."
    subtitle="The return lane for customers who already own a bot and need maintenance, improvement, expansion or help."
    note="LOCKED FLOW: BOT CHECK-IN → DIAGNOSTIC → TUNE / TRAIN / UPGRADE → TEST → RECERTIFY. Service is part of ownership confidence and repeat use, not an afterthought."
    cards={[
      {mark:"TUNE",title:"Tune-Up",promise:"Make the bot work better for the job it already has.",description:"Review prompts, settings, habits, weak spots and usage patterns without changing the bot's core identity.",status:"SERVICE LANE"},
      {mark:"TRAIN",title:"Train It",promise:"Teach the bot more of what it needs to know.",description:"Add approved context, refine examples and improve its fit for the customer or organization.",status:"SERVICE LANE"},
      {mark:"↑",title:"Upgrade It",promise:"Add a capability when the customer actually needs it.",description:"Install a skill or move to a stronger operating tier with clear pricing and a contained reason.",status:"SERVICE LANE"},
      {mark:"FIX",title:"Fix It",promise:"Repair a broken or confusing experience.",description:"Diagnose failed behavior, missing entitlement, broken connection or setup problems before selling anything else.",status:"SERVICE LANE"},
      {mark:"+",title:"Expand It",promise:"Give the existing bot a broader useful role.",description:"Extend scope carefully when the current bot is still the right product rather than forcing a new purchase.",status:"SERVICE LANE"},
      {mark:"CREW",title:"Add Another Bot",promise:"When a separate job deserves a separate specialist.",description:"Route the customer back to the Prebuilt Lot or Build-A-Bot and recommend a compatible Crew member only when useful.",status:"RETURN TO FACTORY"},
    ]}
  />;
}
