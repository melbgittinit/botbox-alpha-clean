import { NextResponse } from "next/server";

type Fit = "STRONG_FIT" | "WORTH_SHOWING" | "ASK_FIRST" | "NOT_THIS_ONE";

type RuleResult = {
  fit: Fit;
  productName?: string;
  observed: string;
  reason: string;
  whatToSay?: string;
  dontPromise?: string;
  clarification?: string;
  sanity: "SAY_SOMETHING" | "ASK_FIRST" | "SAVE_FOR_LATER" | "LEAVE_IT";
};

function normalize(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

function noFit(signal: string, reason?: string): RuleResult {
  return {
    fit: "NOT_THIS_ONE",
    observed: signal || "Not enough information yet.",
    reason:
      reason ||
      "PGP does not have a clear approved match from what was observed.",
    sanity: "LEAVE_IT",
  };
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const environment = normalize(body.environment);
  const signal = normalize(body.signal);

  let result: RuleResult = noFit(signal);

  if (environment.includes("restaurant")) {
    if (signal.includes("long line") || signal.includes("ordering") || signal.includes("slow")) {
      result = {
        fit: "STRONG_FIT",
        productName: "Action Signs",
        observed: signal,
        reason:
          "A scan-to-action path may move simple ordering, registration, or information steps away from one crowded point.",
        whatToSay:
          "Y’all have a great crowd, but everybody’s getting stacked up right here. I know something that may make that easier.",
        dontPromise:
          "Do not claim it will eliminate every line, guarantee faster service, or guarantee more sales.",
        sanity: "SAY_SOMETHING",
      };
    } else if (signal.includes("confused") || signal.includes("signage") || signal.includes("what to do")) {
      result = {
        fit: "ASK_FIRST",
        productName: "Action Signs",
        observed: signal,
        reason:
          "The issue may be an unclear customer action path, but PGP needs one more fact before recommending a solution.",
        clarification:
          "Are customers confused about where to order, where to pay, or what to do next?",
        dontPromise:
          "Do not assume a signage problem until you know what customers are actually trying to do.",
        sanity: "ASK_FIRST",
      };
    } else if (signal.includes("repeat") || signal.includes("loyalty")) {
      result = {
        fit: "WORTH_SHOWING",
        productName: "Bot Stores",
        observed: signal,
        reason:
          "The restaurant already has traffic; the opportunity may be a clearer digital return-customer path.",
        whatToSay:
          "You already have people coming in. I’d be thinking about one easy digital way to keep them connected after they leave.",
        dontPromise:
          "Do not promise repeat visits or higher revenue.",
        sanity: "SAY_SOMETHING",
      };
    } else if (signal.includes("needs more customers")) {
      result = {
        fit: "ASK_FIRST",
        observed: signal,
        reason: "“Needs more customers” is too broad to diagnose responsibly.",
        clarification:
          "Do they need new customers, repeat customers, better-paying customers, or more event traffic?",
        sanity: "ASK_FIRST",
      };
    }
  } else if (environment.includes("salon")) {
    if (signal.includes("return") || signal.includes("loyalty") || signal.includes("follow")) {
      result = {
        fit: "STRONG_FIT",
        productName: "Beauty Bot",
        observed: signal,
        reason:
          "A salon with existing traffic but weak return-customer follow-up is a direct Beauty Bot use case.",
        whatToSay:
          "You already have customers coming through. I’d be thinking about making it easier to keep them connected and coming back.",
        dontPromise: "Do not promise repeat visits, bookings, or revenue growth.",
        sanity: "SAY_SOMETHING",
      };
    } else if (signal.includes("booking") || signal.includes("questions") || signal.includes("confused")) {
      result = {
        fit: "WORTH_SHOWING",
        productName: "Beauty Bot",
        observed: signal,
        reason:
          "Repeated booking or service questions may be a useful customer-facing automation opportunity.",
        whatToSay:
          "Your team answers the same questions a lot. There may be a way to let customers get some of that without waiting on you.",
        dontPromise:
          "Do not claim the bot replaces professional judgment or every staff interaction.",
        sanity: "SAY_SOMETHING",
      };
    } else {
      result = noFit(
        signal,
        "A busy or attractive salon is not automatically a sales opportunity. PGP needs an actual operating or customer problem."
      );
    }
  } else if (environment.includes("school")) {
    if (signal.includes("creative") || signal.includes("creator") || signal.includes("students making")) {
      result = {
        fit: "STRONG_FIT",
        productName: "Creator College",
        observed: signal,
        reason:
          "The school is explicitly interested in students making, building, or creating rather than only consuming.",
        whatToSay:
          "You were talking about getting students to make things. I know an experience built around exactly that.",
        dontPromise:
          "Do not promise academic outcomes, funding, employment, or student income.",
        sanity: "SAY_SOMETHING",
      };
    } else if (signal.includes("registration") || signal.includes("check-in") || signal.includes("line")) {
      result = {
        fit: "STRONG_FIT",
        productName: "Action Signs",
        observed: signal,
        reason:
          "A repeated school check-in or event-registration step can be a legitimate scan-to-action use case.",
        whatToSay:
          "You’ve got everybody doing the same step right here. There may be a cleaner scan-and-go version of part of this.",
        dontPromise:
          "Do not bypass school security, consent, accessibility, or safeguarding requirements.",
        sanity: "SAY_SOMETHING",
      };
    } else {
      result = {
        fit: "ASK_FIRST",
        observed: signal,
        reason: "PGP needs to know what the school is actually trying to improve.",
        clarification:
          "Are they looking for student creativity, school spirit/team activity, event flow, parent engagement, or something else?",
        sanity: "ASK_FIRST",
      };
    }
  } else if (environment.includes("church")) {
    if (signal.includes("registration") || signal.includes("check-in") || signal.includes("line") || signal.includes("sign")) {
      result = {
        fit: "STRONG_FIT",
        productName: "Action Signs",
        observed: signal,
        reason:
          "Manual registration, repeated instructions, or a crowded check-in point can be a legitimate scan-to-action use case.",
        whatToSay:
          "Everybody is doing the same check-in step right here. There may be a simpler scan-and-go way to handle part of this.",
        dontPromise:
          "Do not claim the system replaces staff judgment, pastoral care, or required safeguarding processes.",
        sanity: "SAY_SOMETHING",
      };
    } else if (signal.includes("vbs") || signal.includes("sunday school") || signal.includes("lesson")) {
      result = {
        fit: "STRONG_FIT",
        productName: "Sunday School Machine / VBS Maker",
        observed: signal,
        reason:
          "The church is actively building educational or VBS programming that matches an approved HUB solution.",
        whatToSay:
          "Before y’all build all of that from scratch, there’s something you should see.",
        dontPromise:
          "Do not imply denominational approval or that the material replaces church leadership review.",
        sanity: "SAY_SOMETHING",
      };
    }
  } else if (environment.includes("store")) {
    if (signal.includes("what to do") || signal.includes("confused") || signal.includes("digital") || signal.includes("follow-up")) {
      result = {
        fit: "WORTH_SHOWING",
        productName: "Bot Stores",
        observed: signal,
        reason:
          "The business may benefit from a clearer digital customer path or a focused customer-facing bot.",
        whatToSay:
          "I like the business. I just don’t think a first-time customer always knows what to do next. There’s something I want to show you.",
        dontPromise:
          "Do not promise traffic, sales, or automation of work that still requires a person.",
        sanity: "SAY_SOMETHING",
      };
    } else if (signal.includes("sign") || signal.includes("line") || signal.includes("checkout")) {
      result = {
        fit: "WORTH_SHOWING",
        productName: "Action Signs",
        observed: signal,
        reason:
          "A passive sign or repeated customer step may be converted into a clearer scan-to-action path.",
        whatToSay:
          "You’ve got the sign already. I’m wondering if it could actually help the customer do the next thing.",
        dontPromise:
          "Do not assume a QR is better unless it genuinely removes friction.",
        sanity: "SAY_SOMETHING",
      };
    }
  } else if (environment.includes("event")) {
    if (signal.includes("registration") || signal.includes("check-in") || signal.includes("line") || signal.includes("scattered")) {
      result = {
        fit: "STRONG_FIT",
        productName: "Action Signs",
        observed: signal,
        reason:
          "Event registration, repeated directions, and scattered attendee actions are strong scan-to-action use cases.",
        whatToSay:
          "You’re sending people to a few different places for one event. There may be a way to turn that into one simple doorway.",
        dontPromise:
          "Do not claim every event workflow can be replaced by one QR.",
        sanity: "SAY_SOMETHING",
      };
    } else if (signal.includes("wedding") || signal.includes("planner") || signal.includes("six tools")) {
      result = {
        fit: "WORTH_SHOWING",
        productName: "Wedding / Event System",
        observed: signal,
        reason:
          "The organizer is juggling multiple guest, content, or planning touchpoints that may benefit from a unified experience.",
        whatToSay:
          "You’ve got a lot of pieces happening in different places. There’s an event system I think you should see.",
        dontPromise:
          "Do not imply it replaces a professional planner or guarantees attendance.",
        sanity: "SAY_SOMETHING",
      };
    }
  } else if (environment.includes("bar") || environment.includes("club")) {
    if (signal.includes("flyer") || signal.includes("social") || signal.includes("repeat") || signal.includes("fan")) {
      result = {
        fit: "WORTH_SHOWING",
        productName: "Dude Fan System",
        observed: signal,
        reason:
          "The venue appears to create attention for individual nights without an obvious system for retaining that audience.",
        whatToSay:
          "You’ve got people here tonight. The question is how easy it is to keep them connected after tonight.",
        dontPromise:
          "Do not promise attendance, revenue, or customer retention.",
        sanity: "SAY_SOMETHING",
      };
    }
  } else if (environment.includes("author") || environment.includes("creator")) {
    if (signal.includes("book") || signal.includes("sales") || signal.includes("promotion") || signal.includes("published")) {
      result = {
        fit: "ASK_FIRST",
        productName: "Book Bomb Bot",
        observed: signal,
        reason:
          "Book Bomb can fit an already-published book that the author actively wants to promote.",
        clarification: "Is the book already published and available for people to buy?",
        dontPromise:
          "Do not promise bestseller status, rankings, media placement, or a guaranteed number of sales.",
        sanity: "ASK_FIRST",
      };
    } else if (signal.includes("audience") || signal.includes("nothing to sell") || signal.includes("product")) {
      result = {
        fit: "WORTH_SHOWING",
        productName: "Creator College",
        observed: signal,
        reason:
          "A creator with attention but no clear offer may benefit from a structured build path before trying to sell harder.",
        whatToSay:
          "You already have attention. I’d think about what people can actually do next with you.",
        dontPromise:
          "Do not imply every audience should be monetized or that a product will sell.",
        sanity: "SAY_SOMETHING",
      };
    }
  } else if (environment.includes("business")) {
    if (signal.includes("customer path") || signal.includes("what to do") || signal.includes("digital") || signal.includes("same questions")) {
      result = {
        fit: "WORTH_SHOWING",
        productName: "Bot Stores",
        observed: signal,
        reason:
          "The business has a real customer journey problem that may fit a focused bot or digital action layer.",
        whatToSay:
          "You’ve got the business. I think the customer path may be the part worth tightening up.",
        dontPromise:
          "Do not promise sales, staffing savings, or a specific ROI.",
        sanity: "SAY_SOMETHING",
      };
    } else if (signal.includes("needs more customers")) {
      result = {
        fit: "ASK_FIRST",
        observed: signal,
        reason:
          "PGP needs to know whether the business needs acquisition, retention, conversion, or operational help.",
        clarification:
          "Is the bigger problem getting attention, getting people to act, or getting customers to come back?",
        sanity: "ASK_FIRST",
      };
    }
  } else if (environment.includes("rural") || environment.includes("western")) {
    if (signal.includes("sign") || signal.includes("digital") || signal.includes("line") || signal.includes("customer path")) {
      result = {
        fit: "WORTH_SHOWING",
        productName: "Bot Stores",
        observed: signal,
        reason:
          "A rural or Western business may already have local trust and only need a useful digital layer—not a total reinvention.",
        whatToSay:
          "You’ve already got the local trust. I’m thinking about one small digital layer that might make this easier.",
        dontPromise:
          "Do not frame rural businesses as behind or unsophisticated, and do not promise revenue results.",
        sanity: "SAY_SOMETHING",
      };
    } else if (signal.includes("event") || signal.includes("fair") || signal.includes("registration")) {
      result = {
        fit: "WORTH_SHOWING",
        productName: "Action Signs",
        observed: signal,
        reason:
          "A fair, rodeo, or rural event can be a strong scan-to-action environment when attendees need repeated directions or registration steps.",
        whatToSay:
          "You’ve got people moving through the same steps all day. There may be one scan that can make part of this easier.",
        dontPromise:
          "Do not suggest technology where low connectivity or the event audience makes it impractical.",
        sanity: "SAY_SOMETHING",
      };
    }
  }

  return NextResponse.json({
    environment: body.environment,
    signal: body.signal,
    ...result,
    generatedAt: new Date().toISOString(),
    engine: "pgp-opportunity-brain-v1.1",
  });
}
