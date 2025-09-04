# Claude MCP Installation Script
# This script installs context7 and playwright MCP servers

Write-Host "Installing Claude MCP servers..." -ForegroundColor Green

# Install context7 MCP server
Write-Host "Installing context7 MCP server..." -ForegroundColor Yellow
claude mcp add context7 --scope user -- npx -y @upstash/context7-mcp@latest

# Install playwright MCP server  
Write-Host "Installing playwright MCP server..." -ForegroundColor Yellow
claude mcp add playwright --scope user -- npx @playwright/mcp@latest

Write-Host "MCP installation complete!" -ForegroundColor Green