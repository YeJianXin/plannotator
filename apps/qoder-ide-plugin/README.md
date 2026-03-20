# Plannotator for Qoder IDE

Interactive plan review, code review, and markdown annotation plugin for Qoder IDE.

## Features

- **Plan Review**: Visual review of AI-generated plans with annotations
- **Code Review**: Review uncommitted changes with visual diff viewer
- **Markdown Annotation**: Annotate any markdown file with comments
- **Skill Integration**: Full integration with Qoder Skills system

## Installation

### Method 1: From Source

1. **Clone and build Plannotator**:
   ```bash
   git clone https://github.com/backnotprop/plannotator.git
   cd plannotator
   bun install
   bun run build:qoder
   ```

2. **Install the Qoder IDE Plugin**:
   ```bash
   cd apps/qoder-ide-plugin
   npm install -g .
   ```

3. **Add the Skill**:
   Copy the `plannotator` skill from `.agents/skills/plannotator/` to your Qoder IDE skills directory.

### Method 2: From Marketplace

When available, install from the Qoder IDE marketplace:
```
/plugin marketplace add backnotprop/plannotator
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PLANNOTATOR_REMOTE` | Remote mode (SSH, DevContainer) | `false` |
| `PLANNOTATOR_PORT` | Fixed port | Random (local), 19432 (remote) |
| `PLANNOTATOR_SHARE` | Enable URL sharing | `true` |
| `PLANNOTATOR_SHARE_URL` | Custom share URL | `https://share.plannotator.ai` |

### Qoder IDE Settings

Add to your Qoder IDE configuration:

```json
{
  "plugins": [
    "@plannotator/qoder-ide"
  ],
  "commands": {
    "pr": "plannotator-review",
    "annotate": "plannotator-annotate",
    "plan": "plannotator-last"
  }
}
```

## Usage

### Plan Review

When the AI has a plan ready, it will call `submit_plan` to open the visual review UI.

### Code Review

Use the slash command:
```
/plannotator-review
```

### Markdown Annotation

Annotate any markdown file:
```
/plannotator-annotate path/to/file.md
```

### Annotate Last Message

Annotate the AI's last message:
```
/plannotator-last
```

## Remote Development

For SSH or DevContainer environments:

```bash
export PLANNOTATOR_REMOTE=1
export PLANNOTATOR_PORT=19432
```

Access the UI at `http://localhost:19432`.

## Features

### Plan Review
- ✅ Markdown rendering with syntax highlighting
- ✅ Version history and diff view
- ✅ Annotations with comments
- ✅ Image attachments
- ✅ Shareable URLs

### Code Review
- ✅ Visual diff viewer
- ✅ Per-line annotations
- ✅ File tree navigation
- ✅ Git integration

### Markdown Annotation
- ✅ Full markdown rendering
- ✅ Inline annotations
- ✅ Comment threads

## Troubleshooting

### Common Issues

1. **Bun not found**
   - Install Bun: https://bun.sh
   - Set `BUN_PATH` environment variable

2. **MCP server not connected**
   - Run: `qodercli mcp list`
   - Ensure plannotator is listed as "Connected"

3. **Browser not opening**
   - Check `PLANNOTATOR_REMOTE` setting
   - Manually open the URL shown in terminal

## Support

For issues and feature requests:
- GitHub: https://github.com/backnotprop/plannotator/issues

## License

MIT OR Apache-2.0
