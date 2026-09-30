export const REALTIME_TOOLS = [
  {
    type: "function",
    name: "update_executive_opportunity",
    description: "Save approved non-sensitive facts learned during the executive diagnosis. Call after the visitor provides material business context.",
    parameters: {
      type: "object",
      properties: {
        organization: { type: "string" },
        role: { type: "string" },
        business_gap: { type: "string" },
        recommended_agent: { type: "string" },
        primary_users: { type: "array", items: { type: "string" } },
        commercial_value: { type: "array", items: { type: "string" } },
        pilot_scope: { type: "string" },
        success_measures: { type: "array", items: { type: "string" } },
        timeline: { type: "string" },
        decision_authority: { type: "string", enum: ["unknown", "influencer", "decision-maker", "procurement", "executive-sponsor"] },
        investment_class: { type: "string", enum: ["exploratory", "focused", "institutional", "enterprise"] }
      },
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "prepare_executive_brief",
    description: "Generate the current non-binding executive opportunity brief after enough context exists. This does not contact a human.",
    parameters: { type: "object", properties: {}, additionalProperties: false }
  },
  {
    type: "function",
    name: "request_human_review",
    description: "Request authorized BOT FACTORY human review only after the visitor explicitly permits contact and summary sharing.",
    parameters: {
      type: "object",
      properties: {
        contact_permission: { type: "boolean" },
        share_summary: { type: "boolean" },
        name: { type: "string" },
        role: { type: "string" },
        organization: { type: "string" },
        business_email: { type: "string" },
        preferred_contact: { type: "string", enum: ["email", "phone", "video meeting", "unspecified"] }
      },
      required: ["contact_permission", "share_summary", "name", "role", "organization"],
      additionalProperties: false
    }
  }
];
