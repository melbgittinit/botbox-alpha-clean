import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const allowedTypes = new Set(["School", "Church", "Business", "Community / Nonprofit", "Workforce Program", "Other"]);

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Honeypot: real visitors never fill this field.
    if (clean(body.website, 200)) {
      return NextResponse.json({ ok: true });
    }

    const name = clean(body.name, 120);
    const email = clean(body.email, 180).toLowerCase();
    const organization = clean(body.organization, 180);
    const role = clean(body.role, 120);
    const organizationType = clean(body.organizationType, 80);
    const participantCount = clean(body.participantCount, 80);
    const goals = clean(body.goals, 1500);

    if (!name || !email || !organization || !organizationType || !goals) {
      return NextResponse.json({ ok: false, error: "Please complete the required fields." }, { status: 400 });
    }
    if (!emailPattern.test(email)) {
      return NextResponse.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });
    }
    if (!allowedTypes.has(organizationType)) {
      return NextResponse.json({ ok: false, error: "Please choose a valid organization type." }, { status: 400 });
    }

    const recent = await prisma.institutionalInquiry.findFirst({
      where: {
        email,
        createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) },
      },
      select: { id: true },
    });

    if (recent) {
      return NextResponse.json({ ok: true, id: recent.id, duplicate: true });
    }

    const inquiry = await prisma.institutionalInquiry.create({
      data: {
        name,
        email,
        organization,
        role: role || null,
        organizationType,
        participantCount: participantCount || null,
        goals,
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, id: inquiry.id });
  } catch (error) {
    console.error("Creator College institutional inquiry failed", error);
    return NextResponse.json({ ok: false, error: "We could not save your request. Please try again." }, { status: 500 });
  }
}
