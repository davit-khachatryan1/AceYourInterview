export const parseAllowlist = (raw: string): string[] =>
  raw
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

export const isAllowedAdminEmail = (
  email: string | null | undefined,
  allowlist: string[],
): boolean => {
  const normalizedEmail = email?.trim().toLowerCase();

  if (allowlist.length === 0) {
    return !!normalizedEmail;
  }

  return !!normalizedEmail && allowlist.includes(normalizedEmail);
};
