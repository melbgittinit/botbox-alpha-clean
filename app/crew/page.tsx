import FactoryRoom from "../../components/FactoryRoom";

export default function CrewRoom(){
  return <FactoryRoom
    eyebrow="MY BOT CREW"
    title="One bot can be the beginning."
    subtitle="Crew suggestions appear only after a customer has shown interest in a useful first bot. Compatible bots should solve adjacent jobs rather than create bundle clutter."
    note="LOCKED RULE: MY BOT CREW means bots the customer owns. BOT FORCE is a later coordination level. BOTxBOT² is not the orchestrator; it belongs to BOT EARN MODE."
    cards={[
      {mark:"↗",title:"Customer Growth Crew",promise:"Find them → reach them → get seen.",description:"Zipper + imPOSTR + TVME. A clear business-growth progression after one member proves useful.",status:"CREW SUGGESTION"},
      {mark:"CC",title:"Creator Launch Crew",promise:"Finish it → publish it → pitch it.",description:"Creator Closer + imPOSTR + TVME. Built around moving an unfinished idea into the world.",status:"CREW SUGGESTION"},
      {mark:"CTRL",title:"Business Control Crew",promise:"Manage work → assets → obligations.",description:"SLIDE HustL + Tracking Bot + Register ME BOT.",status:"CREW SUGGESTION"},
      {mark:"POP",title:"Opportunity Crew",promise:"Find it → evaluate it → pursue the strongest move.",description:"Elevate + POP + Free Money Bot with careful verification rules for opportunity claims.",status:"CREW SUGGESTION"},
      {mark:"BTY",title:"Beauty Growth Crew",promise:"Run the business → attract clients → promote.",description:"Beauty BOT + Zipper + imPOSTR.",status:"CREW SUGGESTION"},
      {mark:"FAM",title:"Family Legacy Crew",promise:"Preserve → encourage → stay connected.",description:"FAM BOT + MY MTC + Coffee Bot / QWAZY.",status:"CREW SUGGESTION"},
    ]}
  />;
}
