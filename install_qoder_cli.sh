#!/bin/bash

# Plannotator Qoder CLI 一键安装脚本
# 版本: 0.1.0
# 作者: Plannotator Team

set -e

echo "========================================"
echo "Plannotator Qoder CLI 一键安装脚本"
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

# 检查 Qoder CLI
if ! command -v qodercli &> /dev/null; then
    echo "错误: Qoder CLI 未安装"
    echo "请先安装 Qoder CLI: https://qoder.com/cli"
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

# 添加到 Qoder CLI
echo "添加到 Qoder CLI..."
qodercli mcp add plannotator -- bun "$(pwd)/apps/qoder-plugin/dist/index.js"

# 验证安装
echo "验证安装..."
qodercli mcp list

# 测试命令
echo "测试命令..."
qodercli --help 2>/dev/null | grep -q "plannotator"

if [ $? -eq 0 ]; then
    echo "========================================"
    echo "✅ 安装成功！"
    echo "========================================"
    echo "使用方法:"
    echo "1. 启动 Qoder CLI: qodercli"
    echo "2. 使用命令:"
    echo "   /plannotator-review   - 代码审查"
    echo "   /plannotator-annotate <文件> - 注释 Markdown 文件"
    echo "   /plannotator-last     - 注释最后一条消息"
else
    echo "========================================"
    echo "❌ 安装失败！"
    echo "========================================"
    exit 1
fi
