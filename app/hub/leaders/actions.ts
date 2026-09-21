"use server";

import { redirect } from "next/navigation";
import prisma from "../../../lib/prisma";

function required(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string" || !value.trim()) throw new Error(`${key} is required.`);
  return value.trim();
}
function optional(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

const allowedLanes = new Set(["pastors-on-point","family-hub-love","mom-connected"]);

export async function captureLeaderLead(formData: FormData) {
  const lane = required(formData, "lane");
  if (!allowedLanes.has(lane)) throw new Error("Invalid lane.");
  const name = required(formData, "name");
  const email = required(formData, "email").toLowerCase();
  const organization = optional(formData, "organization");
  const role = optional(formData, "role");
  const cohort = optional(formData, "cohort");
  const hardwareInterest = optional(formData, "hardwareInterest");
  const consent = formData.get("consent") === "yes";
  if (!consent) throw new Error("Please confirm that you want HUB to contact you about this request.");

  await prisma.hubLeaderLead.upsert({
    where: { email_lane: { email, lane } },
    update: { name, organization, role, cohort, hardwareInterest, status: "ACTIVE_INTEREST", payload: { consent: true } },
    create: { lane, name, email, organization, role, cohort, hardwareInterest, status: "ACTIVE_INTEREST", payload: { consent: true } },
  });

  redirect(`/hub/leaders/${lane}?thanks=1`);
}
