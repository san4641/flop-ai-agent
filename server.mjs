
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, "public");
const PORT = 3000;
const MCP_URL = "https://mcp.flop.network/mcp";

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
    }),
    signal: AbortSignal.timeout(15000)
  });

  const body = await response.text();

  if (!response.ok) {
    throw new Error(`MCP HTTP ${response.status}`);
  }

  if (!body.trim()) return null;

   let data;

  const dataLines = body
    .split(/\r?\n/)
    .filter(line => line.startsWith("data:"))
    .map(line => line.slice(5).trim());

  if (dataLines.length > 0) {
    const dataText = dataLines.join("\n");
    data = JSON.parse(dataText);
  } else {
    data = JSON.parse(body);
  }

  if (data.error) {
    throw new Error(data.error.message || "MCP error");
  }

  return data.result;
}

async function initializeMCP() {
  await mcpRequest("initialize", {
    protocolVersion: "2025-03-26",
    capabilities: {},
    clientInfo: {
      name: "flop-web-dashboard",
      version: "3.0.0"
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
    signal: AbortSignal.timeout(15000)
  });

  if (!response.ok) {
    throw new Error(`MCP initialization failed: HTTP ${response.status}`);
  }
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

    throw new Error(message || "Tool operation failed");
  }

  return result;
}

function sendJSON(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });

  res.end(JSON.stringify(data));
}

const toolRoutes = {
  "/api/health": "flop_health",
  "/api/stats": "flop_get_stats"
};

const server = http.createServer(async (req, res) => {
  const pathname = new URL(req.url, `http://${req.headers.host}`).pathname;

  if (req.method === "GET" && toolRoutes[pathname]) {
    try {
      const result = await callTool(toolRoutes[pathname]);
      return sendJSON(res, 200, result);
    } catch (error) {
      return sendJSON(res, 502, { error: error.message });
    }
  }

  if (req.method === "GET" && pathname === "/api/models") {
    try {
      const result = await callTool("flop_discover_models", {
        max_results: 20
      });

      return sendJSON(res, 200, result);
    } catch (error) {
      return sendJSON(res, 502, { error: error.message });
    }
  }

  if (req.method === "GET" && pathname === "/api/pricing") {
    try {
      const result = await callTool("flop_compare_pricing", {
        tokens_estimate: 1000
      });

      return sendJSON(res, 200, result);
    } catch (error) {
      return sendJSON(res, 502, { error: error.message });
    }
  }

  if (req.method === "GET" && pathname === "/api/status") {
    return sendJSON(res, 200, {
      name: "FLOP Network Intelligence Dashboard",
      version: "3.0.0",
      mode: "read-only"
    });
  }

  if (req.method === "GET") {
    const requestedFile = pathname === "/" ? "index.html" : pathname.slice(1);
    const filePath = path.resolve(PUBLIC_DIR, requestedFile);

    if (!filePath.startsWith(PUBLIC_DIR + path.sep)) {
      return sendJSON(res, 403, { error: "Forbidden" });
    }

    fs.readFile(filePath, (error, content) => {
      if (error) {
        return sendJSON(res, 404, {
          error: "File not found. Dashboard UI is not created yet."
        });
      }

      const extension = path.extname(filePath);

      const types = {
        ".html": "text/html; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".js": "text/javascript; charset=utf-8",
        ".json": "application/json; charset=utf-8"
      };

      res.writeHead(200, {
        "Content-Type": types[extension] || "application/octet-stream"
      });

      res.end(content);
    });

    return;
  }

  sendJSON(res, 405, { error: "Method not allowed" });
});

async function startServer() {
  console.log("Connecting to FLOP MCP...");

  await initializeMCP();

  server.listen(PORT, () => {
    console.log("\nFLOP Web Dashboard V3 is running!");
    console.log(`Open: http://localhost:${PORT}`);
    console.log("Mode: Read-only");
    console.log("Wallet: Not connected");
  });
}

startServer().catch(error => {
  console.error("Server startup failed:", error.message);
  process.exitCode = 1;
});
