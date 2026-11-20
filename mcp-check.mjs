
const URL = "https://mcp.flop.network/mcp";

async function request(id, method, params = {}) {
  const response = await fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json, text/event-stream"
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id,
      method,
      params
    })
  });

  const body = await response.text();
  const line = body.split("\n").find(x => x.startsWith("data: "));

  if (!response.ok || !line) {
    throw new Error(`HTTP ${response.status}: ${body}`);
  }

  return JSON.parse(line.slice(6));
}

async function callTool(id, name, args = {}) {
  console.log(`\n========== ${name} ==========`);

  const result = await request(id, "tools/call", {
    name,
    arguments: args
  });

  console.log(JSON.stringify(result.result ?? result, null, 2));
  return result;
}

async function main() {
  console.log("Connecting to FLOP MCP...");

  const init = await request(1, "initialize", {
    protocolVersion: "2025-03-26",
    capabilities: {},
    clientInfo: {
      name: "my-flop-agent",
      version: "1.0.0"
    }
  });

  console.log("MCP initialized:", init.result?.serverInfo?.name);

  await fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json, text/event-stream"
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "notifications/initialized"
    })
  });

  await callTool(2, "flop_health");

  await callTool(3, "flop_discover_models", {
    max_results: 10
  });

  const models = [
    "qwen/qwen2.5-0.5b-instruct",
    "qwen/qwen3-14b",
    "qwen/qwen3-coder-30b-a3b-instruct-fp8"
  ];

  for (let i = 0; i < models.length; i++) {
    await callTool(4 + i, "flop_get_model_pricing", {
      model_id: models[i],
      tokens_estimate: 200
    });
  }
await callTool(7, "flop_agent_pack_manifest");
  console.log("\nRead-only MCP checks completed.");
  console.log("No wallet signing or payment was performed.");
}

main().catch(error => {
  console.error("\nMCP Error:", error.message);
});
