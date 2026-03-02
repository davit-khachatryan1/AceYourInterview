export type AdminAiProvider = 'openai' | 'claude' | 'gemini';

export const defaultAdminAiProvider: AdminAiProvider = 'openai';

export const adminAiProviderOptions: Array<{
  label: string;
  value: AdminAiProvider;
}> = [
  { label: 'OpenAI', value: 'openai' },
  { label: 'Claude', value: 'claude' },
  { label: 'Gemini', value: 'gemini' },
];

export const isAdminAiProvider = (value: string): value is AdminAiProvider =>
  adminAiProviderOptions.some((option) => option.value === value);
