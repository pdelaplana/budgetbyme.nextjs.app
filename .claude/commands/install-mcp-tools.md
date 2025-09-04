# Install MCP Tools

Use this command to install of Context7 and Playwright MCP packages for Claude Code.

Should execute these commands in sequence:
  1. `claude mcp add context7 --scope user -- npx -y @upstash/context7-mcp@latest`
  2. `claude mcp add playwright --scope user -- npx @playwright/mcp@latest`

Implementation approach:
- Use shell script or batch file for automation
- Include pre-flight checks (Claude Code installed, internet connectivity)
- Provide clear success/failure messages
- Log installation results for troubleshooting
- Option to install packages individually if one fails
