export const loadFormDraft = (key) => {
  if (!key || typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveFormDraft = (key, value) => {
  if (!key || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      key,
      JSON.stringify({ ...value, savedAt: new Date().toISOString() }),
    );
  } catch {
    // localStorage may be unavailable or full; draft saving should not block typing.
  }
};

export const clearFormDraft = (key) => {
  if (!key || typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
};

export const normalizeDraftValue = (value) => {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) return value.map(normalizeDraftValue);
  if (typeof value === "object") {
    return Object.keys(value)
      .filter((key) => key !== "savedAt")
      .sort()
      .reduce((acc, key) => {
        acc[key] = normalizeDraftValue(value[key]);
        return acc;
      }, {});
  }
  return value;
};

export const areDraftValuesEqual = (a, b) =>
  JSON.stringify(normalizeDraftValue(a)) === JSON.stringify(normalizeDraftValue(b));

export const hasDraftValue = (value) => {
  const normalized = normalizeDraftValue(value);
  if (normalized === "") return false;
  if (typeof normalized === "boolean") return normalized;
  if (typeof normalized === "number") return normalized !== 0;
  if (Array.isArray(normalized)) return normalized.some(hasDraftValue);
  if (typeof normalized === "object") {
    return Object.values(normalized).some(hasDraftValue);
  }
  return true;
};
