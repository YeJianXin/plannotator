# Qoder 插件安装指南

本文档详细介绍如何安装和配置 Plannotator 的 Qoder CLI 插件和 Qoder IDE 插件。

## 环境要求

### 通用要求
1. **Bun 运行时** - v1.0.0 或更高版本
   - 从 https://bun.sh 下载并安装

2. **Git** - 用于克隆仓库

3. **Node.js** (可选) - v16.0.0 或更高版本

### Qoder CLI 要求
1. **Qoder CLI** - 最新版本
   - 从 https://qoder.com/cli 下载并安装

### Qoder IDE 要求
1. **Qoder IDE** - 最新版本
   - 从 https://qoder.com 下载并安装

## 安装方法

### 方法一：一键安装脚本（推荐）

#### Qoder CLI 安装
```bash
# 下载并运行一键安装脚本
curl -fsSL https://raw.githubusercontent.com/YeJianXin/plannotator/main/install_qoder_cli.sh | bash
```

#### Qoder IDE 安装
```bash
# 下载并运行一键安装脚本
curl -fsSL https://raw.githubusercontent.com/YeJianXin/plannotator/main/install_qoder_ide.sh | bash
```

### 方法二：手动安装

#### 1. 克隆仓库
```bash
git clone https://github.com/YeJianXin/plannotator.git
cd plannotator
```

#### 2. 安装依赖
```bash
bun install
```

#### 3. 构建插件
```bash
bun run build:qoder
```

#### Qoder CLI 安装
```bash
qodercli mcp add plannotator -- bun "$(pwd)/apps/qoder-plugin/dist/index.js"
```

#### Qoder IDE 安装
```bash
cd apps/qoder-ide-plugin
npm install -g .

# 添加 Skill
QODER_SKILLS_DIR="$HOME/.qoder/skills"
mkdir -p "$QODER_SKILLS_DIR"
cp -r "$(pwd)/../../.agents/skills/plannotator" "$QODER_SKILLS_DIR/"
```



## 配置

### Qoder CLI 配置

#### 手动配置 (可选)

如果自动添加失败，可以手动编辑 `~/.qoder.json` 文件：

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

### Qoder IDE 配置

#### 插件配置

在 Qoder IDE 中添加以下配置：

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

### 环境变量

| 变量名 | 描述 | 默认值 |
|--------|------|--------|
| `PLANNOTATOR_REMOTE` | 远程模式（如 SSH、DevContainer） | `false` |
| `PLANNOTATOR_PORT` | 固定端口 | 本地随机，远程 19432 |
| `PLANNOTATOR_SHARE` | 启用 URL 分享 | `true` |
| `PLANNOTATOR_SHARE_URL` | 自定义分享 URL 基础地址 | `https://share.plannotator.ai` |
| `PLANNOTATOR_PLAN_TIMEOUT_SECONDS` | 计划审批超时时间（秒） | 345600 (96 小时) |

## 验证安装

### Qoder CLI 验证

1. **检查 MCP 服务状态**
   ```bash
   qodercli mcp list
   ```

   输出应该显示：
   ```
   [STDIO] plannotator: bun /path/to/plannotator/apps/qoder-plugin/dist/index.js - Connected
   ```

2. **测试命令**
   启动 Qoder CLI：
   ```bash
   qodercli
   ```

   然后输入：
   ```
   /help
   ```

   应该能看到 `plannotator-review`、`plannotator-annotate` 和 `plannotator-last` 命令。

### Qoder IDE 验证

1. **检查插件状态**
   在 Qoder IDE 中，打开插件管理器，应该能看到 Plannotator 插件已安装。

2. **测试命令**
   在 Qoder IDE 中，打开命令面板，输入 `/plannotator-review` 或其他 Plannotator 命令，应该能看到命令被识别。

3. **检查 Skill**
   在 Qoder IDE 中，打开 Skills 管理，应该能看到 `plannotator` skill 已添加。

## 使用示例

### Qoder CLI 使用

#### 1. 计划审查

当 AI 有计划时，它会调用 `submit_plan` 工具，打开可视化审查界面：

```
Please review my plan for implementing user authentication...
```

#### 2. 代码审查

审查未提交的代码变更：

```
/plannotator-review
```

这会打开一个可视化差异查看器，显示所有未提交的变更。

#### 3. Markdown 注释

注释任何 Markdown 文件：

```
/plannotator-annotate docs/architecture.md
```

#### 4. 注释最后一条消息

注释 AI 的最后一条消息：

```
/plannotator-last
```

### Qoder IDE 使用

#### 1. 计划审查

当 AI 有计划时，它会自动打开 Plannotator 计划审查界面。

#### 2. 代码审查

在 Qoder IDE 中，使用命令面板输入：

```
/plannotator-review
```

或者使用快捷键（如果配置了）。

#### 3. Markdown 注释

在 Qoder IDE 中，使用命令面板输入：

```
/plannotator-annotate path/to/file.md
```

#### 4. 注释最后一条消息

在 Qoder IDE 中，使用命令面板输入：

```
/plannotator-last
```

## 远程环境使用

### Qoder CLI 远程使用

在远程开发环境（如 SSH、DevContainer）中：

```bash
export PLANNOTATOR_REMOTE=1
export PLANNOTATOR_PORT=19432
```

这会使用固定端口 19432 并跳过自动浏览器打开。在本地浏览器中访问 `http://localhost:19432`。

### Qoder IDE 远程使用

在 Qoder IDE 中，同样需要设置环境变量：

1. **在终端中设置**：
   ```bash
export PLANNOTATOR_REMOTE=1
export PLANNOTATOR_PORT=19432
   ```

2. **或在 Qoder IDE 配置中设置**：
   在 Qoder IDE 的环境变量配置中添加上述变量。

3. **访问界面**：
   在本地浏览器中访问 `http://localhost:19432`。

## 故障排除

### 常见问题

#### Qoder CLI 问题

1. **MCP 服务连接失败**
   - 检查 Bun 安装是否正确
   - 验证路径是否正确
   - 检查端口是否被占用

2. **浏览器不自动打开**
   - 检查是否设置了 `PLANNOTATOR_REMOTE=1`
   - 手动访问显示的 URL

3. **权限错误**
   - 确保 Bun 有执行权限
   - 检查文件系统权限

4. **构建失败**
   - 确保所有依赖已安装
   - 检查 Node.js 版本

#### Qoder IDE 问题

1. **插件不显示**
   - 检查插件是否正确安装
   - 重启 Qoder IDE
   - 检查插件权限

2. **命令不工作**
   - 检查插件是否已激活
   - 验证命令路径是否正确
   - 检查 Qoder IDE 版本是否兼容

3. **Skill 不显示**
   - 检查 Skill 是否已正确复制到技能目录
   - 重启 Qoder IDE
   - 检查 Skill 格式是否正确

### 日志

#### Qoder CLI 日志
Qoder CLI 会在终端显示 MCP 服务的日志，可用于排查问题。

#### Qoder IDE 日志
Qoder IDE 的日志位置：
- macOS: `~/Library/Logs/Qoder/`
- Windows: `%APPDATA%\Qoder\logs\`
- Linux: `~/.local/share/Qoder/logs/`

## 卸载

### Qoder CLI 卸载

```bash
qodercli mcp remove plannotator
```

### Qoder IDE 卸载

1. **卸载插件**：
   在 Qoder IDE 插件管理器中卸载 Plannotator 插件。

2. **删除 Skill**：
   ```bash
   rm -rf "$HOME/.qoder/skills/plannotator"
   ```



## 版本更新

### Qoder CLI 更新

1. **更新源码**
   ```bash
   git pull
   bun run build:qoder
   ```

2. **重启 Qoder CLI**
   ```bash
   qodercli mcp list
   ```

### Qoder IDE 更新

1. **更新源码**
   ```bash
   git pull
   bun run build:qoder
   ```

2. **重新安装插件**
   ```bash
   cd apps/qoder-ide-plugin
   npm install -g .
   ```

3. **重启 Qoder IDE**
   重启 Qoder IDE 以加载更新后的插件。

## 支持

如果遇到问题，请在 GitHub 仓库创建 issue：
https://github.com/YeJianXin/plannotator/issues

## 许可证

MIT OR Apache-2.0
