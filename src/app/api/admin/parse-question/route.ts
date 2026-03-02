import { NextResponse, type NextRequest } from 'next/server';
import {
  defaultAdminAiProvider,
  isAdminAiProvider,
  type AdminAiProvider,
} from '@/lib/adminAiProviders';
import { isAllowedAdminEmail, parseAllowlist } from '@/lib/adminAllowlist';
import {
  createAdminQuestionDraft,
  validateAdminQuestionDraft,
  type AdminParseResult,
  type AdminQuestionParseSource,
} from '@/lib/adminQuestionDraft';
import { firebaseConfig } from '@/lib/firebaseConfig';

export const runtime = 'nodejs';

const defaultOpenAiModel = 'gpt-4o-mini';
const defaultClaudeModel = 'claude-3-5-sonnet-latest';
const defaultGeminiModel = 'gemini-1.5-pro';

class RouteError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const toTrimmedString = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : '';

const toWarningList = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((entry): entry is string => typeof entry === 'string')
    .map((entry) => entry.trim())
    .filter(Boolean);
};

const getBearerToken = (authorizationHeader: string | null): string | null => {
  if (!authorizationHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authorizationHeader.slice('Bearer '.length).trim();
  return token.length > 0 ? token : null;
};

const extractJsonContent = (value: string): string => {
  const trimmed = value.trim();

  if (!trimmed.startsWith('```')) {
    return trimmed;
  }

  return trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
};

const extractMessageText = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }

  if (!Array.isArray(value)) {
    return '';
  }

  return value
    .map((entry) => {
      if (typeof entry === 'string') {
        return entry;
      }

      if (typeof entry === 'object' && entry !== null && 'text' in entry) {
        const text = (entry as { text?: unknown }).text;
        return typeof text === 'string' ? text : '';
      }

      return '';
    })
    .join('');
};

const readApiErrorMessage = async (response: Response): Promise<string> => {
  try {
    const payload = (await response.json()) as {
      error?: { message?: string };
      message?: string;
    };
    const message = payload.error?.message ?? payload.message;
    return typeof message === 'string' && message.trim().length > 0
      ? message
      : 'The AI parser request failed.';
  } catch {
    return 'The AI parser request failed.';
  }
};

const getParserPrompts = (rawInput: string, topicOverride: string) => {
  const systemPrompt = `
You classify one mixed admin input into a strict JSON object for an interview question authoring tool.

Rules:
- Separate content into the requested fields.
- Do not rewrite, translate, summarize, or invent missing content.
- Preserve original wording whenever possible.
- Prefer explicit labels such as "Question (ENG)" or "Pitfalls (ARM)".
- If content is missing, return an empty string or empty array for that field.
- Combine repeated sections in their original order.
- Return JSON only. No markdown. No prose.

Return an object with exactly these keys:
{
  "topicId": string,
  "enText": string,
  "amText": string,
  "enAnswer": string,
  "amAnswer": string,
  "enExplanation": string,
  "amExplanation": string,
  "enPitfalls": string[],
  "amPitfalls": string[],
  "enFollowups": string[],
  "amFollowups": string[],
  "codeSnippet": string,
  "codeLanguage": string,
  "tags": string[],
  "examples": [
    {
      "en_title": string,
      "am_title": string,
      "en_description": string,
      "am_description": string,
      "codeSnippet": string,
      "codeLanguage": string
    }
  ],
  "warnings": string[]
}
`.trim();

  const userPrompt = `
Topic override: ${topicOverride || '(none)'}

Mixed admin input:
${rawInput}
`.trim();

  return {
    systemPrompt,
    userPrompt,
  };
};

const parseStructuredJson = (messageText: string): Record<string, unknown> => {
  if (!messageText.trim()) {
    throw new RouteError(502, 'The AI parser returned an empty response.');
  }

  const jsonText = extractJsonContent(messageText);

  try {
    const parsed = JSON.parse(jsonText) as unknown;

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Invalid payload shape');
    }

    return parsed as Record<string, unknown>;
  } catch {
    throw new RouteError(
      502,
      'The AI parser returned an invalid JSON response. Try parsing again.',
    );
  }
};

const parseOpenAIResponse = async (
  rawInput: string,
  topicOverride: string,
): Promise<Record<string, unknown>> => {
  const openAiApiKey = process.env.OPENAI_API_KEY?.trim();

  if (!openAiApiKey) {
    throw new RouteError(
      503,
      'OpenAI parsing is unavailable. Add OPENAI_API_KEY on the server to enable it.',
    );
  }

  const model = process.env.OPENAI_ADMIN_PARSER_MODEL?.trim() || defaultOpenAiModel;
  const { systemPrompt, userPrompt } = getParserPrompts(rawInput, topicOverride);
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openAiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new RouteError(502, await readApiErrorMessage(response));
  }

  const payload = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: unknown;
      };
    }>;
  };

  const rawMessage = payload.choices?.[0]?.message?.content;
  return parseStructuredJson(extractMessageText(rawMessage));
};

const parseClaudeResponse = async (
  rawInput: string,
  topicOverride: string,
): Promise<Record<string, unknown>> => {
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY?.trim();

  if (!anthropicApiKey) {
    throw new RouteError(
      503,
      'Claude parsing is unavailable. Add ANTHROPIC_API_KEY on the server to enable it.',
    );
  }

  const model = process.env.ANTHROPIC_ADMIN_PARSER_MODEL?.trim() || defaultClaudeModel;
  const { systemPrompt, userPrompt } = getParserPrompts(rawInput, topicOverride);
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': anthropicApiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4000,
      temperature: 0.1,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new RouteError(502, await readApiErrorMessage(response));
  }

  const payload = (await response.json()) as {
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  };

  const messageText =
    payload.content
      ?.filter((entry) => entry.type === 'text' && typeof entry.text === 'string')
      .map((entry) => entry.text)
      .join('') ?? '';

  return parseStructuredJson(messageText);
};

const parseGeminiResponse = async (
  rawInput: string,
  topicOverride: string,
): Promise<Record<string, unknown>> => {
  const geminiApiKey = process.env.GEMINI_API_KEY?.trim();

  if (!geminiApiKey) {
    throw new RouteError(
      503,
      'Gemini parsing is unavailable. Add GEMINI_API_KEY on the server to enable it.',
    );
  }

  const model = process.env.GEMINI_ADMIN_PARSER_MODEL?.trim() || defaultGeminiModel;
  const { systemPrompt, userPrompt } = getParserPrompts(rawInput, topicOverride);
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(geminiApiKey)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        generationConfig: {
          temperature: 0.1,
        },
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: userPrompt }],
          },
        ],
      }),
    },
  );

  if (!response.ok) {
    throw new RouteError(502, await readApiErrorMessage(response));
  }

  const payload = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          text?: string;
        }>;
      };
    }>;
  };

  const messageText =
    payload.candidates?.[0]?.content?.parts
      ?.filter((entry) => typeof entry.text === 'string')
      .map((entry) => entry.text)
      .join('') ?? '';

  return parseStructuredJson(messageText);
};

const parseAiResponse = async (
  provider: AdminAiProvider,
  rawInput: string,
  topicOverride: string,
): Promise<Record<string, unknown>> => {
  switch (provider) {
    case 'claude':
      return parseClaudeResponse(rawInput, topicOverride);
    case 'gemini':
      return parseGeminiResponse(rawInput, topicOverride);
    case 'openai':
    default:
      return parseOpenAIResponse(rawInput, topicOverride);
  }
};

const verifyAdminRequest = async (request: NextRequest): Promise<void> => {
  const idToken = getBearerToken(request.headers.get('authorization'));

  if (!idToken) {
    throw new RouteError(401, 'You need an active admin session to use AI parsing.');
  }

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim() || firebaseConfig.apiKey;
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
    },
  );

  if (!response.ok) {
    throw new RouteError(401, 'Your admin session expired. Sign in again and retry.');
  }

  const payload = (await response.json()) as {
    users?: Array<{
      email?: string;
    }>;
  };

  const email = payload.users?.[0]?.email;
  const allowlist = parseAllowlist(
    process.env.ADMIN_ALLOWLIST ?? process.env.NEXT_PUBLIC_ADMIN_ALLOWLIST ?? '',
  );

  if (!isAllowedAdminEmail(email, allowlist)) {
    throw new RouteError(403, 'This account is not allowed to use AI parsing.');
  }
};

const buildParseResult = (
  parsedPayload: Record<string, unknown>,
  topicOverride: string,
): AdminParseResult => {
  const source: AdminQuestionParseSource = {
    topicId: topicOverride || parsedPayload.topicId,
    enText: parsedPayload.enText,
    amText: parsedPayload.amText,
    enAnswer: parsedPayload.enAnswer,
    amAnswer: parsedPayload.amAnswer,
    enExplanation: parsedPayload.enExplanation,
    amExplanation: parsedPayload.amExplanation,
    enPitfalls: parsedPayload.enPitfalls,
    amPitfalls: parsedPayload.amPitfalls,
    enFollowups: parsedPayload.enFollowups,
    amFollowups: parsedPayload.amFollowups,
    codeSnippet: parsedPayload.codeSnippet,
    codeLanguage: parsedPayload.codeLanguage,
    tags: parsedPayload.tags,
    examples: parsedPayload.examples,
  };

  const draft = createAdminQuestionDraft(source);
  const validation = validateAdminQuestionDraft(draft);
  const warnings = toWarningList(parsedPayload.warnings);

  if (draft.examples.length === 0) {
    warnings.push('No example block was detected. Add at least one example before saving.');
  }

  if (!draft.topicId.trim()) {
    warnings.push('Topic ID is still missing.');
  }

  if (validation.missingFields.length > 0) {
    warnings.push('Review the missing required fields before saving.');
  }

  return {
    draft,
    missingFields: validation.missingFields,
    warnings: [...new Set(warnings)],
  };
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      provider?: unknown;
      rawInput?: unknown;
      topicOverride?: unknown;
    };

    const providerValue = toTrimmedString(body.provider);
    const provider = isAdminAiProvider(providerValue)
      ? providerValue
      : defaultAdminAiProvider;
    const rawInput = toTrimmedString(body.rawInput);
    const topicOverride = toTrimmedString(body.topicOverride);

    if (!rawInput) {
      throw new RouteError(400, 'Paste the full mixed question content before parsing.');
    }

    await verifyAdminRequest(request);

    const parsedPayload = await parseAiResponse(provider, rawInput, topicOverride);
    const result = buildParseResult(parsedPayload, topicOverride);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof RouteError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    const message =
      error instanceof Error ? error.message : 'The AI parser could not process this input.';

    return NextResponse.json({ message }, { status: 500 });
  }
}
