export const isSafeWebUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
};

export const openExternalUrl = (value) => {
  if (!isSafeWebUrl(value)) return false;
  window.open(value, '_blank', 'noopener,noreferrer');
  return true;
};
