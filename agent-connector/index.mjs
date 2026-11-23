import { FlopClient } from "@flop-labs/client";
import { writeFile } from "node:fs/promises";

const client = new FlopClient({});

const OUTPUT_FILE = new URL("./model-details.json", import.meta.url);

function valueOrNA(value) {
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

function shorten(value, maxLength = 90) {
  const text = valueOrNA(value);

  if (text.length <= maxLength) return text;

  return text.slice(0, maxLength - 3) + "...";
}

function timestampToDate(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "Not reported";
  }

  const date = new Date(value * 1000);

  return Number.isNaN(date.getTime())
    ? "Not reported"
    : date.toISOString();
}

function printModelSummary(model, index) {
  const architecture = model.architecture ?? {};
  const pricing = model.pricing ?? {};
  const provider = model.top_provider ?? {};
  const flop = model["x-flop"] ?? {};
  const measurements = flop.measurements ?? {};

  console.log("\n----------------------------------------");
  console.log(`MODEL ${index + 1}: ${model.name ?? model.id}`);
  console.log("----------------------------------------");

  console.log("Model ID:", valueOrNA(model.id));
  console.log("Description:", shorten(model.description));
  console.log("Context Length:", valueOrNA(model.context_length));

  console.log(
    "Input Modalities:",
    valueOrNA(architecture.input_modalities)
  );

  console.log(
    "Output Modalities:",
    valueOrNA(architecture.output_modalities)
  );

  console.log(
    "Tokenizer:",
    valueOrNA(architecture.tokenizer)
  );

  console.log(
    "Max Completion Tokens:",
    valueOrNA(provider.max_completion_tokens)
  );

  console.log(
    "Prompt Pricing Metadata:",
    valueOrNA(pricing.prompt)
  );

  console.log(
    "Completion Pricing Metadata:",
    valueOrNA(pricing.completion)
  );

  console.log(
    "Model Hash:",
    valueOrNA(flop.model_hash)
  );

  console.log(
    "Backend:",
    valueOrNA(flop.backend)
  );

  console.log(
    "Quantization:",
    valueOrNA(flop.quantization)
  );

  console.log(
    "Capacity (tokens/min):",
    valueOrNA(measurements.capacity_tpm?.value)
  );

  console.log(
    "Measured Latency:",
    valueOrNA(measurements.latency_ms)
  );

  console.log(
    "Measured Throughput:",
    valueOrNA(measurements.throughput_tokens_per_second)
  );

  console.log("Created:", timestampToDate(model.created));
}

async function main() {
  console.log("\n========================================");
  console.log("       FLOP AGENT CONNECTOR");
  console.log("       MODEL DISCOVERY V2");
  console.log("========================================");

  const results = [];

  try {
    console.log("\nConnecting to FLOP Gateway...");

    const response = await client.listModels();
    const models = response?.data;

    if (!Array.isArray(models)) {
      throw new Error("Unexpected model list response.");
    }

    console.log("Gateway connection successful!");
    console.log("Models found:", models.length);

    for (const listedModel of models) {
      if (!listedModel?.id) {
        results.push({
          status: "error",
          error: "Model ID missing"
        });

        continue;
      }

      console.log("\nFetching:", listedModel.id);

      try {
        const detailResponse = await client.getModel(listedModel.id);
        const model = detailResponse?.data;

        if (!model || typeof model !== "object") {
          throw new Error("Model details were not returned.");
        }

        results.push({
          status: "success",
          model
        });

      } catch (error) {
        results.push({
          status: "error",
          id: listedModel.id,
          error: error.message
        });

        console.log("Could not fetch this model:", error.message);
      }
    }

    const report = {
      project: "FLOP Agent Connector",
      version: "2.0",
      source: "FLOP Gateway SDK",
      fetchedAt: new Date().toISOString(),
      totalModelsListed: models.length,
      successfulDetails: results.filter(
        item => item.status === "success"
      ).length,
      failedDetails: results.filter(
        item => item.status === "error"
      ).length,
      results
    };

    await writeFile(
      OUTPUT_FILE,
      JSON.stringify(report, null, 2),
      "utf8"
    );

    console.log("\n\n========================================");
    console.log("       MODEL DISCOVERY SUMMARY");
    console.log("========================================");

    const successfulModels = results.filter(
      item => item.status === "success"
    );

    successfulModels.forEach((item, index) => {
      printModelSummary(item.model, index);
    });

    console.log("\n========================================");
    console.log("TOTAL MODELS:", models.length);
    console.log("DETAILS FETCHED:", successfulModels.length);
    console.log(
      "FAILED:",
      results.filter(item => item.status === "error").length
    );

    console.log("\nFull details saved to:");
    console.log("model-details.json");

    console.log("\nNo chat completion request was submitted.");
    console.log("No wallet transaction was submitted.");
    console.log("========================================\n");

  } catch (error) {
    console.error("\nFLOP connection failed:");
    console.error(error.message);
    process.exitCode = 1;
  }
}

main();