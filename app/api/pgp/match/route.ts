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

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const environment = normalize(body.environment);
  const signal = normalize(body.signal);

  let result: RuleResult = {
    fit: "NOT_THIS_ONE",
    observed: signal || "Not enough information yet.",
    reason: "PGP does not have a clear approved match from what was observed.",
    sanity: "LEAVE_IT",
  };

  if (environment.includes("restaurant")) {
    if (signal.includes("long line") || signal.includes("ordering seems slow")) {
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
    } else if (signal.includes("people look confused") || signal.includes("signage")) {
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
    } else if (signal.includes("needs more customers")) {
      result = {
        fit: "ASK_FIRST",
        observed: signal,
        reason:
          "“Needs more customers” is too broad to diagnose responsibly.",
        clarification:
          "Do they need new customers, repeat customers, better-paying customers, or more event traffic?",
        sanity: "ASK_FIRST",
      };
    }
  }

  if (environment.includes("salon")) {
    if (signal.includes("no return") || signal.includes("loyalty")) {
      result = {
        fit: "WORTH_SHOWING",
        productName: "Beauty Bot",
        observed: signal,
        reason:
          "A salon with existing traffic but weak return-customer follow-up may benefit from a customer-retention tool.",
        whatToSay:
          "You already have customers coming through. I’d be thinking about making it easier to keep them connected and coming back.",
        dontPromise:
          "Do not promise repeat visits or revenue growth.",
        sanity: "SAY_SOMETHING",
      };
    } else {
      result = {
        fit: "NOT_THIS_ONE",
        observed: signal,
        reason:
          "A busy or attractive salon is not automatically a sales opportunity. PGP needs an actual business problem.",
        sanity: "LEAVE_IT",
      };
    }
  }

  if (environment.includes("school")) {
    if (signal.includes("creative") || signal.includes("creator") || signal.includes("students")) {
      result = {
        fit: "WORTH_SHOWING",
        productName: "Creator College",
        observed: signal,
        reason:
          "The school appears interested in students making, building, or creating rather than only consuming.",
        whatToSay:
          "You were talking about getting students to make things. I know an experience built around exactly that.",
        dontPromise:
          "Do not promise academic outcomes, funding, or student income.",
        sanity: "SAY_SOMETHING",
      };
    } else {
      result = {
        fit: "ASK_FIRST",
        observed: signal,
        reason:
          "PGP needs to know what the school is actually trying to improve.",
        clarification:
          "Are they looking for student creativity, school spirit/team activity, event flow, or something else?",
        sanity: "ASK_FIRST",
      };
    }
  }

  if (environment.includes("church")) {
    if (signal.includes("registration") || signal.includes("sign") || signal.includes("line")) {
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
    } else if (signal.includes("vbs") || signal.includes("sunday school")) {
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
  }

  if (environment.includes("author") || environment.includes("creator")) {
    if (signal.includes("book") || signal.includes("sales") || signal.includes("promotion")) {
      result = {
        fit: "ASK_FIRST",
        productName: "Book Bomb Bot",
        observed: signal,
        reason:
          "Book Bomb can fit an already-published book that the author actively wants to promote.",
        clarification:
          "Is the book already published and available for people to buy?",
        dontPromise:
          "Do not promise bestseller status, rankings, or a guaranteed number of sales.",
        sanity: "ASK_FIRST",
      };
    }
  }

  if (environment.includes("rural") || environment.includes("western")) {
    if (signal.includes("sign") || signal.includes("digital") || signal.includes("line")) {
      result = {
        fit: "WORTH_SHOWING",
        productName: "Action Signs / Bot Stores",
        observed: signal,
        reason:
          "A rural or Western business may already have local trust and only need a useful digital layer—not a total reinvention.",
        whatToSay:
          "You’ve already got the local trust. I’m thinking about one small digital layer that might make this easier.",
        dontPromise:
          "Do not frame rural businesses as behind or unsophisticated, and do not promise revenue results.",
        sanity: "SAY_SOMETHING",
      };
    }
  }

  return NextResponse.json({
    environment: body.environment,
    signal: body.signal,
    ...result,
    generatedAt: new Date().toISOString(),
    engine: "pgp-opportunity-brain-v1",
  });
}
