export type FaceStatus = "official" | "approved-baseline" | "selected-final" | "verify" | "pending";

export type FaceAsset = {
  botId: string;
  status: FaceStatus;
  url: string | null;
  alt: string;
  note: string;
};

/**
 * BOT FACTORY FACE OFFICIAL registry.
 *
 * Rules:
 * - One canonical FACE per bot across card, detail and TRY surfaces.
 * - Do not invent a replacement just to fill an empty slot.
 * - Concept art is not promoted to FACE OFFICIAL without verification.
 * - BOTxBOT² is an Earn Mode identity, not a Prebuilt Lot bot.
 */
export const FACE_ASSETS: Record<string, FaceAsset> = {
  mtc: {
    botId: "mtc",
    status: "official",
    url: "https://cdn.shopify.com/s/files/1/1982/3607/files/My_MTC_bot.jpg?v=1787547793",
    alt: "MY MTC angelic bot with halo and wings",
    note: "Locked MY MTC visual identity.",
  },
  impostr: {
    botId: "impostr",
    status: "selected-final",
    url: "https://cdn.shopify.com/s/files/1/1982/3607/files/Im_Postr_Bot_portrait_final.jpg?v=1787541963",
    alt: "imPOSTR bot portrait",
    note: "Selected portrait asset; preserve the approved upper-body/ethereal direction.",
  },
  elevate: {
    botId: "elevate",
    status: "approved-baseline",
    url: "https://cdn.shopify.com/s/files/1/1982/3607/files/Elevate_Bot_A.jpg?v=1786940953",
    alt: "Elevate Bot approved baseline",
    note: "Starter FACE baseline; keep distinct from the broader ELEVATE lane.",
  },
  register: {
    botId: "register",
    status: "official",
    url: "https://cdn.shopify.com/s/files/1/0766/0335/9530/files/register-me-bot-face-official.png?v=1788753892",
    alt: "Register ME BOT official Rg check assistant",
    note: "Recovered from the completed V1.1 build that explicitly identifies the friendly Register Me BOT mascot and locked brand assets. Preserve the stacked REGISTr / ME / BOT and Rg check identity.",
  },
  mebot: { botId:"mebot", status:"pending", url:null, alt:"MeBOT", note:"Exact canonical FACE still needs verification." },
  fam: { botId:"fam", status:"pending", url:null, alt:"FAM BOT", note:"Visual status still needs verification." },
  coffee: { botId:"coffee", status:"verify", url:null, alt:"Coffee Bot / QWAZY", note:"Approved concept assets exist, but exact FACE has not yet been verified." },
  wbells: { botId:"wbells", status:"verify", url:null, alt:"W. Bells", note:"Multiple strong W. Bells variants exist (gentle planner, golden planner, Bell-Born Butler). Do not silently select one as FACE OFFICIAL until the canonical choice is verified." },
  pop: { botId:"pop", status:"pending", url:null, alt:"POP — Predictor On Purpose", note:"Exact canonical FACE still needs verification." },
  zipper: { botId:"zipper", status:"verify", url:null, alt:"Zipper / Lead Zeppelin", note:"Multiple historical directions exist; do not choose one silently." },
  tvme: { botId:"tvme", status:"pending", url:null, alt:"TVME / Get ME on TV", note:"Exact canonical FACE still needs verification." },
  slide: { botId:"slide", status:"pending", url:null, alt:"SLIDE HustL", note:"Exact canonical FACE still needs verification." },
  tracking: { botId:"tracking", status:"pending", url:null, alt:"Tracking Bot", note:"Exact canonical FACE still needs verification." },
  beauty: { botId:"beauty", status:"verify", url:null, alt:"Beauty BOT", note:"Concept direction exists; exact FACE must be confirmed." },
  creator: { botId:"creator", status:"pending", url:null, alt:"Creator Closer Bot", note:"Visual status still needs verification." },
  fundus: { botId:"fundus", status:"pending", url:null, alt:"Fund Us Bot", note:"Exact canonical FACE still needs verification." },
  freemoney: { botId:"freemoney", status:"pending", url:null, alt:"Free Money Bot", note:"Exact canonical FACE still needs verification." },
  ufo: { botId:"ufo", status:"pending", url:null, alt:"UFO BOT", note:"Exact canonical FACE still needs verification." },
};

export function faceFor(botId: string): FaceAsset | undefined {
  return FACE_ASSETS[botId];
}
