export function getCookieValue(cookieHeader: string | undefined, name: string): string | null {
  if (cookieHeader === undefined || cookieHeader.trim().length === 0) {
    return null;
  }

  for (const part of cookieHeader.split(";")) {
    const trimmedPart = part.trim();
    const separatorIndex = trimmedPart.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmedPart.slice(0, separatorIndex).trim();

    if (key !== name) {
      continue;
    }

    const value = trimmedPart.slice(separatorIndex + 1);

    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }

  return null;
}
