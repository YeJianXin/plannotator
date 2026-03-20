#!/bin/bash

# Plannotator Qoder IDE 一键安装脚本
# 版本: 0.1.0
# 作者: Plannotator Team

set -e

echo "========================================"
echo "Plannotator Qoder IDE 一键安装脚本"
echo "========================================"

# 检查必要的依赖
echo "检查系统依赖..."

# 检查并安装 Bun
BUN_PATH="$HOME/.bun/bin/bun"
if ! command -v bun &> /dev/null; then
    if [[ -f "$BUN_PATH" ]]; then
        echo "Bun 已安装但不在 PATH 中，正在添加..."
        export PATH="$HOME/.bun/bin:$PATH"
    else
        echo "Bun 未安装，正在安装..."
        if [[ "$(uname)" == "Darwin" ]]; then
            # macOS
            curl -fsSL https://bun.sh/install | bash
        elif [[ "$(uname)" == "Linux" ]]; then
            # Linux
            curl -fsSL https://bun.sh/install | bash
        elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
            # Windows
            powershell -c "irm https://bun.sh/install.ps1 | iex"
        else
            echo "错误: 不支持的操作系统"
            exit 1
        fi
        # 刷新环境变量
        if [[ -f "$HOME/.bashrc" ]]; then
            source "$HOME/.bashrc"
        elif [[ -f "$HOME/.zshrc" ]]; then
            source "$HOME/.zshrc"
        fi
        # 验证安装
        if ! command -v bun &> /dev/null; then
            echo "错误: Bun 安装失败"
            echo "请手动安装 Bun: https://bun.sh"
            exit 1
        fi
    fi
fi

# 检查 Git
if ! command -v git &> /dev/null; then
    echo "错误: Git 未安装"
    echo "请先安装 Git"
    exit 1
fi

# 检查 Node.js
if ! command -v npm &> /dev/null; then
    echo "错误: Node.js 未安装"
    echo "请先安装 Node.js"
    exit 1
fi

# 询问安装目录
read -p "请输入安装目录 [默认: ~/plannotator]: " INSTALL_DIR
INSTALL_DIR=${INSTALL_DIR:-$HOME/plannotator}

# 创建安装目录
echo "创建安装目录..."
mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

# 克隆仓库
echo "克隆 Plannotator 仓库..."
if [ -d ".git" ]; then
    echo "仓库已存在，更新代码..."
    git pull
else
    git clone https://github.com/YeJianXin/plannotator.git .
fi

# 安装依赖
echo "安装依赖..."
bun install

# 构建插件
echo "构建插件..."
bun run build:qoder

# 安装 Qoder IDE 插件
echo "安装 Qoder IDE 插件..."
cd "apps/qoder-ide-plugin"
npm install -g .

# 添加 Skill
echo "添加 Skill..."
QODER_SKILLS_DIR="$HOME/.qoder/skills"
mkdir -p "$QODER_SKILLS_DIR"
cp -r "$(pwd)/../../.agents/skills/plannotator" "$QODER_SKILLS_DIR/"

# 验证安装
echo "验证安装..."

# 检查插件是否安装成功
if npm list -g @plannotator/qoder-ide &> /dev/null; then
    echo "✅ 插件安装成功！"
else
    echo "❌ 插件安装失败！"
    exit 1
fi

# 检查 Skill 是否添加成功
if [ -d "$QODER_SKILLS_DIR/plannotator" ]; then
    echo "✅ Skill 添加成功！"
else
    echo "❌ Skill 添加失败！"
    exit 1
fi

echo "========================================"
echo "✅ 安装成功！"
echo "========================================"
echo "使用方法:"
echo "1. 启动 Qoder IDE"
echo "2. 在命令面板中使用:"
echo "   /plannotator-review   - 代码审查"
echo "   /plannotator-annotate <文件> - 注释 Markdown 文件"
echo "   /plannotator-last     - 注释最后一条消息"
echo "3. 配置 Qoder IDE (可选):"
echo "   在设置中添加: { \"plugins\": [\"@plannotator/qoder-ide\"] }"
