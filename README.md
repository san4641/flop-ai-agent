# FLOP Network Intelligence Toolkit

A community-built, read-only toolkit for exploring the FLOP Network through its hosted Model Context Protocol (MCP) service.

This project helps users inspect network information, discover registered AI models, compare estimated pricing, search FLOP documentation, and explore miner recommendations.

## Features

The V2 Intelligence Dashboard includes:

1. **Network Health** — Check the hosted FLOP MCP service health.
2. **Network Statistics** — Retrieve network statistics from the FLOP service.
3. **Model Discovery** — Discover registered models and inspect their available information.
4. **Pricing Comparison** — Compare estimated model costs for a token estimate.
5. **Knowledge Search** — Search the FLOP knowledge catalog by topic.
6. **Best Miner Finder** — Request miner recommendations using the balanced strategy.

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

### Start the V2 Intelligence Dashboard

```bash
npm start
```

Choose an option from the interactive menu to use the available features.

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
npm.cmd start
```

Other commands:

```powershell
npm.cmd run research
npm.cmd run mcp-check
npm.cmd run check-models
```

## Safety

- The hosted MCP integration used by the V2 dashboard is read-only.
- No wallet connection or transaction signing is required.
- Never share seed phrases, private keys, or wallet passwords.
- The dashboard does not submit paid inference tasks or create HTLC transactions.
- Pricing information is indicative metadata, not a guaranteed payment quote.
- Registered models are not necessarily available for inference.
- Miner recommendations are based on data returned by the FLOP service and are not independently verified benchmarks.

## Project Structure

| File | Purpose |
|---|---|
| `agent.mjs` | V2 Intelligence Dashboard |
| `research.mjs` | Research Agent |
| `mcp-check.mjs` | MCP connectivity checks |
| `check-models.mjs` | Model discovery checks |
| `package.json` | Project configuration and scripts |

## Contributing

Contributions, bug reports, and suggestions are welcome.

Please test your changes before submitting a pull request.

## Disclaimer

This is a community-built project and is not an official FLOP Network product unless explicitly approved by the FLOP team.

FLOP Network services and returned data may change over time. Always verify important information using official FLOP sources.