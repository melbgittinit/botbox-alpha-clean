# Make the Point writing connection

Added source-based structured writing adapter and browser output panel. It calls the OpenAI Responses API only when all three Render variables are configured: OPENAI_API_KEY (secret), MEDIA_MAKER_WRITING_MODEL (a supported structured-output model selected after cost check), MEDIA_MAKER_WRITING_ENABLED=true. No default model is silently selected. Do not put keys in source or browser code.

Status endpoint /api/writing-status exposes enabled boolean only. Configure credentials in Render environment settings, not chat. Enable only after model/cost decision and an end-to-end generation test. The process-local 20-request/day pilot limiter is not a persistent billing cap; resets on deploy/restart. Account-level spend limits and persistent user quotas remain necessary before public paid launch.

Inputs: point, audience, pasted source passage and delivery profile. Outputs: rewritten lead, relevance, explanation, three headlines, short script, original companion, improvement notes, claim/excerpt trail and warnings. Strict JSON shape; exact quote matching; incomplete provider responses rejected. Exact matching is not semantic fact verification. No URL retrieval or independent research. Generated outputs remain AI drafts, not automatically approved packages.

Tests: missing configuration prevents provider call; input limits; exact-evidence rejection; structured mocked response; usage and draft labels. No live provider success validated until configured. The prewritten UI example is labelled illustrative, never generated.
