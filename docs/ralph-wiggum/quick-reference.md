# Ralph Wiggum Quick Reference

> Iterative, self-referential AI development loops for Claude Code

## TL;DR

Ralph is a **Stop hook** that intercepts exit attempts and re-feeds the same prompt, creating an autonomous iteration loop until a completion condition is met.

## Commands

| Command | Purpose |
|---------|---------|
| `/ralph-loop "<prompt>" --completion-promise "DONE" --max-iterations 50` | Start a loop |
| `/cancel-ralph` | Stop the active loop |

## Required Parameters

- **`--max-iterations <n>`** - Safety limit (always set this!)
- **`--completion-promise "<text>"`** - Exact string that signals completion

## How It Works

```
1. You run /ralph-loop once
2. Claude works on task
3. Claude tries to exit
4. Stop hook blocks exit, re-feeds prompt
5. Claude sees its previous work in files/git
6. Repeat until completion promise or max iterations
```

## Good Prompt Template

```markdown
[Task description with clear requirements]

When complete:
- [ ] Requirement 1 verified
- [ ] Requirement 2 verified
- [ ] Tests passing
- Output: <promise>COMPLETE</promise>

If stuck after 15 iterations:
- Document blockers
- List attempted approaches
- Suggest alternatives
```

## When to Use

| ✅ Good For | ❌ Not Good For |
|------------|----------------|
| Well-defined tasks | Human judgment needed |
| Auto-verifiable (tests, linters) | Unclear success criteria |
| Greenfield projects | Production debugging |
| Iteration-heavy work | One-shot operations |

## Example

```bash
/ralph-loop "Build a REST API for todos. Requirements: CRUD operations, input validation, tests passing. Output <promise>COMPLETE</promise> when done." --completion-promise "COMPLETE" --max-iterations 50
```

## Key Principles

1. **Iteration > Perfection** - Let the loop refine work
2. **Failures Are Data** - Use them to improve prompts
3. **Always Set Limits** - `--max-iterations` prevents runaway loops
4. **Clear Criteria** - Vague prompts = infinite loops

## Learn More

- Full docs: `read_documentation("ralph-wiggum", "plugin-readme")`
- Original technique: https://ghuntley.com/ralph/
