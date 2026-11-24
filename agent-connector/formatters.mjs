// FLOP Agent Connector - Formatting Utilities

export function valueOrNA(value) {
  if (value === null || value === undefined || value === "") {
    return "Not reported";
  }

  if (Array.isArray(value)) {
    return value.length ? value.join(", ") : "Not reported";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

export function shorten(value, maxLength = 90) {
  const text = valueOrNA(value);

  if (text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength - 3) + "...";
}

export function timestampToDate(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "Not reported";
  }

  const date = new Date(value * 1000);

  return Number.isNaN(date.getTime())
    ? "Not reported"
    : date.toISOString();
}