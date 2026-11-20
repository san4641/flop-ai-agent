
import { FlopClient } from "@flop-labs/client";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const API = "https://api.flop.network/v1";

const client = new FlopClient({
  baseURL: API
});

const rl = readline.createInterface({ input, output });

let models = [];
let online = false;
let lastCheck = "Not checked yet";

async function checkNetwork() {
  console.log("\nChecking FLOP Network...");

  try {
    const response = await fetch(`${API}/models`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();

    models = result.data ?? [];
    online = true;
    lastCheck = new Date().toLocaleString();

    console.log("Connection successful!");
    console.log("Models found:", models.length);

  } catch (error) {
    online = false;
    console.log("Connection failed:", error.message);
  }
}

function showDashboard() {
  console.clear();

  console.log("======================================");
  console.log("       FLOP NETWORK DASHBOARD");
  console.log("======================================");

  console.log("NETWORK STATUS :", online ? "ONLINE" : "OFFLINE");
  console.log("TOTAL MODELS   :", models.length);
  console.log("LAST CHECK     :", lastCheck);

  console.log("\n1. Check Network");
  console.log("2. Show Available Models");
  console.log("3. Show Model Details");
  console.log("4. Show Pricing and Capacity");
  console.log("5. Exit");

  console.log("======================================");
}

function showModels() {
  console.log("\n========== AVAILABLE MODELS ==========");

  if (!models.length) {
    console.log("No model data available.");
    return;
  }

  models.forEach((model, index) => {
    console.log(`\n${index + 1}. ${model.name}`);
    console.log("ID:", model.id);
  });
}

function showDetails() {
  console.log("\n========== MODEL DETAILS ==========");

  models.forEach((model, index) => {
    console.log(`\n${index + 1}. ${model.name}`);
    console.log("Model ID:", model.id);
    console.log("Owner:", model.owned_by ?? "Unknown");
    console.log("Context Length:", model.context_length ?? "Unknown");
  });
}

function showPricing() {
  console.log("\n========== PRICING & CAPACITY ==========");

  if (!models.length) {
    console.log("No model data available.");
    return;
  }

  models.forEach((model, index) => {
    const pricing = model.pricing ?? {};
   const capacity =
  model.measurements?.capacity_tpm?.value ??
  model["x-flop"]?.capacity_tpm ??
  "Not available";

    console.log(`\n${index + 1}. ${model.name}`);
    console.log("Prompt pricing:", pricing.prompt ?? "Not available");
    console.log("Completion pricing:", pricing.completion ?? "Not available");
    console.log(
      "Capacity (tokens/min):",
      capacity ?? "Not available"
    );

    console.log("--------------------------------------");
  });

  console.log("\nNote: Pricing is devnet metadata, not a verified payment quote.");
}

async function startAgent() {
  await checkNetwork();

  while (true) {
    showDashboard();

    const choice = await rl.question("\nChoose an option (1-5): ");

    if (choice === "1") {
      await checkNetwork();
      await rl.question("\nPress Enter to continue...");

    } else if (choice === "2") {
      showModels();
      await rl.question("\nPress Enter to continue...");

    } else if (choice === "3") {
      showDetails();
      await rl.question("\nPress Enter to continue...");

    } else if (choice === "4") {
      showPricing();
      await rl.question("\nPress Enter to continue...");

    } else if (choice === "5") {
      console.log("\nFLOP Dashboard closed. Goodbye!");
      break;

    } else {
      console.log("\nInvalid option!");
      await rl.question("Press Enter to continue...");
    }
  }

  rl.close();
}

startAgent();
