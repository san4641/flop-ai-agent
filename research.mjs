
const MCP_URL = "https://mcp.flop.network/mcp";
const API_URL = "https://api.flop.network";

let requestId = 1;

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
    })
  });

  const body = await response.text();

  if (!response.ok) {
    throw new Error(`MCP HTTP ${response.status}: ${body}`);
  }

  const dataLine = body
    .split("\n")
    .find(line => line.startsWith("data: "));

  if (!dataLine) {
    throw new Error("MCP response could not be parsed.");
  }

  const data = JSON.parse(dataLine.slice(6));

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
    throw new Error(JSON.stringify(result.content));
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
      name: "flop-research-agent",
      version: "1.0.0"
    }
  });

  await fetch(MCP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json, text/event-stream"
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "notifications/initialized",
      params: {}
    })
  });
}

async function showNetworkStats() {
  console.log("\nChecking FLOP network statistics...\n");
  printResult(await callTool("flop_get_stats"));
}

async function discoverModels() {
  console.log("\nDiscovering available FLOP models...\n");
  printResult(await callTool("flop_discover_models", {
    max_results: 20
  }));
}

async function comparePricing() {
  console.log("\nComparing model pricing...\n");
  printResult(await callTool("flop_compare_pricing", {
    tokens_estimate: 1000
  }));
}

async function searchKnowledge() {
  const query = await ask("\nEnter research topic: ");

  if (!query.trim()) {
    console.log("Search topic cannot be empty.");
    return;
  }

  console.log("\nSearching FLOP knowledge catalog...\n");
  printResult(await callTool("flop_knowledge_search", {
    query: query.trim(),
    limit: 10
  }));
}

async function findBestMiner() {
  const modelHash = await ask("\nEnter model hash: ");

  if (!modelHash.trim()) {
    console.log("Model hash cannot be empty.");
    return;
  }

  console.log("\nFinding best miner (balanced strategy)...\n");
  printResult(await callTool("flop_find_best_miner", {
    model_hash: modelHash.trim(),
    strategy: "balanced"
  }));
}

async function ask(question) {
  const readline = await import("node:readline/promises");
  const terminal = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const answer = await terminal.question(question);
  terminal.close();
  return answer;
}

async function main() {
  console.log("======================================");
  console.log("   FLOP RESEARCH & INTELLIGENCE AGENT");
  console.log("======================================");
  console.log("Mode: Read-only");
  console.log("No wallet, signing or paid inference.\n");

  try {
    await initialize();
    console.log("MCP connection successful.");
  } catch (error) {
    console.log("MCP connection failed:", error.message);
    return;
  }

  while (true) {
    console.log("\n========== RESEARCH MENU ==========");
    console.log("1. Network Statistics");
    console.log("2. Discover Models");
    console.log("3. Compare Model Pricing");
    console.log("4. Search FLOP Knowledge");
    console.log("5. Find Best Miner");
    console.log("6. Exit");

    const choice = await ask("\nChoose an option (1-6): ");

    try {
      switch (choice.trim()) {
        case "1":
          await showNetworkStats();
          break;
        case "2":
          await discoverModels();
          break;
        case "3":
          await comparePricing();
          break;
        case "4":
          await searchKnowledge();
          break;
        case "5":
          await findBestMiner();
          break;
        case "6":
          console.log("\nResearch Agent closed.");
          process.exit(0);
        default:
          console.log("Invalid option. Choose 1 to 6.");
      }
    } catch (error) {
      console.log("\nOperation failed:", error.message);
    }
  }
}

main();
