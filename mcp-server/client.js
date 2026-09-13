
import path from "path";
import { fileURLToPath } from "url";

import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";

const locator = process.argv[2];

if (!locator) {
  throw new Error("Locator argument is required");
}

const client = new Client({
  name: "cypress-mcp-lab-client",
  version: "1.0.0",
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serverPath = path.join(__dirname, "server.js");

const tsxPath = path.join(
  __dirname,
  "node_modules",
  ".bin",
  "tsx"
);

const transport = new StdioClientTransport({
  command: tsxPath,
  args: [serverPath],
});
await client.connect(transport);

const result = await client.callTool({
  name: "heal_locator",
  arguments: {
    locator,
  },
});

const resultText = result.content?.find(
  (item) => item.type === "text"
)?.text;

const healingResult = JSON.parse(resultText);

console.log(JSON.stringify(healingResult));

