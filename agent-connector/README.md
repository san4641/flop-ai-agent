
# FLOP Agent Connector

A community-built JavaScript connector for discovering AI models and retrieving model metadata from the FLOP Gateway.

The connector uses the `@flop-labs/client` SDK to list available models, retrieve their details, validate model data, and generate a local JSON report.

## Features

- Connects to the FLOP Gateway using the FLOP JavaScript client.
- Discovers available models using `listModels()`.
- Retrieves individual model details using `getModel()`.
- Validates model data before accepting it into the discovery report.
- Formats model metadata for readable terminal output.
- Handles missing or invalid values safely.
- Saves the discovery results to a JSON report.
- Includes automated unit tests for formatting and model validation.
- Provides simple npm scripts for syntax checks and unit tests.
- Uses GitHub Actions for automated syntax checks and testing.

## Requirements

- Node.js 24 or newer.
- npm.
- Internet connection to access the FLOP Gateway.
- The `@flop-labs/client` package.

## Installation

Clone the repository:

```bash
git clone https://github.com/san4641/flop-ai-agent.git
```

Move into the project directory:

```bash
cd flop-ai-agent
```

Install the project dependencies:

```bash
npm install
```

On Windows PowerShell, use:

```powershell
npm.cmd install
```

## Project Structure

```text
flop-ai-agent/
│
├── agent-connector/
│   ├── index.mjs
│   ├── formatters.mjs
│   ├── validation.mjs
│   ├── README.md
│   │
│   └── test/
│       ├── formatters.test.mjs
│       └── validation.test.mjs
│
├── .github/
│   └── workflows/
│       └── connector-check.yml
│
├── package.json
└── package-lock.json
```

## Usage

Run the connector from the repository root:

```bash
node agent-connector/index.mjs
```

The connector performs the following operations:

1. Connects to the FLOP Gateway.
2. Retrieves the available model list.
3. Fetches details for each model.
4. Validates each model's data.
5. Records successful and failed results.
6. Prints a model discovery summary.
7. Saves the complete report as `agent-connector/model-details.json`.

## Model Validation

The connector uses `validation.mjs` to validate model metadata before accepting a model as successful.

The validation process checks:

- Model input and object structure.
- Required string fields.
- Model creation timestamp.
- Context length.
- Architecture object.
- Input and output modality arrays.
- Pricing fields.
- Provider fields.
- Supported parameters.

A model that fails validation is recorded as an error instead of being accepted as a successful result.

## Formatting Utilities

The `formatters.mjs` module provides reusable formatting functions:

- `valueOrNA()` handles missing values, arrays, numbers, and objects.
- `shorten()` limits the length of long text.
- `timestampToDate()` converts Unix timestamps into ISO date strings.

Missing or unavailable metadata is displayed as `Not reported`.

## Running Unit Tests

Run all connector unit tests from the repository root:

```bash
npm test
```

On Windows PowerShell, use:

```powershell
npm.cmd test
```

Run formatter tests separately:

```bash
node --test agent-connector/test/formatters.test.mjs
```

Run model validation tests separately:

```bash
node --test agent-connector/test/validation.test.mjs
```

### Current Test Coverage

| Test Module | Tests |
|---|---:|
| Formatter Utilities | 11 |
| Model Validation | 11 |
| **Total** | **22** |

The current test suite has passed all 22 tests.

Expected test summary:

```text
tests 22
pass 22
fail 0
```

## Syntax Checks

Run all connector syntax checks from the repository root:

```bash
npm run check
```

On Windows PowerShell, use:

```powershell
npm.cmd run check
```

The check command verifies:

- Main connector syntax (`index.mjs`).
- Formatter module syntax (`formatters.mjs`).
- Model validation module syntax (`validation.mjs`).

Individual syntax checks can also be run manually:

```bash
node --check agent-connector/index.mjs
node --check agent-connector/formatters.mjs
node --check agent-connector/validation.mjs
```

## Available npm Scripts

The following commands are available from the repository root:

| Command | Purpose |
|---|---|
| `npm start` | Starts the main application server |
| `npm run dashboard` | Starts the dashboard server |
| `npm test` | Runs all connector unit tests |
| `npm run check` | Checks connector JavaScript syntax |
| `npm run agent` | Runs the agent script |
| `npm run research` | Runs the research script |
| `npm run mcp-check` | Runs the MCP check script |
| `npm run check-models` | Runs the model check script |

For Windows PowerShell, prefix npm commands with `npm.cmd`.

## Continuous Integration

GitHub Actions automatically checks the connector when relevant changes are pushed to the `main` branch or submitted through a pull request.

The workflow is triggered by changes to:

- `agent-connector/**`
- `package.json`
- `.github/workflows/connector-check.yml`

It can also be started manually using `workflow_dispatch`.

The workflow performs:

1. Repository checkout.
2. Node.js environment setup.
3. Main connector syntax check.
4. Formatter module syntax check.
5. Validation module syntax check.
6. All connector unit tests.

Workflow file:

```text
.github/workflows/connector-check.yml
```

## Output

The connector generates:

```text
agent-connector/model-details.json
```

The JSON report contains:

- Project information.
- Fetch timestamp.
- Total models listed.
- Successful model details.
- Failed model details.
- Retrieved model metadata.

The report is generated locally when the connector runs.

## Important Notes

- This project focuses on model discovery and metadata retrieval.
- It does not submit chat completion requests.
- It does not connect a cryptocurrency wallet.
- It does not sign or submit blockchain transactions.
- Pricing values are metadata returned by the Gateway, not guaranteed payment quotes.
- A discovered model is not necessarily an actively serving model.
- Missing metadata is not treated as a fabricated value.
- The JSON discovery report is generated locally and is not automatically uploaded to GitHub.

## Contributing

Contributions are welcome.

To contribute:

1. Fork the repository.
2. Create a new branch for your changes.
3. Make your changes and add appropriate tests.
4. Run the syntax checks using `npm run check`.
5. Run the unit tests using `npm test`.
6. Submit a pull request.

Please keep changes focused, testable, and documented.

## License

See the repository's license file for applicable licensing terms.

## Repository

GitHub: https://github.com/san4641/flop-ai-agent

---

Built by the community for the FLOP Network ecosystem.
