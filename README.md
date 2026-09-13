# MCP Server Lab

> MCP-powered QA automation experiments with Cypress, Playwright, and self-healing test automation.

This project explores how **Model Context Protocol (MCP)** can be integrated into a Cypress test automation framework to detect broken locators, inspect the current application DOM, identify replacement candidates, validate them, and automatically recover the test flow.

The project is intentionally built as a small laboratory environment to experiment with **AI-driven Quality Engineering, MCP, Playwright, Cypress, and self-healing test automation**.

---

## Why?

UI changes can easily break automated tests.

For example, a developer changes:

```html
<select data-testid="brand-filter">
```

to:

```html
<select data-testid="brand-selector">
```

A traditional Cypress test immediately fails:

```javascript
cy.get('[data-testid="brand-filter"]')
  .select('BMW')
```

Instead of simply failing, this project experiments with a different approach:

```text
Broken Locator
      ↓
MCP Client
      ↓
MCP Server
      ↓
Inspect Application
      ↓
Find Candidate Locators
      ↓
Validate Candidate
      ↓
Return Replacement Locator
      ↓
Continue Test
```

---

## Architecture

```text
┌───────────────────────┐
│      Cypress Test     │
│                       │
│  cy.task("heal...")   │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│      MCP Client       │
│       client.js       │
└───────────┬───────────┘
            │
            │ MCP / stdio
            ▼
┌───────────────────────┐
│      MCP Server       │
│       server.js       │
│                       │
│  • get_page_dom       │
│  • find_candidates    │
│  • validate_locator   │
│  • heal_locator       │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│       Playwright      │
│                       │
│   Inspect live DOM    │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│      Demo Web App     │
│      AutoMarket       │
└───────────────────────┘
```

---

## Project Structure

```text
mcp-cypress-self-healing/
│
├── cypress-project/
│   ├── cypress/
│   │   └── e2e/
│   │       └── vehicle-search.cy.js
│   └── cypress.config.js
│
├── demo-app/
│   └── index.html
│
├── mcp-server/
│   ├── client.js
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md
```

---

## Current MCP Tools

### `get_page_dom`

Opens the demo application and returns the current page DOM.

Useful for:

* DOM inspection
* element discovery
* future AI-based reasoning

---

### `find_locator_candidates`

Receives a broken locator and searches the current page for possible replacement elements.

Example:

```text
[data-testid="brand-filter"]
```

Possible candidate:

```text
[data-testid="brand-selector"]
```

---

### `validate_locator`

Validates whether a candidate locator:

* exists
* is visible
* is enabled
* represents the expected element type
* supports the expected interaction

For example, a `<select>` element containing the expected BMW option.

---

### `heal_locator`

Combines candidate discovery and validation to return a replacement locator.

Example response:

```json
{
  "originalLocator": "[data-testid=\"brand-filter\"]",
  "healed": true,
  "replacement": "[data-testid=\"brand-selector\"]",
  "confidence": "high"
}
```

---

## Example

The demo intentionally contains a broken locator.

The application contains:

```html
<select data-testid="brand-selector">
```

while the Cypress test initially expects:

```javascript
const brokenLocator = '[data-testid="brand-filter"]'
```

The test asks the MCP layer to heal the locator:

```javascript
cy.task('healLocator', brokenLocator)
  .then((result) => {
    const healingResult = JSON.parse(result)

    expect(healingResult.healed)
      .to.equal(true)

    cy.get(healingResult.replacement)
      .select('BMW')
  })
```

The MCP layer discovers:

```text
[data-testid="brand-selector"]
```

and the test continues using the replacement locator.

---

## Running the Demo

### 1. Start the demo application

```bash
cd demo-app
npx serve .
```

The application will be available at:

```text
http://localhost:3000
```

---

### 2. Install MCP dependencies

```bash
cd mcp-server
npm install
npx playwright install chromium
```

---

### 3. Test the MCP client

```bash
node client.js '[data-testid="brand-filter"]'
```

Expected result:

```json
{
  "originalLocator": "[data-testid=\"brand-filter\"]",
  "healed": true,
  "replacement": "[data-testid=\"brand-selector\"]",
  "confidence": "high"
}
```

---

### 4. Run Cypress

```bash
cd cypress-project
npm install
npx cypress open
```

or:

```bash
npx cypress run
```

---

## Important Note

The current implementation is intentionally **not an LLM-based healing engine**.

The first version uses deterministic DOM inspection and validation to establish the MCP architecture.

This makes it possible to test the fundamental workflow before introducing an LLM into the decision-making process.

The intended evolution is:

```text
Current

Cypress
   ↓
MCP
   ↓
Playwright DOM inspection
   ↓
Deterministic candidate selection


Future

Cypress
   ↓
MCP
   ↓
DOM + Test Intent + Context
   ↓
AI Reasoning
   ↓
Candidate Ranking
   ↓
Validation
   ↓
Self-Healed Test
```

---

## Roadmap

### Phase 1 — MCP Foundation

* [x] Create demo application
* [x] Integrate Cypress
* [x] Create MCP server
* [x] Create MCP client
* [x] Inspect live DOM with Playwright
* [x] Find locator candidates
* [x] Validate candidate locators
* [x] Implement basic locator healing

### Phase 2 — Intelligent Locator Healing

* [ ] Generic locator similarity scoring
* [ ] Test intent extraction
* [ ] Semantic element matching
* [ ] Candidate ranking
* [ ] Confidence scoring
* [ ] Support more interaction types
* [ ] Remove hard-coded BMW-specific logic

### Phase 3 — AI-Powered Healing

* [ ] LLM-based candidate selection
* [ ] MCP tool orchestration
* [ ] DOM context reduction
* [ ] Test-step-aware reasoning
* [ ] AI-generated locator explanations
* [ ] Healing decision audit logs

### Phase 4 — Quality Engineering

* [ ] Healing history
* [ ] Failure analytics
* [ ] Locator stability scoring
* [ ] Flaky test detection
* [ ] Automatic healing reports
* [ ] CI/CD integration
* [ ] GitHub Actions pipeline

---

## Technology Stack

* **Cypress** — E2E test automation
* **Playwright** — browser and DOM inspection
* **Model Context Protocol (MCP)** — tool communication layer
* **Node.js** — runtime
* **JavaScript**
* **Zod** — MCP tool input validation
* **serve** — local demo application server

---

## Learning Goals

This project is primarily a learning and experimentation environment around:

* AI-driven Quality Engineering
* Model Context Protocol
* Test automation architecture
* Self-healing automation
* Locator resilience
* Browser automation
* Cypress + Playwright interoperability
* AI-assisted test maintenance
* MCP-based developer tools

---

## Disclaimer

This repository is an experimental proof of concept.

It is not intended to replace proper test design, stable locator strategies, or engineering practices such as using semantic selectors and dedicated test IDs.

Self-healing should be treated as a mechanism for improving test resilience and reducing maintenance effort — not as a way to hide genuine application defects.

---

## Author

**Hızır Yılmaz**

Software Test Automation Engineer

Interested in:

* Quality Engineering
* Test Automation
* AI-driven Testing
* MCP
* Software Architecture
* Continuous Testing

---

⭐ If you find the experiment useful, feel free to explore the implementation and build on it.
