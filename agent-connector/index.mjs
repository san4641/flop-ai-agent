
import { FlopClient } from "@flop-labs/client";
import { writeFile } from "node:fs/promises";

import {
  valueOrNA,
  shorten,
  timestampToDate
} from "./formatters.mjs";

import { validateModel } from "./validation.mjs";

const OUTPUT_FILE = new URL("./model-details.json", import.meta.url);

const PROJECT_NAME = "FLOP Agent Connector";
const PROJECT_VERSION = "2.0";
const DATA_SOURCE = "FLOP Gateway SDK";

// Safely extract readable error messages.
function getErrorMessage(error) {
  if (error instanceof Error) {
    return error.message || error.name || "Unknown error";
  }

  if (typeof error === "string" && error.trim()) {
    return error.trim();
  }

  if (
    error &&
    typeof error === "object" &&
    typeof error.message === "string" &&
    error.message.trim()
  ) {
    return error.message.trim();
  }

  return "An unknown error occurred.";
}

// Create a consistent report structure.
function createReport({
  status,
  results = [],
  totalModelsListed = 0,
  gatewayTotalCount = totalModelsListed,
  discoveryError
}) {
  const successfulDetails = results.filter(
    item => item.status === "success"
  ).length;

  const failedDetails = results.filter(
    item => item.status === "error"
  ).length;

  const report = {
    project: PROJECT_NAME,
    version: PROJECT_VERSION,
    source: DATA_SOURCE,
    status,
    fetchedAt: new Date().toISOString(),
    totalModelsListed,
    gatewayTotalCount,
    successfulDetails,
    failedDetails,
    results
  };

  if (discoveryError) {
    report.discoveryError = discoveryError;
  }

  return report;
}

// Save reports without hiding file-system errors.
async function saveReport(report) {
  try {
    await writeFile(
      OUTPUT_FILE,
      JSON.stringify(report, null, 2),
      "utf8"
    );

    console.log("\nFull details saved to:");
    console.log("model-details.json");

    return true;

  } catch (error) {
    console.error("\nCould not save model report:");
    console.error(getErrorMessage(error));

    return false;
  }
}

// Display readable model information.
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

// Main discovery process.
async function main() {
  console.log("\n========================================");
  console.log("       FLOP AGENT CONNECTOR");
  console.log("       MODEL DISCOVERY V2");
  console.log("========================================");

  const results = [];

  let models = [];
  let gatewayTotalCount = 0;
  let client;

  // Step 1: Connect to the Gateway and discover models.
  try {
    console.log("\nConnecting to FLOP Gateway...");

    client = new FlopClient({});

    const response = await client.listModels();

    models = response?.data;

    if (!Array.isArray(models)) {
      throw new Error(
        "Invalid Gateway response: expected a model array."
      );
    }

    gatewayTotalCount =
      Number.isInteger(response?.total_count) &&
      response.total_count >= 0
        ? response.total_count
        : models.length;

    console.log("Gateway connection successful!");
    console.log("Models found:", models.length);
    console.log("Gateway reported total:", gatewayTotalCount);

  } catch (error) {
    const message = getErrorMessage(error);

    console.error("\nFLOP Gateway discovery failed:");
    console.error(message);

    const report = createReport({
      status: "failed",
      discoveryError: message
    });

    const reportSaved = await saveReport(report);

    console.log("\nSTATUS: failed");
    console.log("REPORT SAVED:", reportSaved ? "YES" : "NO");

    console.log("\nNo chat completion request was submitted.");
    console.log("No wallet transaction was submitted.");
    console.log("========================================\n");

    process.exitCode = 1;
    return;
  }

  // Step 2: Handle an empty model list.
  if (models.length === 0) {
    console.error("\nNo models were returned by the FLOP Gateway.");

    const report = createReport({
      status: "no_models",
      totalModelsListed: 0,
      gatewayTotalCount,
      results
    });

    const reportSaved = await saveReport(report);

    console.log("\n========================================");
    console.log("       MODEL DISCOVERY SUMMARY");
    console.log("========================================");

    console.log("TOTAL MODELS:", 0);
    console.log("DETAILS FETCHED:", 0);
    console.log("FAILED:", 0);
    console.log("STATUS: no_models");
    console.log("REPORT SAVED:", reportSaved ? "YES" : "NO");

    console.log("\nNo chat completion request was submitted.");
    console.log("No wallet transaction was submitted.");
    console.log("========================================\n");

    process.exitCode = 1;
    return;
  }

  // Step 3: Fetch and validate each discovered model.
  for (let index = 0; index < models.length; index++) {
    const listedModel = models[index];

    const modelId =
      typeof listedModel?.id === "string"
        ? listedModel.id.trim()
        : "";

    if (!modelId) {
      const message = "Model ID is missing or invalid.";

      results.push({
        status: "error",
        index,
        error: message
      });

      console.error("\nSkipping invalid model entry:", index + 1);
      console.error(message);

      continue;
    }

    console.log("\nFetching:", modelId);

    try {
      const detailResponse = await client.getModel(modelId);

      const model = detailResponse?.data;

      if (
        !model ||
        typeof model !== "object" ||
        Array.isArray(model)
      ) {
        throw new Error(
          "Model details were not returned in a valid object."
        );
      }

      if (model.id !== modelId) {
        throw new Error(
          "Returned model ID does not match the requested model ID."
        );
      }

      // Validate model data before accepting it.
      const validation = validateModel(model);

      if (!validation.valid) {
        throw new Error(
          `Model validation failed: ${validation.errors.join("; ")}`
        );
      }

      console.log(
        "Model validation successful:",
        model.id
      );

      results.push({
        status: "success",
        model
      });

    } catch (error) {
      const message = getErrorMessage(error);

      results.push({
        status: "error",
        id: modelId,
        error: message
      });

      console.error("Could not fetch this model:", modelId);
      console.error("Reason:", message);
    }
  }

  // Step 4: Calculate final discovery statistics.
  const successfulModels = results.filter(
    item => item.status === "success"
  );

  const failedDetails = results.filter(
    item => item.status === "error"
  );

  let reportStatus = "success";

  if (failedDetails.length > 0) {
    reportStatus =
      successfulModels.length > 0
        ? "completed_with_errors"
        : "failed";
  }

  // Step 5: Create the final discovery report.
  const report = createReport({
    status: reportStatus,
    results,
    totalModelsListed: models.length,
    gatewayTotalCount
  });

  // Step 6: Save the report.
  const reportSaved = await saveReport(report);

  // Step 7: Print successful model summaries.
  console.log("\n\n========================================");
  console.log("       MODEL DISCOVERY SUMMARY");
  console.log("========================================");

  successfulModels.forEach((item, index) => {
    printModelSummary(item.model, index);
  });

  // Step 8: Print final statistics.
  console.log("\n========================================");
  console.log("TOTAL MODELS:", models.length);
  console.log("GATEWAY TOTAL:", gatewayTotalCount);
  console.log("DETAILS FETCHED:", successfulModels.length);
  console.log("FAILED:", failedDetails.length);
  console.log("STATUS:", report.status);
  console.log("REPORT SAVED:", reportSaved ? "YES" : "NO");

  console.log("\nNo chat completion request was submitted.");
  console.log("No wallet transaction was submitted.");

  console.log("========================================\n");

  // Signal failures to command-line automation.
  if (
    report.status !== "success" ||
    failedDetails.length > 0 ||
    !reportSaved
  ) {
    process.exitCode = 1;
  }
}

// Handle unexpected top-level errors.
async function start() {
  try {
    await main();

  } catch (error) {
    console.error("\nUnexpected connector error:");
    console.error(getErrorMessage(error));

    process.exitCode = 1;
  }
}

start();
