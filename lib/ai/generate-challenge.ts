import Anthropic from '@anthropic-ai/sdk';

export type ChallengeFormat =
  | 'open_judgment'
  | 'trade_off'
  | 'what_went_wrong'
  | 'crowd_sourced';

export interface GeneratedChallenge {
  title: string;
  scenario: string;
  question: string;
  quick_takes: string[]; // 3-6 short stance labels, no correct/incorrect option among them
  linkedin_post_draft: string;
}

const FORMAT_GUIDANCE: Record<ChallengeFormat, string> = {
  open_judgment:
    'Ask what the reader would check, prioritize, or do first. No trade-off, just professional instinct. Example shape: "what\'s the first thing you\'d check before anyone touches a crane?"',
  trade_off:
    'Present a dilemma with two competing, legitimate pressures (e.g. programme pressure vs. margin for error). Ask where the reader draws the line. This format should produce quick-take options that plausibly cluster into two or three real camps.',
  what_went_wrong:
    'Describe a situation mid-unfolding where something has just changed (site conditions, a discovery, a delay). Ask what the reader would do next, and optionally what they think most crews would actually do vs. should do.',
  crowd_sourced:
    'Ask the reader to share a real (anonymized) field story — a near-miss, a mistake they saw, a lesson learned. Keep the scenario short since the community supplies the real content.',
};

const SYSTEM_PROMPT = `You write weekly discussion prompts for a LinkedIn group of crane operators, riggers, and lift planners called "Cranes, Cranes, Cranes."

CRITICAL RULES — read carefully:
- You are NEVER declaring a correct answer. There is no Master Key, no scoring, no right/wrong. This is a discussion prompt, not a quiz.
- Do not write quick-take options where one is obviously "the right one" and the rest are distractors. All options should be genuinely plausible professional positions.
- Keep the scenario realistic and specific (real-sounding tonnages, radii, site conditions) but do not assert that any single response to it is objectively correct — you are not a substitute for a qualified lift planner and must not imply otherwise.
- Tone: direct, professional, respectful of the audience's expertise. Not gamified or cutesy language ("Certified," "Master," "Win" are all off-limits in copy).
- The post must tell readers that later this week you'll highlight a few responses that stood out or sparked real debate — frame this explicitly as an editor curating good discussion, never as an authority declaring winners, correct answers, or a "best answer."
- Output ONLY valid JSON matching the schema below. No markdown fences, no preamble, no commentary.

Schema:
{
  "title": string,
  "scenario": string (2-4 sentences, concrete details),
  "question": string (the open judgement question),
  "quick_takes": string[] (3-6 short stance labels, each under 8 words, no option implied as correct),
  "linkedin_post_draft": string (ready-to-post copy including the scenario, question, a line inviting comments, a line previewing the Friday highlights per the rule above, a placeholder "[group link]", and 3-5 relevant hashtags — do NOT include an actual URL to the challenge page; that gets posted separately as a comment)
}`;

export async function generateChallenge(params: {
  format: ChallengeFormat;
  category?: string;
  tone?: string;
}): Promise<GeneratedChallenge> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('Missing ANTHROPIC_API_KEY env var.');

  const client = new Anthropic({ apiKey });

  const userPrompt = `Format: ${params.format}
Format guidance: ${FORMAT_GUIDANCE[params.format]}
Category focus: ${params.category ?? 'any (crane selection, rigging, ground conditions, wind, safety, programme pressure)'}
Tone: ${params.tone ?? 'professional, direct, genuinely curious'}

Generate one challenge now, as JSON only.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text content returned from generation.');
  }

  const cleaned = textBlock.text.replace(/```json|```/g, '').trim();

  let parsed: GeneratedChallenge;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`Failed to parse generated challenge JSON: ${err}`);
  }

  return parsed;
}
