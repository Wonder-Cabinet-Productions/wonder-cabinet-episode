# Agent Onboarding Checklist

Use this checklist whenever a new AI or human collaborator joins the `/Users/mriechers/Developer` workspace. It keeps every repository aligned with the workspace-wide commit conventions and ensures the automated guardrails are active.

**IMPORTANT**: All new agents MUST be registered with Agent Registrar before use.

## 1. Agent Registration (REQUIRED)

Before creating or using a new agent:

1. **Create agent definition file**:
   - For Claude Code: `.claude/agents/agent-name.md`
   - For Codex: `CODEX.md` or `.codex/agents/agent-name.md`
   - For other LLMs: Follow platform conventions

2. **Register with Agent Registrar**:
   ```bash
   # Invoke Agent Registrar to register new agent
   # Agent Registrar will:
   # - Validate agent definition
   # - Add to AGENT_REGISTRY.md
   # - Update COMMIT_CONVENTIONS.md
   # - Ensure cross-platform compatibility
   ```

3. **Verify registration**:
   - Check that agent appears in `conventions/AGENT_REGISTRY.md`
   - Check that agent appears in `conventions/COMMIT_CONVENTIONS.md`

**Exception**: Core agents (Main Assistant, code-reviewer, Human) do not require pre-registration.

**Grace Period**: During initial development, 5 commits allowed before registration required.

## 2. Required Reading

### Core Concepts (Read First)
- `/Users/mriechers/Developer/the-lodge/conventions/ORCHESTRATOR_AGENT_PRIMER.md` — **Start here.** How orchestrator/agent development works in this workspace

### Workspace Standards
- `/Users/mriechers/Developer/the-lodge/conventions/COMMIT_CONVENTIONS.md` — commit message format with `[Agent: <name>]` attribution (recommended for AI, optional for humans)
- `/Users/mriechers/Developer/the-lodge/conventions/AGENT_REGISTRY.md` — central registry of all workspace agents across all LLM platforms
- `/Users/mriechers/Developer/the-lodge/conventions/PLANNING_CONVENTIONS.md` — **planning folder structure, progress tracking, and session handoffs**
- `/Users/mriechers/Developer/the-lodge/conventions/NAMING_CONVENTIONS.md` — repository naming patterns (advisory, applied at natural transition points)
- `/Users/mriechers/Developer/the-lodge/conventions/FEEDBACK_LOOP_CONVENTION.md` — dual feedback system (user + agent) for iterative improvement

### Project Context
- Project-specific guides (`CLAUDE.md`, `CODEX.md`, `AGENTS.md`, etc.) — link back to conventions

## 3. Secrets Management (CRITICAL)

**Never store API keys or secrets in `.env` files or commit them to repositories.**

All secrets are stored in macOS Keychain with the naming convention `developer.workspace.<KEY_NAME>`.

### For Agents

When code requires an API key:

1. **Use the Keychain utility** (not dotenv):
   ```python
   import sys
   from pathlib import Path
   sys.path.insert(0, str(Path.home() / "Developer/the-lodge/scripts"))
   from keychain_secrets import get_secret

   API_KEY = get_secret("MY_API_KEY", required=True)
   ```

2. **Ask the user to add secrets manually**:
   ```bash
   security add-generic-password -a "$USER" -s "developer.workspace.MY_API_KEY" -w "secret-value" -U
   ```

3. **For MCP servers**, use placeholder syntax in the registry:
   ```json
   "env": { "MY_API_KEY": "${MY_API_KEY}" }
   ```

4. **Document requirements** in the project README or `requires_env` field

See `conventions/SECRETS_MANAGEMENT.md` for complete documentation.

### Current Workspace Secrets

| Key | Purpose |
|-----|---------|
| `AIRTABLE_API_KEY` | AirTable API access |
| `READWISE_TOKEN` | Readwise API access |
| `OPENROUTER_API_KEY` | OpenRouter LLM API |

## 4. Workspace Preparation
1. Clone or update the repositories listed in `the-lodge/config/forerunner_repos.json`.
2. For each repo, confirm `CLAUDE.md`, `CODEX.md`, and `AGENTS.md` include the **Git Commit Convention** block. These files are the primary entry points for Claude, Codex, DeepSeek, and other assistants.
3. Check that the top-level `README.md` contains a **Co-Authors** section using the template from the conventions document. Update any missing details (agent names, roles) for the project.

## 5. Creating New Repositories

When creating a new repository (from scratch, fork, or template):

1. **Follow naming conventions** — See `conventions/NAMING_CONVENTIONS.md`
   - Use scope prefixes where applicable: `mcp-`, `obsidian-`, `ha-`, `cli-`
   - Use hyphens, not underscores: `my-project` not `my_project`
   - Be descriptive: avoid generic names like `my-thing` or `test-project`

2. **Add to manifest** — Update `config/forerunner_repos.json` with:
   - `name`, `remote`, `branch`, `status`
   - `origin`: `original`, `fork-modified`, `fork-upstream`, or `reference`
   - `category`: functional grouping (e.g., `mcp-server`, `configuration`)
   - `group`: logical grouping if related to other repos (e.g., `home-automation`)

3. **Use template when applicable** — `project_template` provides standard structure:
   ```bash
   # Clone template and customize
   gh repo create my-new-project --template MarkOnFire/gai-project-template
   ```

4. **Document relationships** — If the new repo relates to existing repos:
   - Add `related_to` array in manifest
   - Add `derived_from` if created from a template
   - Add `supports` if it's a tool/server for other projects

## 6. Lodge Infrastructure

The Lodge system provides machine identification and repository tracking across multiple development machines. This enables cross-machine work attribution and activity tracking.

### Directory Structure

```
~/.lodge/
├── config.json          # Machine identification
└── active-repos.json    # Repository manifest for this machine
```

### Setup (Automatic via Bootstrap)

The Lodge infrastructure is automatically configured when running `forerunner_setup.sh`:

1. **Creates `~/.lodge/` directory** — Set up on first bootstrap run
2. **Generates machine config** — Uses hostname as default machine ID
3. **Scans repositories** — Discovers all git repos in ~/Developer
4. **Creates manifest** — Saves to `active-repos.json`

### config.json Format

```json
{
  "machine_id": "macbook-pro",
  "machine_name": "Mark's MacBook Pro"
}
```

The `machine_id` is used in git commit trailers to track which machine made each commit.

### active-repos.json Format

```json
{
  "machine": "macbook-pro",
  "updated": "2026-01-17T08:30:00Z",
  "repos": [
    {
      "name": "the-lodge",
      "path": "~/Developer/the-lodge",
      "remote": "git@github.com:MarkOnFire/the-lodge.git"
    },
    {
      "name": "ha-config",
      "path": "~/Developer/ha-config",
      "remote": "git@github.com:MarkOnFire/ha-config.git"
    }
  ]
}
```

### Manual Refresh

To manually update the repository manifest:

```bash
# Refresh manifest (scan ~/Developer for changes)
python3 ~/Developer/the-lodge/scripts/lodge_manifest.py refresh
```

This is useful after:
- Cloning new repositories
- Deleting repositories
- Moving to a new machine

### Commit Attribution

With Lodge infrastructure in place, commits include machine attribution via git trailers:

```
Fix bedroom light automation timing

Migrated presence detection to use new sensor naming convention.

Agent: The Drone
Machine: macbook-pro

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Three dimensions of attribution**:
- **Author** — From git config (user.name)
- **Agent** — From commit trailer (e.g., "The Drone")
- **Machine** — From commit trailer (from ~/.lodge/config.json)

This enables project indexes to show where work happened:
- "3 commits to ha-config yesterday on mac-mini by The Drone"
- "Last activity on macbook-pro 5 days ago"

### Git Hooks Integration

The shared git hooks automatically inject the `Machine:` trailer from `~/.lodge/config.json` into commits. See section 7 for git hook setup.

## 7. Enable Commit Hooks

### Automatic Setup (via Bootstrap)

Git hooks are automatically configured when running `forerunner_setup.sh --with-active-repos`:

1. **Scans all repositories** in ~/Developer
2. **Configures core.hooksPath** to point to `the-lodge/conventions/git-hooks/`
3. **Idempotent** — Safe to run multiple times

The shared git hooks:
- Validate commit message format
- Auto-inject `Machine:` trailer from `~/.lodge/config.json`
- Remind about `Agent:` attribution (informational only)

### Manual Configuration

If you need to configure hooks manually for a single repository:

```bash
# Run once per repository
cd /Users/mriechers/Developer/my-repo
git config core.hooksPath ~/Developer/the-lodge/conventions/git-hooks
```

Or for all repositories:

```bash
for repo_dir in ~/Developer/*; do
  if [ -d "$repo_dir/.git" ]; then
    git -C "$repo_dir" config core.hooksPath ~/Developer/the-lodge/conventions/git-hooks
  fi
done
```

The hook is informational only and does not block commits. It serves as a reminder for AI agents to include attribution.

## 8. Repository Checklist
- `README.md` — Includes **Co-Authors** section plus any project-specific agent notes.
- `CLAUDE.md` / `CODEX.md` / `AGENTS.md` — Reference the commit conventions explicitly so every assistant sees the requirement in situ.
- `.githooks/commit-msg` — Exists and is executable. Run `ls -l .githooks` inside the repo to confirm.
- `planning/` — (Required for ALL repos) Contains README.md, backlog.md, progress.md. See `conventions/PLANNING_CONVENTIONS.md`.
- `USER_FEEDBACK.md` / `AGENT-FEEDBACK.md` — (Recommended for active projects) Capture user and agent feedback for iterative improvement. See `conventions/FEEDBACK_LOOP_CONVENTION.md`.
- Optional templates — Files under `templates/genai-project/` include the Co-Authors section so new repos inherit the pattern automatically.

## 9. Ongoing Maintenance
- Update `the-lodge/conventions/COMMIT_CONVENTIONS.md` and `the-lodge/conventions/git-hooks/commit-msg` together when conventions change.
- When introducing a new specialist agent, **invoke Agent Registrar** to handle registration automatically.
- Agent Registrar will update `AGENT_REGISTRY.md`, `COMMIT_CONVENTIONS.md`, and relevant project `AGENTS.md` files.
- Periodically run `git status` in each repo to ensure `.githooks` remains tracked and executable, especially after transferring the workspace to a new machine.
- **Weekly**: Agent Registrar automatically scans for unregistered agents
- **Monthly**: Agent Registrar conducts comprehensive agent ecosystem audit

## 10. Multi-LLM Support

This workspace supports agents from multiple LLM platforms:
- **Claude Code** (Anthropic) - Primary platform
- **Codex** (OpenAI) - Alternative platform
- **DeepSeek** - Alternative platform
- **Cursor, GitHub Copilot** - IDE-integrated platforms
- **Others** - Any AI assistant can participate

All agents, regardless of platform, must:
1. Be registered with Agent Registrar
2. Follow commit attribution conventions (AI agents only)
3. Use consistent agent names across platforms

## 11. Planning and Session Protocols

Follow the **Planning Conventions** defined in `conventions/PLANNING_CONVENTIONS.md`.

### Two Work Modes

Both modes support orchestrator/agent collaboration:

1. **Project Sprints** — Scoped work: design doc → feature list → orchestrator assigns tasks top-to-bottom → archive when done
2. **Ongoing Maintenance** — Rolling backlog: orchestrator assigns OR agents self-select → backlog persists (not archived)

### Repository Setup (ALL repos)

Create the planning folder structure:

```bash
mkdir -p planning/sprints/current planning/sprints/archive planning/archive
```

Initialize required files:
- `planning/README.md` — Current state summary
- `planning/backlog.md` — Maintenance items (rolling)
- `planning/progress.md` — Session-by-session log

For sprints, add to `planning/sprints/current/`:
- `design.md` — Design document
- `features.json` — Feature list with completion flags

### Session Start Protocol

Every agent session should begin by:

1. **Read `planning/README.md`** — understand current state
2. **Check for BOTH work modes**:
   - Sprint: `planning/sprints/current/features.json` (if exists)
   - Maintenance: `planning/backlog.md`
3. **Read `planning/progress.md`** (last 2-3 entries) — recent context
4. **Run `planning/init.sh`** (if exists) — verify environment
5. **Check git status** — ensure clean starting state

### Session End Protocol

Before ending a session:

1. **Commit all changes** with agent attribution
2. **Update tracking files**:
   - Sprint: Update `sprints/current/features.json` (passes, blockers)
   - Maintenance: Update `backlog.md` (check off items)
3. **Append entry to `planning/progress.md`**:
   - Mode (Sprint / Maintenance / Both)
   - What was accomplished
   - Decisions made (with rationale)
   - What next session should do
   - Files changed
4. **Update `planning/README.md`** — current state and last session info

### Archiving Sprints

When all sprint features pass:
1. Update `features.json` status to `"complete"`
2. Add completion note to `design.md`
3. Move `sprints/current/` contents to `sprints/archive/YYYY-MM-sprintname/`
4. Update `planning/README.md`

By following this checklist, every LLM assistant in the workspace inherits the same commit discipline and documentation pointers, making cross-agent collaboration auditable and consistent.
