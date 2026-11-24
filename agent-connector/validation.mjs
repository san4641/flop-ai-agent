// FLOP Agent Connector - Model Validation

function isObject(value) {
  return value !== null &&
    typeof value === "object" &&
    !Array.isArray(value);
}

function isStringArray(value) {
  return Array.isArray(value) &&
    value.every(item => typeof item === "string");
}

export function validateModel(model) {
  const errors = [];

  if (!isObject(model)) {
    return {
      valid: false,
      errors: ["Model must be an object."]
    };
  }

  // Required text fields
  const stringFields = [
    "id",
    "canonical_slug",
    "name"
  ];

  for (const field of stringFields) {
    if (
      typeof model[field] !== "string" ||
      model[field].trim() === ""
    ) {
      errors.push(`${field} must be a non-empty string.`);
    }
  }

  // Required numeric fields
  if (!Number.isInteger(model.created)) {
    errors.push("created must be an integer.");
  }

  if (
    !Number.isInteger(model.context_length) ||
    model.context_length <= 0
  ) {
    errors.push("context_length must be a positive integer.");
  }

  // Architecture validation
  if (!isObject(model.architecture)) {
    errors.push("architecture must be an object.");
  } else {
    if (!isStringArray(model.architecture.input_modalities)) {
      errors.push("input_modalities must be an array of strings.");
    }

    if (!isStringArray(model.architecture.output_modalities)) {
      errors.push("output_modalities must be an array of strings.");
    }

    if (
      model.architecture.tokenizer !== undefined &&
      typeof model.architecture.tokenizer !== "string"
    ) {
      errors.push("tokenizer must be a string.");
    }
  }

  // Pricing validation
  if (!isObject(model.pricing)) {
    errors.push("pricing must be an object.");
  } else {
    for (const field of ["prompt", "completion"]) {
      if (typeof model.pricing[field] !== "string") {
        errors.push(`pricing.${field} must be a string.`);
      }
    }
  }

  // Provider validation
  if (!isObject(model.top_provider)) {
    errors.push("top_provider must be an object.");
  } else {
    for (const field of ["context_length", "max_completion_tokens"]) {
      if (
        !Number.isInteger(model.top_provider[field]) ||
        model.top_provider[field] < 0
      ) {
        errors.push(`top_provider.${field} must be a non-negative integer.`);
      }
    }

    if (typeof model.top_provider.is_moderated !== "boolean") {
      errors.push("top_provider.is_moderated must be a boolean.");
    }
  }

  // Supported parameters validation
  if (!isStringArray(model.supported_parameters)) {
    errors.push("supported_parameters must be an array of strings.");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}