import FactoryRoom from "../../components/FactoryRoom";

export default function GiftRoom(){
  return <FactoryRoom
    eyebrow="BOT GIFT SHOP"
    title="Give somebody a bot."
    subtitle="A warmer late-journey room for useful digital gifts, scheduled delivery and the 'A BOT HAS BEEN BUILT FOR YOU' reveal."
    note="LOCKED RULE: every eligible bot can be gifted, but gifting deserves its own premium experience. Recipient data is not collected in this alpha."
    cards={[
      {mark:"FAM",title:"FAM BOT",promise:"Give a family a place to keep the story.",description:"One of the strongest gift heroes for parents, grandparents, reunions and legacy moments.",status:"GIFT HERO"},
      {mark:"☕",title:"Coffee Bot / QWAZY",promise:"Send somebody a better morning.",description:"Low-friction, light, habitual and naturally giftable.",status:"GIFT HERO"},
      {mark:"WB",title:"W. Bells",promise:"Give the couple some help holding the wedding together.",description:"A natural wedding or engagement gift with sender message and scheduled reveal later.",status:"GIFT HERO"},
      {mark:"MTC",title:"MY MTC",promise:"Send some encouragement.",description:"Faith and encouragement gifting with careful privacy boundaries between sender, recipient and any organization.",status:"GIFT HERO"},
      {mark:"ME",title:"MeBOT",promise:"Give somebody a little help managing life.",description:"Personal support gift for graduates, new beginnings and people carrying a lot.",status:"GIFT HERO"},
      {mark:"CC",title:"Creator Closer",promise:"Give a creator help getting the idea finished.",description:"Useful for graduates, entrepreneurs and creators preparing something for the world.",status:"GIFT HERO"},
    ]}
  />;
}
