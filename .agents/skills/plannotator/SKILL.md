---
name: plannotator
version: 0.1.0
description: Interactive plan review, code review, and markdown annotation for Qoder IDE. Provides visual interfaces for reviewing plans, code changes, and markdown files with annotations and feedback.
---

# Plannotator for Qoder IDE

Plannotator provides interactive visual review interfaces for:
1. **Plan Review** - Review and annotate AI-generated plans
2. **Code Review** - Review uncommitted code changes
3. **Markdown Annotation** - Annotate any markdown file

## Prerequisites

- **Plannotator** installed and built
- **Bun** runtime
- **Git** (for code review)

## Installation

1. **Clone and build Plannotator**:
   ```bash
   git clone https://github.com/backnotprop/plannotator.git
   cd plannotator
   bun install
   bun run build:qoder
   ```

2. **Add to Qoder CLI** (required for MCP server):
   ```bash
   qodercli mcp add plannotator -- bun "$(pwd)/apps/qoder-plugin/dist/index.js"
   ```

3. **Verify installation**:
   ```bash
   qodercli mcp list
   ```

   You should see `plannotator` in the list with status "Connected".

## Usage

### 1. Plan Review

**When to use**: When the AI has created a plan that needs review before implementation.

**How to use**: The AI will automatically call the `submit_plan` tool when it has a plan ready.

**What happens**:
- A browser opens with the plan rendered as markdown
- You can add annotations, comments, and suggestions
- Click "Approve" to proceed with implementation
- Click "Deny" to request changes

**Example**:
```
Please review my plan for implementing user authentication with JWT...
```

### 2. Code Review

**When to use**: When you want to review uncommitted code changes.

**How to use**: Use the slash command:
```
/plannotator-review
```

**What happens**:
- A browser opens with a visual diff of all uncommitted changes
- You can add annotations to specific lines of code
- Click "Send Feedback" to provide comments
- Click "Approve" if no changes are needed

### 3. Markdown Annotation

**When to use**: When you want to review and annotate any markdown file.

**How to use**: Use the slash command with a file path:
```
/plannotator-annotate path/to/file.md
```

**What happens**:
- A browser opens with the markdown file rendered
- You can add annotations, comments, and suggestions
- Click "Send Annotations" to provide feedback

### 4. Annotate Last Message

**When to use**: When you want to provide feedback on the AI's last response.

**How to use**: Use the slash command:
```
/plannotator-last
```

**What happens**:
- A browser opens with the last assistant message
- You can add annotations and comments
- Click "Send Annotations" to provide feedback

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PLANNOTATOR_REMOTE` | Remote mode (SSH, DevContainer) | `false` |
| `PLANNOTATOR_PORT` | Fixed port | Random (local), 19432 (remote) |
| `PLANNOTATOR_SHARE` | Enable URL sharing | `true` |
| `PLANNOTATOR_SHARE_URL` | Custom share URL | `https://share.plannotator.ai` |

## Remote Development

For SSH or DevContainer environments:

```bash
export PLANNOTATOR_REMOTE=1
export PLANNOTATOR_PORT=19432
```

Access the UI at `http://localhost:19432`.

## Features

### Plan Review Features
- ✅ Markdown rendering with syntax highlighting
- ✅ Version history and diff view
- ✅ Annotations with comments
- ✅ Image attachments
- ✅ Shareable URLs
- ✅ Obsidian and Bear integrations

### Code Review Features
- ✅ Visual diff viewer
- ✅ Per-line annotations
- ✅ File tree navigation
- ✅ Git integration (stage/unstage)
- ✅ PR review support

### Markdown Annotation Features
- ✅ Full markdown rendering
- ✅ Inline annotations
- ✅ Comment threads
- ✅ Export annotations

## Troubleshooting

### Common Issues

1. **MCP server not connected**
   - Check Bun installation
   - Verify Plannotator build
   - Check port availability

2. **Browser not opening**
   - Check `PLANNOTATOR_REMOTE` setting
   - Manually open the URL shown in terminal

3. **Permission errors**
   - Ensure Bun has execute permissions
   - Check file system permissions

4. **Build errors**
   - Run `bun install` first
   - Check Node.js version

### Logs

Qoder CLI will show MCP server logs in the terminal for debugging.

## Customization

### Command Aliases
You can create custom command aliases in Qoder CLI:

```bash
# Add to ~/.qoder.json
{
  "commands": {
    "pr": "plannotator-review",
    "annotate": "plannotator-annotate",
    "plan": "plannotator-last"
  }
}
```

### Keyboard Shortcuts
- **Ctrl+Enter** - Submit feedback
- **Esc** - Close annotation toolbar
- **Tab** - Next annotation
- **Shift+Tab** - Previous annotation

## Integration with Qoder Workflows

### Recommended Workflow
1. **Plan Phase**: AI creates plan → `submit_plan` → review → approve/deny
2. **Implementation Phase**: AI implements → `/plannotator-review` → review changes
3. **Documentation Phase**: AI writes docs → `/plannotator-annotate docs.md` → review

### Best Practices
- Always review plans before implementation
- Use code review for significant changes
- Annotate documentation for clarity
- Leverage version history for comparisons

## Support

For issues and feature requests:
- GitHub: https://github.com/backnotprop/plannotator/issues
- Discord: [Plannotator Community]

## License

MIT OR Apache-2.0
