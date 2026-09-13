import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { chromium } from "playwright";
import * as z from "zod/v4";

const server = new McpServer({
  name: "cypress-mcp-lab",
  version: "1.0.0",
});

server.registerTool(
  "heal_locator",
  {
    description: "Find and validate a replacement for a broken locator",
    inputSchema: z.object({
      locator: z.string(),
    }),
  },
  async ({ locator }) => {
    const browser = await chromium.launch({
      headless: true,
    });

    const page = await browser.newPage();

    await page.goto("http://localhost:3000");

    // 1. Check original locator
    const original = page.locator(locator);
    const originalCount = await original.count();

    if (originalCount > 0) {
      await browser.close();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              originalLocator: locator,
              healed: false,
              replacement: locator,
              confidence: "high",
              reason: "Original locator is still valid",
            }),
          },
        ],
      };
    }

    // 2. Find candidate elements
    const candidates = await page.locator("select, button, input").evaluateAll(
      (elements) =>
        elements.map((element) => ({
          tag: element.tagName.toLowerCase(),
          testId: element.getAttribute("data-testid"),
          name: element.getAttribute("name"),
          id: element.id,
          text: element.innerText?.trim(),
          ariaLabel: element.getAttribute("aria-label"),
        }))
    );

    // 3. Validate candidates
    const validCandidates = [];

    for (const candidate of candidates) {
      let candidateLocator = null;

      if (candidate.testId) {
        candidateLocator = `[data-testid="${candidate.testId}"]`;
      } else if (candidate.id) {
        candidateLocator = `#${candidate.id}`;
      } else if (candidate.name) {
        candidateLocator = `${candidate.tag}[name="${candidate.name}"]`;
      }

      if (!candidateLocator) {
        continue;
      }

      const element = page.locator(candidateLocator);

      const count = await element.count();

      if (count === 0) {
        continue;
      }

      const visible = await element.first().isVisible();
      const enabled = await element.first().isEnabled();

      let canSelectBMW = false;

      if (candidate.tag === "select") {
        canSelectBMW =
          (await element.first().locator('option[value="BMW"]').count()) > 0;
      }

      if (visible && enabled) {
        validCandidates.push({
          locator: candidateLocator,
          tag: candidate.tag,
          testId: candidate.testId,
          canSelectBMW,
        });
      }
    }

    await browser.close();

    // 4. Pick the best candidate
    const bestCandidate = validCandidates.find(
      (candidate) =>
        candidate.tag === "select" && candidate.canSelectBMW
    );

    if (bestCandidate) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              originalLocator: locator,
              healed: true,
              replacement: bestCandidate.locator,
              confidence: "high",
              reason:
                "Candidate is a visible, enabled select element containing the expected BMW option",
            }),
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            originalLocator: locator,
            healed: false,
            replacement: null,
            confidence: "low",
            reason: "No suitable replacement locator found",
            candidates: validCandidates,
          }),
        },
      ],
    };
  }
);

const transport = new StdioServerTransport();

await server.connect(transport);