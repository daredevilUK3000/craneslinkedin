import Anthropic from '@anthropic-ai/sdk';

export interface RecapHighlight {
  displayName: string | null; // null => anonymous
  company: string | null; // credited alongside the name when given, e.g. "Jane Doe, Acme Cranes Ltd"
  quickTakeLabel: string | null;
  freeText: string | null;
  source: 'app' | 'linkedin_comment';
}

const SYSTEM_PROMPT = `You write the midweek "highlights recap" follow-up post for a LinkedIn discussion challenge run by "Cranes, Cranes, Cranes," a community for crane operators, riggers, and lift planners.

CRITICAL RULES — read carefully:
- You are recapping REAL community responses, not generating new content. Only reference the highlighted responses given to you below — never invent a quote, a name, a company, or a stance that wasn't provided.
- Quote or closely paraphrase 2-3 of the given highlighted responses, crediting the display name if one is given, or referring to them anonymously ("one rigger", "another commenter") if none is given. If a company is given alongside a name, credit it too (e.g. "Jane Doe of Acme Cranes Ltd") — this credit is a benefit to the contributor, not incidental detail, so don't drop it. Never credit a company without also giving whatever name was provided alongside it, and never invent a company for someone who didn't give one.
- No scoring, no "correct answer," no winner — this is recognition and curation, not grading. "Certified," "Winner," "Correct," and similar words are off-limits.
- Tone: direct, warm, professional. Written to be posted as-is.
- Output ONLY valid JSON matching the schema below. No markdown fences, no preamble, no commentary.

Schema:
{
  "recap_post_draft": string (ready-to-post LinkedIn copy: 1-2 sentences reintroducing the original question, then the credited highlights, then a closing line inviting people to catch next week's challenge, plus 3-5 relevant hashtags)
}`;

export async function generateRecap(params: {
  challengeTitle: string;
  question: string;
  highlights: RecapHighlight[];
}): Promise<{ recap_post_draft: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('Missing ANTHROPIC_API_KEY env var.');

  const client = new Anthropic({ apiKey });

  const highlightsText = params.highlights
    .map((h, i) => {
      const who = h.displayName ?? 'Anonymous';
      const companyPart = h.company ? `, ${h.company}` : '';
      const stance = h.quickTakeLabel ? ` (quick take: "${h.quickTakeLabel}")` : '';
      const text = h.freeText ?? '(no written reasoning given, only a quick take)';
      return `${i + 1}. ${who}${companyPart}${stance} — source: ${h.source}\n"${text}"`;
    })
    .join('\n\n');

  const userPrompt = `Original challenge: "${params.challengeTitle}"
Original question: "${params.question}"

Highlighted responses to recap (use only these — do not invent others):
${highlightsText}

Draft the highlights recap post now, as JSON only.`;

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

  let parsed: { recap_post_draft: string };
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`Failed to parse generated recap JSON: ${err}`);
  }

  return parsed;
}
