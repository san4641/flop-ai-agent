# FLOP Network Intelligence Toolkit

A community-built, read-only toolkit for exploring the FLOP Network through its hosted Model Context Protocol (MCP) service.

The project provides a web-based network intelligence dashboard and command-line research tools to help users explore network statistics, discover AI models, compare estimated pricing, and access FLOP knowledge resources.

## Features

### Web Dashboard V4

- **Network Health:** Check the hosted FLOP MCP service connection.
- **Network Overview:** View reported block height, transactions, active operators, TPS, accounts, and HTLC statistics.
- **Model Explorer:** Browse registered models and inspect serving status, online miners, capabilities, and available metadata.
- **Model Search:** Search model records by name or hash.
- **Pricing Comparison:** Compare estimated model costs and price per GFLOP.
- **Data Refresh:** Reload information from the FLOP service.

### Command-Line Research Tools

The Research Agent provides additional functionality:

- Search the FLOP knowledge catalog.
- Discover available models.
- Compare estimated model pricing.
- Retrieve network statistics.
- Request best-miner recommendations using the balanced strategy.

## Requirements

- Windows, Linux, or macOS
- Node.js 20 or newer
- npm
- Internet connection

## Installation

Clone the repository:

```bash
git clone https://github.com/san4641/flop-ai-agent.git
cd flop-ai-agent
```

Install dependencies:

```bash
npm install
```

## Usage

### Start the Web Dashboard V4

```bash
node server.mjs
```

Open your browser:

```text
http://localhost:3000
```

Keep the terminal running while using the dashboard.

### Run the Research Agent

```bash
npm run research
```

### Run MCP Checks

```bash
npm run mcp-check
```

### Check Available Models

```bash
npm run check-models
```

## Windows PowerShell

If PowerShell blocks the `npm` command, use `npm.cmd` instead:

```powershell
npm.cmd install
npm.cmd run research
npm.cmd run mcp-check
npm.cmd run check-models
```

To start the web dashboard:

```powershell
npm.cmd start
```

## Safety

- The dashboard uses a read-only integration.
- No wallet connection or transaction signing is required.
- Never share seed phrases, private keys, or wallet passwords.
- The dashboard does not submit paid inference tasks or create HTLC transactions.
- Pricing information is indicative metadata, not a guaranteed payment quote.
- Registered models are not necessarily available for inference.
- Miner recommendations are based on information returned by the FLOP service and are not independently verified benchmarks.

## Project Structure

| File | Purpose |
|---|---|
| `server.mjs` | Web dashboard backend and MCP integration |
| `public/index.html` | Dashboard user interface |
| `agent.mjs` | Original command-line dashboard |
| `research.mjs` | Research Agent |
| `mcp-check.mjs` | MCP connectivity checks |
| `check-models.mjs` | Model discovery checks |
| `package.json` | Project configuration and scripts |

## Contributing

Contributions, bug reports, feature requests, and suggestions are welcome.

If you would like to contribute:

1. Fork this repository.
2. Create a new branch for your changes.
3. Test your changes locally.
4. Submit a pull request with a clear description.

## Disclaimer

This is a community-built project and is not an official FLOP Network product unless explicitly approved by the FLOP team.

FLOP Network services and returned data may change over time. Always verify important information using official FLOP sources.
