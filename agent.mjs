
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const MCP_URL = "https://mcp.flop.network/mcp";
const REQUEST_TIMEOUT = 15000;

const rl = readline.createInterface({ input, output });

let requestId = 1;
let connected = false;

async function mcpRequest(method, params = {}) {
  const response = await fetch(MCP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json, text/event-stream"
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: requestId++,
      method,
      params
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT)
  });


  const body = await response.text();

  if (!response.ok) {
    throw new Error(`MCP HTTP ${response.status}: ${body}`);
  }

  if (!body.trim()) return null;

  let data;

  // Handle both JSON and Server-Sent Events (SSE)
  const dataLines = body
    .split(/\r?\n/)
    .filter(line => line.startsWith("data:"));

  if (dataLines.length > 0) {
    const dataText = dataLines
      .map(line => line.slice(5).trim())
      .join("\n");

    data = JSON.parse(dataText);
  } else {
    data = JSON.parse(body);
  }

  if (data.error) {
    throw new Error(data.error.message || "MCP error");
  }

  return data.result;

}

async function callTool(name, args = {}) {
  const result = await mcpRequest("tools/call", {
    name,
    arguments: args
  });

  if (result?.isError) {
    const message = result.content
      ?.map(item => item.text || "")
      .join("\n");

    throw new Error(message || "Tool operation failed.");
  }

  return result;
}

function printResult(result) {
  if (result?.content) {
    for (const item of result.content) {
      if (item.text) console.log(item.text);
    }
  } else {
    console.log(JSON.stringify(result, null, 2));
  }
}

async function initialize() {
  await mcpRequest("initialize", {
    protocolVersion: "2025-03-26",
    capabilities: {},
    clientInfo: {
      name: "flop-intelligence-dashboard",
      version: "2.0.0"
    }
  });

  const response = await fetch(MCP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json, text/event-stream"
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "notifications/initialized",
      params: {}
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT)
  });

  if (!response.ok) {
    throw new Error(`Initialization notification failed: HTTP ${response.status}`);
  }

  connected = true;
}

async function runTool(title, name, args = {}) {
  console.log(`\n========== ${title} ==========\n`);
  printResult(await callTool(name, args));
}

async function networkHealth() {
  await runTool("NETWORK HEALTH", "flop_health");
}

async function networkStats() {
  await runTool("NETWORK STATISTICS", "flop_get_stats");
}

async function discoverModels() {
  await runTool("MODEL DISCOVERY", "flop_discover_models", {
    max_results: 20
  });
}

async function comparePricing() {
  await runTool("MODEL PRICING COMPARISON", "flop_compare_pricing", {
    tokens_estimate: 1000
  });
}

async function searchKnowledge() {
  const query = (await rl.question("\nEnter research topic: ")).trim();

  if (!query) {
    console.log("Search topic cannot be empty.");
    return;
  }

  await runTool("FLOP KNOWLEDGE SEARCH", "flop_knowledge_search", {
    query,
    limit: 10
  });
}

async function findBestMiner() {
  const modelHash = (await rl.question("\nEnter model hash: ")).trim();

  if (!modelHash) {
    console.log("Model hash cannot be empty.");
    return;
  }

  await runTool("BEST MINER FINDER", "flop_find_best_miner", {
    model_hash: modelHash,
    strategy: "balanced"
  });
}

function showMenu() {
  console.log("\n==========================================");
  console.log("       FLOP NETWORK INTELLIGENCE");
  console.log("==========================================");
  console.log("Connection :", connected ? "CONNECTED" : "DISCONNECTED");
  console.log("------------------------------------------");
  console.log("1. Network Health");
  console.log("2. Network Statistics");
  console.log("3. Discover Models");
  console.log("4. Compare Model Pricing");
  console.log("5. Search FLOP Knowledge");
  console.log("6. Find Best Miner");
  console.log("7. Exit");
  console.log("==========================================");
}

async function main() {
  console.log("\nStarting FLOP Network Intelligence Dashboard...");
  console.log("Mode: Read-only");
  console.log("Wallet: Not connected");
  console.log("Signing and payments: Disabled");

  try {
    await initialize();
    console.log("\nMCP connection successful!");
  } catch (error) {
    console.log("\nMCP connection failed:", error.message);
    return;
  }

  while (true) {
    showMenu();

    const choice = (await rl.question("\nChoose an option (1-7): ")).trim();

    try {
      switch (choice) {
        case "1":
          await networkHealth();
          break;

        case "2":
          await networkStats();
          break;

        case "3":
          await discoverModels();
          break;

        case "4":
          await comparePricing();
          break;

        case "5":
          await searchKnowledge();
          break;

        case "6":
          await findBestMiner();
          break;

        case "7":
          console.log("\nFLOP Dashboard closed. Goodbye!");
          return;

        default:
          console.log("\nInvalid option. Choose 1 to 7.");
      }
    } catch (error) {
      console.log("\nOperation failed:", error.message);
    }

    await rl.question("\nPress Enter to return to menu...");
  }
}

main()
  .catch(error => {
    console.error("\nUnexpected error:", error.message);
    process.exitCode = 1;
  })
  .finally(() => {
    rl.close();
  });
