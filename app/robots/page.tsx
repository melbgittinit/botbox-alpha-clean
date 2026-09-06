import FactoryRoom from "../../components/FactoryRoom";

export default function RobotsRoom(){
  return <FactoryRoom
    eyebrow="THE BACK DOOR — REAL ROBOTS"
    title="Looking for an actual robot?"
    subtitle="This is the separate physical-robot showroom: high-end, machinery-focused and intentionally distinct from the main AI-agent Factory."
    note="LOCKED RULE: physical robots remain an adjacent credibility and commerce lane. They must not make FAM BOT, Zipper or the other digital agents look like humanoid robots."
    cards={[
      {mark:"H",title:"Humanoid Robots",promise:"Explore real embodied systems without confusing them with the digital bot catalog.",description:"Aspirational, high-ticket and heavily qualification-dependent. Public claims and availability must be verified before sale.",status:"PHYSICAL ROBOT LANE"},
      {mark:"Y",title:"Landscaping & Yard Robots",promise:"Machines that can work outside in practical environments.",description:"Potential affiliate or direct-commerce lane for mowing, grounds care and related robotic equipment where appropriate.",status:"PHYSICAL ROBOT LANE"},
      {mark:"B",title:"Business & Service Robots",promise:"Physical automation for hospitality, delivery, cleaning and other operations.",description:"A category for verified real-world machines rather than generic sci-fi imagery.",status:"PHYSICAL ROBOT LANE"},
      {mark:"I",title:"Industrial & Specialty Robots",promise:"Advanced machinery for specialized commercial work.",description:"Higher-complexity products that should use vendor-specific verification, pricing and suitability checks before any purchase path is exposed.",status:"PHYSICAL ROBOT LANE"},
    ]}
  />;
}
