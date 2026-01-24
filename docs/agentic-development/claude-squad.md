# Claude Squad

**Repository**: [github.com/smtg-ai/claude-squad](https://github.com/smtg-ai/claude-squad)
**License**: AGPL-3.0
**Status**: Active (5.4k+ stars, 370+ forks)

## Overview

Claude Squad is a terminal application that orchestrates multiple AI coding agents simultaneously. It enables developers to manage separate Claude Code, Aider, Codex, Gemini, and similar tools within isolated workspaces.

## Core Features

- **Concurrent Task Management**: Complete tasks in the background (including yolo / auto-accept mode)
- **Unified Control Panel**: Single interface for all agent instances
- **Change Review**: Verify changes before application
- **Independent Git Workspaces**: Eliminates merge conflicts via git worktrees

## Installation

### Via Homebrew
```bash
brew install claude-squad
ln -s "$(brew --prefix)/bin/claude-squad" "$(brew --prefix)/bin/cs"
```

### Manual Installation
```bash
curl -fsSL https://raw.githubusercontent.com/smtg-ai/claude-squad/main/install.sh | bash
```
Install location: `~/.local/bin`

### Dependencies
- tmux (terminal multiplexer)
- gh (GitHub CLI)

## Usage

```bash
cs [flags] [command]
```

**Flags:**
- `-y, --autoyes` - Experimental auto-acceptance mode
- `-p, --program` - Specify custom agent (e.g., `aider --model ollama_chat/gemma3:1b`)
- `-h, --help` - Display help information

**Commands:**
- `completion` - Shell autocompletion scripts
- `debug` - Configuration path details
- `reset` - Clear all stored instances
- `version` - Display application version

## Keyboard Shortcuts

### Session Management
| Key | Action |
|-----|--------|
| `n` | Create new session |
| `N` | Create session with prompt |
| `D` | Delete selected session |
| `↑/j`, `↓/k` | Navigate between sessions |

### Operations
| Key | Action |
|-----|--------|
| `↵/o` | Enter session for reprompting |
| `ctrl-q` | Exit current session |
| `s` | Commit and push to GitHub |
| `c` | Commit changes and pause |
| `r` | Resume paused session |
| `?` | Display help menu |

### Navigation
| Key | Action |
|-----|--------|
| `tab` | Toggle preview/diff views |
| `q` | Quit application |
| `shift-↓/↑` | Scroll diff content |

## Alternative Agent Configuration

**Codex:**
```bash
export OPENAI_API_KEY=<your_key>
cs -p "codex"
```

**Aider:**
```bash
cs -p "aider --model claude-3-5-sonnet"
```

**Gemini:**
```bash
cs -p "gemini"
```

## Technical Architecture

Three-layer system:
1. **tmux** - Manages isolated terminal sessions per agent
2. **Git worktrees** - Creates independent codebases per task
3. **TUI Interface** - Simplified navigation and control

## Use Case

Claude Squad is for **parallel human-supervised work** - running multiple agents on separate tasks in isolated git worktrees. It's NOT for agent-to-agent delegation or autonomous orchestration.

**Good for:**
- "I want 4 agents working on 4 different feature branches simultaneously"
- "Run tests in one agent while another refactors code"
- Reviewing each agent's work before merging

**Not designed for:**
- Claude delegating a subtask to Gemini
- Autonomous multi-model workflows
- Agent-to-agent context sharing

## Related Tools

- **cliagents** - HTTP server for programmatic CLI agent access (delegation-oriented)
- **Aider Architect Mode** - Multi-model within single tool (reasoning + editing)

---

*Last updated: 2025-12-23*
*Source: GitHub README and documentation*
