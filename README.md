# MCP Server Lab

> Exploring MCP-powered test automation with Cypress, Playwright, and self-healing locators.

![MCP Cypress Self-Healing Demo](docs/images/demo.png)

## What is this?

A small experimental lab for exploring how **Model Context Protocol (MCP)** can be used in test automation.

The current experiment focuses on **self-healing Cypress locators**.

When a locator changes in the application:

```text
Cypress
   ↓
MCP Client
   ↓
MCP Server
   ↓
Playwright
   ↓
DOM inspection
   ↓
Replacement locator
```

Instead of immediately failing, the test can ask the MCP layer to find and validate a replacement locator.

## Example

The test expects:

```javascript
cy.get('[data-testid="brand-filter"]')
```

The application has changed to:

```html
<select data-testid="brand-selector">
```

The MCP server detects the broken locator and returns:

```text
[data-testid="brand-selector"]
```

The Cypress test can then continue with the healed locator.

## Tech Stack

* Cypress
* Playwright
* Model Context Protocol (MCP)
* Node.js
* JavaScript
* Zod

## Project Structure

```text
mcp-server-lab/
├── cypress-project/
├── demo-app/
└── mcp-server/
```

## Run

Start the demo application:

```bash
cd demo-app
npx serve .
```

Then test the MCP client:

```bash
cd mcp-server
node client.js '[data-testid="brand-filter"]'
```

Run Cypress:

```bash
cd cypress-project
npx cypress open
```

## Current Status

This is an **experimental proof of concept**.

The current locator healing logic is deterministic. The goal is to establish the MCP-based architecture first and gradually introduce more intelligent reasoning.

## Next Steps

* Improve generic locator healing
* Add test-intent and semantic matching
* Experiment with AI-assisted locator decisions

## Why?

This project is part of my exploration into:

**AI-driven Quality Engineering · Test Automation · MCP · Self-Healing Tests**

---

**Hızır Yılmaz**
Software Test Automation Engineer
