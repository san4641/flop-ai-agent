import test from "node:test";
import assert from "node:assert/strict";

import { validateModel } from "../validation.mjs";

// Valid sample model for testing
function createValidModel() {
  return {
    id: "qwen/qwen3-14b",
    canonical_slug: "qwen3-14b",
    name: "Qwen3 14B",
    created: 1762900000,
    context_length: 40960,

    architecture: {
      input_modalities: ["text"],
      output_modalities: ["text"],
      tokenizer: "Qwen3"
    },

    pricing: {
      prompt: "0.000015",
      completion: "0.000015"
    },

    top_provider: {
      context_length: 40960,
      max_completion_tokens: 32768,
      is_moderated: false
    },

    supported_parameters: [
      "temperature",
      "top_p"
    ]
  };
}

// 1. Valid model
test("validateModel accepts valid model data", () => {
  const result = validateModel(createValidModel());

  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

// 2. Reject null
test("validateModel rejects null input", () => {
  const result = validateModel(null);

  assert.equal(result.valid, false);
  assert.ok(result.errors.includes("Model must be an object."));
});

// 3. Reject arrays
test("validateModel rejects array input", () => {
  const result = validateModel([]);

  assert.equal(result.valid, false);
});

// 4. Check required string fields
test("validateModel checks required string fields", () => {
  const model = createValidModel();

  model.id = "";
  model.name = 123;
  model.canonical_slug = "";

  const result = validateModel(model);

  assert.equal(result.valid, false);
  assert.ok(result.errors.some(error => error.startsWith("id ")));
  assert.ok(result.errors.some(error => error.startsWith("name ")));
  assert.ok(result.errors.some(error => error.startsWith("canonical_slug ")));
});

// 5. Check created timestamp
test("validateModel rejects invalid created timestamp", () => {
  const model = createValidModel();
  model.created = "invalid";

  const result = validateModel(model);

  assert.equal(result.valid, false);
  assert.ok(result.errors.includes("created must be an integer."));
});

// 6. Check context length
test("validateModel rejects invalid context length", () => {
  const model = createValidModel();
  model.context_length = 0;

  const result = validateModel(model);

  assert.equal(result.valid, false);
  assert.ok(result.errors.includes(
    "context_length must be a positive integer."
  ));
});

// 7. Check architecture object
test("validateModel requires architecture object", () => {
  const model = createValidModel();
  model.architecture = null;

  const result = validateModel(model);

  assert.equal(result.valid, false);
  assert.ok(result.errors.includes(
    "architecture must be an object."
  ));
});

// 8. Check modality arrays
test("validateModel checks modality arrays", () => {
  const model = createValidModel();

  model.architecture.input_modalities = "text";
  model.architecture.output_modalities = [123];

  const result = validateModel(model);

  assert.equal(result.valid, false);
  assert.ok(result.errors.some(
    error => error.includes("input_modalities")
  ));
  assert.ok(result.errors.some(
    error => error.includes("output_modalities")
  ));
});

// 9. Check pricing fields
test("validateModel checks pricing fields", () => {
  const model = createValidModel();
  model.pricing.prompt = 100;

  const result = validateModel(model);

  assert.equal(result.valid, false);
  assert.ok(result.errors.includes(
    "pricing.prompt must be a string."
  ));
});

// 10. Check provider fields
test("validateModel checks provider fields", () => {
  const model = createValidModel();

  model.top_provider.max_completion_tokens = -1;
  model.top_provider.is_moderated = "false";

  const result = validateModel(model);

  assert.equal(result.valid, false);
  assert.ok(result.errors.some(
    error => error.includes("max_completion_tokens")
  ));
  assert.ok(result.errors.some(
    error => error.includes("is_moderated")
  ));
});

// 11. Check supported parameters
test("validateModel checks supported parameters", () => {
  const model = createValidModel();
  model.supported_parameters = ["temperature", 123];

  const result = validateModel(model);

  assert.equal(result.valid, false);
  assert.ok(result.errors.includes(
    "supported_parameters must be an array of strings."
  ));
});