import FactoryRoom from "../../components/FactoryRoom";

export default function ExecutiveRoom(){
  return <FactoryRoom
    eyebrow="EXECUTIVE SUITE"
    title="A quieter room for bigger opportunities."
    subtitle="Institutional and large-scale prospects can explore BrandBridge demonstrations and work with the Executive Agent without turning the whole Factory into an enterprise showroom."
    note="LOCKED RULE: the Executive Suite remains small, discreet and secondary. It is not a dominant Factory destination and has no consumer-price carousel."
    cards={[
      {mark:"BB",title:"Beauty BrandBridge",promise:"From product seller to an ongoing personal beauty relationship.",description:"Private demonstration of how a larger brand could turn transactions into useful ongoing customer relationships.",status:"BRANDBRIDGE DEMO"},
      {mark:"CC",title:"Community Commerce BrandBridge",promise:"From transaction platform to community growth system.",description:"Shows how commerce, participation and useful relationship infrastructure can work together.",status:"BRANDBRIDGE DEMO"},
      {mark:"CR",title:"Creator Commerce BrandBridge",promise:"From publishing tools to a creator-to-income pathway.",description:"Demonstrates a more complete creator relationship across making, packaging, distribution and monetization.",status:"BRANDBRIDGE DEMO"},
      {mark:"JR",title:"Journey BrandBridge",promise:"From a purchase to a complete journey relationship.",description:"Travel/journey demonstration using the Factory's own public-facing concepts rather than implying an airline partnership.",status:"BRANDBRIDGE DEMO"},
      {mark:"EA",title:"BrandBridge Executive Agent",promise:"Show us the opportunity. Build the case. Pilot it intelligently.",description:"A private institutional concierge for deeper opportunity framing, business-case development and pilot planning.",status:"PRIVATE AGENT"},
    ]}
  />;
}
