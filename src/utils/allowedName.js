export const ALLOWED_NAME_MESSAGE =
  "Only letters, numbers, spaces, underscore (_) and hyphen (-) are allowed.";

const ALLOWED_NAME_PATTERN = /^[A-Za-z0-9 _-]+$/;

export const getAllowedNameError = (label, value, { required = false } = {}) => {
  const normalized = typeof value === "string" ? value.trim() : value;

  if (!normalized) {
    return required ? `${label} is required` : "";
  }

  return ALLOWED_NAME_PATTERN.test(normalized)
    ? ""
    : `${label}: ${ALLOWED_NAME_MESSAGE}`;
};
