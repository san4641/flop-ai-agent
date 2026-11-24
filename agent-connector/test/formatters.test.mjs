import test from "node:test";
import assert from "node:assert/strict";

import {
  valueOrNA,
  shorten,
  timestampToDate
} from "../formatters.mjs";

// Tests for valueOrNA()

test("valueOrNA handles null values", () => {
  assert.equal(valueOrNA(null), "Not reported");
});

test("valueOrNA handles undefined values", () => {
  assert.equal(valueOrNA(undefined), "Not reported");
});

test("valueOrNA handles empty strings", () => {
  assert.equal(valueOrNA(""), "Not reported");
});

test("valueOrNA formats arrays", () => {
  assert.equal(valueOrNA(["text", "image"]), "text, image");
});

test("valueOrNA handles empty arrays", () => {
  assert.equal(valueOrNA([]), "Not reported");
});

test("valueOrNA formats numbers and objects", () => {
  assert.equal(valueOrNA(42), "42");
  assert.equal(valueOrNA({ name: "FLOP" }), '{"name":"FLOP"}');
});

// Tests for shorten()

test("shorten keeps text within maximum length", () => {
  assert.equal(shorten("FLOP Network", 20), "FLOP Network");
});

test("shorten truncates long text", () => {
  assert.equal(shorten("ABCDEFGHIJ", 8), "ABCDE...");
});

test("shorten uses default maximum length", () => {
  const result = shorten("A".repeat(100));

  assert.equal(result.length, 90);
  assert.equal(result.endsWith("..."), true);
});

// Tests for timestampToDate()

test("timestampToDate converts Unix timestamps to ISO dates", () => {
  assert.equal(
    timestampToDate(0),
    "1970-01-01T00:00:00.000Z"
  );
});

test("timestampToDate handles invalid values", () => {
  assert.equal(timestampToDate("invalid"), "Not reported");
  assert.equal(timestampToDate(null), "Not reported");
  assert.equal(timestampToDate(NaN), "Not reported");
});