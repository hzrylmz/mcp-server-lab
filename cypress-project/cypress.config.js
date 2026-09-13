const { defineConfig } = require("cypress");
const { execFileSync } = require("child_process");

module.exports = defineConfig({
  allowCypressEnv: false,

  e2e: {
    baseUrl: "http://localhost:3000",

    setupNodeEvents(on, config) {
      on("task", {
        healLocator(locator) {
          const output = execFileSync(
            "node",
            ["../mcp-server/client.js", locator],
            {
              cwd: __dirname,
              encoding: "utf-8",
            }
          );

          return output;
        },
      });
    },
  },
});