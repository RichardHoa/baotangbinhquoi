## Project Configuration

- **Language**: JavaScript (JSDoc)
- **Package Manager**: npm
- **Add-ons**: prettier, eslint, vitest, enhanced-img, sveltekit-adapter, ai-tools, paraglide

## Styling

Run `/css-best-practices` when writing or reviewing CSS. `src/lib/styles/app.css` locks the `@layer` order and holds the design tokens.

- Wrap every component `<style>` body in `@layer components { }`: unlayered CSS beats every layer.
- Theme Leaflet in `src/lib/styles/leaflet-theme.css`. Its stylesheet sits in the `vendor` layer, so layer order alone wins.
- Surfaces are translucent over the map: check new color pairs against both bright and dark imagery.

---

You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available Svelte MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.

## Agent skills

### Issue tracker

Issues and specs are tracked in GitHub Issues for this repo, using the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Uses the five default labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
