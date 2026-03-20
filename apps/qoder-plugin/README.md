# Plannotator for Qoder CLI

Interactive plan review and code annotation for Qoder CLI via MCP (Model Context Protocol).

## Features

- **Plan Review**: Submit plans for visual review with annotation support
- **Code Review**: Review uncommitted changes with visual diff viewer
- **Markdown Annotation**: Annotate any markdown file with comments and suggestions

## Installation

### Prerequisites

1. Install [Qoder CLI](https://qoder.com/cli)
2. Install [Bun](https://bun.sh) runtime

### Install the MCP Server

```bash
# Clone and build
git clone https://github.com/backnotprop/plannotator.git
cd plannotator
bun install
bun run build:qoder

# Or install from npm (when published)
npm install -g @plannotator/qoder
```

### Configure Qoder CLI

Add the Plannotator MCP server to Qoder:

```bash
qodercli mcp add plannotator -- bun /path/to/plannotator/apps/qoder-plugin/dist/index.js
```

Or manually add to `~/.qoder.json`:

```json
{
  "mcpServers": {
    "plannotator": {
      "command": "bun",
      "args": ["/path/to/plannotator/apps/qoder-plugin/dist/index.js"],
      "type": "stdio"
    }
  }
}
```

## Usage

### Plan Review

When you have a plan ready, use the `submit_plan` tool:

```
Please review my plan for implementing user authentication...
```

The AI will call `submit_plan` which opens a browser-based review UI where you can:
- View the plan rendered as markdown
- Add annotations to specific sections
- Approve or request changes

### Code Review

Use the slash command:

```
/plannotator-review
```

Opens a visual diff viewer for your uncommitted changes with annotation support.

### Markdown Annotation

Annotate any markdown file:

```
/plannotator-annotate path/to/file.md
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PLANNOTATOR_REMOTE` | Set to `1` or `true` for remote mode (devcontainer, SSH) |
| `PLANNOTATOR_PORT` | Fixed port to use (default: random locally, `19432` for remote) |
| `PLANNOTATOR_SHARE` | Set to `disabled` to disable URL sharing |
| `PLANNOTATOR_SHARE_URL` | Custom base URL for share links |
| `PLANNOTATOR_PLAN_TIMEOUT_SECONDS` | Max wait for approval (default: 345600, set 0 to disable) |

## Remote/Devcontainer Usage

For remote development environments:

```bash
export PLANNOTATOR_REMOTE=1
export PLANNOTATOR_PORT=19432
```

This uses a fixed port and skips automatic browser opening. Access the UI at `http://localhost:19432`.

## MCP Tools Provided

### submit_plan

Submit a plan for visual review.

**Parameters:**
- `plan` (string): The plan content as markdown text, or an absolute path to a .md file

**Returns:** Approval status and any feedback/notes from the user.

### plannotator_review

Review uncommitted code changes.

**Parameters:** None

**Returns:** Review feedback from the user.

### plannotator_annotate

Annotate a markdown file.

**Parameters:**
- `file_path` (string): Path to the markdown file to annotate

**Returns:** Annotation feedback from the user.

## Building

```bash
# Build the MCP server
bun run build

# This copies the HTML from hook/dist and review/dist
# and compiles the TypeScript to a single file
```

## License

MIT OR Apache-2.0
