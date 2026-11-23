# FLOP Agent Connector

A community-built JavaScript connector for discovering AI models and retrieving model metadata from the FLOP Gateway.

## Features

- Connects to the FLOP Gateway using the official FLOP JavaScript client.
- Discovers available models using `listModels()`.
- Retrieves model information using `getModel(id)`.
- Displays model details in the terminal.
- Saves complete model information as a JSON report.
- Excludes generated reports from Git.

## Requirements

- Node.js
- npm
- `@flop-labs/client` version 0.2.2

## Installation

Clone the repository:

```bash
git clone https://github.com/san4641/flop-ai-agent.git
```

Enter the project directory:

```bash
cd flop-ai-agent
```

Install dependencies:

```bash
npm install
```

## Run the Connector

Enter the connector folder:

```bash
cd agent-connector
```

Run:

```bash
node index.mjs
```

## Model Information

The connector retrieves:

- Model ID and name
- Description
- Context length
- Input and output modalities
- Tokenizer and instruction type
- Pricing metadata
- Provider information
- Supported parameters
- FLOP model hash
- Backend and quantization
- Capacity and reported measurements

## Output

The connector generates:

`model-details.json`

This file stores the complete model information returned by the gateway.

Generated files are excluded from Git:

- `model-details.json`
- `output.txt`

## Safety and Scope

This version only performs model discovery and metadata retrieval.

It uses:

- `listModels()`
- `getModel(id)`

It does not:

- Submit AI chat completion requests
- Execute paid inference
- Connect or sign with a wallet
- Submit blockchain transactions
- Create or fund HTLCs

Model discovery does not guarantee that a model is currently serving inference.

Pricing fields are API metadata, not guaranteed payment quotes.

## Current Status

- [x] Model discovery
- [x] Model details retrieval
- [x] JSON report generation
- [ ] Chat completion integration
- [ ] Wallet integration

## Repository

https://github.com/san4641/flop-ai-agent

## Disclaimer

This is an independent, community-built project. It is not an official FLOP Network product.