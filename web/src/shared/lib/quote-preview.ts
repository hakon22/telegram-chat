const QUOTE_PREVIEW_LIMIT = 240;

export const trimQuotePreview = (text: string): string => {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= QUOTE_PREVIEW_LIMIT) {
    return normalized;
  }

  return `${normalized.slice(0, QUOTE_PREVIEW_LIMIT - 1)}…`;
};
