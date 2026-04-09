# Gated Development Workflow

A hook-enforced workflow that prevents Claude Code from skipping development stages. File writes are physically blocked until the appropriate stage is reached.

## Quick Start

```bash
# Start a new feature workflow
/project:new-feature "Add user avatar upload"

# Check where you are
/project:workflow-status

# Advance to the next stage
/project:next-stage

# Skip a stage (escape hatch, requires confirmation)
/project:skip-stage

# Start over
/project:reset-workflow
```

## Stages

The workflow enforces 7 sequential stages. You cannot skip ahead.

| #   | Stage               | What Happens                                             | File Writes Allowed |
| --- | ------------------- | -------------------------------------------------------- | ------------------- |
| 1   | **Story Expansion** | Break the ticket into sub-tasks. Wait for user approval. | No                  |
| 2   | **Plan Approval**   | Present an implementation plan. Wait for user approval.  | No                  |
| 3   | **TDD**             | Write failing tests first. No implementation code yet.   | Yes (tests only)    |
| 4   | **Code Generation** | Write implementation code to make tests pass.            | Yes                 |
| 5   | **Verification**    | Run tests. All must pass before advancing.               | No                  |
| 6   | **Code Review**     | Self-review: edge cases, naming, complexity, security.   | Yes (fixes only)    |
| 7   | **Final Ship**      | Summarize changes and confirm ready to merge.            | No                  |

## Example Session

```
You:     /project:new-feature "Add dark mode toggle to navbar"

Claude:  ## Stage 1: Story Expansion — Starting now
         Sub-tasks:
         1. Add theme state management (localStorage + system preference)
         2. Create toggle button component
         3. Wire up CSS custom properties for theme switching
         4. Update navbar to include toggle
         Awaiting your approval.

You:     looks good

You:     /project:next-stage

Claude:  ## Stage 2: Plan Approval — Starting now
         Implementation plan:
         - Create ThemeToggle.tsx React component...
         - Add CSS variables to global.css...

You:     approved, go ahead

You:     /project:next-stage

Claude:  ## Stage 3: TDD — Starting now
         Writing failing tests first...
         [creates test files — hook allows writes at this stage]

You:     /project:next-stage

Claude:  ## Stage 4: Code Generation — Starting now
         Implementing to make tests pass...
         [creates implementation files]

You:     /project:next-stage

Claude:  ## Stage 5: Verification — Starting now
         Running tests...
         [runs pnpm test, all pass]

You:     /project:next-stage

Claude:  ## Stage 6: Code Review — Starting now
         Self-review findings:
         - Edge case: system preference change while tab is inactive — handled
         - Naming: consistent use of "theme" not "mode" — good
         - No security concerns

You:     /project:next-stage

Claude:  ## Stage 7: Final Ship — Starting now
         Summary of all changes...
         Ready to merge.
```

## How the Gate Works

The hook at `.claude/hooks/enforce-gate.cjs` runs before every `Write` and `Edit` tool call. It reads the current stage from `.claude/workflow-state.json` and:

- **Allows** the write if the stage is `tdd`, `code_generation`, or `code_review`
- **Blocks** the write (exit code 1) at all other stages, printing which stage you are on and how to advance

This means Claude physically cannot write code during planning stages or after verification, regardless of what it is asked to do.

## State File

The workflow state is stored in `.claude/workflow-state.json`:

```json
{
  "stage": "tdd",
  "approved": false,
  "feature": "Add dark mode toggle to navbar",
  "started_at": "2026-04-08T15:30:00.000Z",
  "history": [
    {
      "stage": "story_expansion",
      "completed_at": "2026-04-08T15:31:00.000Z"
    },
    {
      "stage": "plan_approval",
      "completed_at": "2026-04-08T15:33:00.000Z"
    }
  ]
}
```

This file is created by `/project:new-feature` and updated by `/project:next-stage`. Delete it or run `/project:reset-workflow` to start fresh.

## File Structure

```
.claude/
├── commands/
│   ├── new-feature.md      # Start a new workflow
│   ├── next-stage.md       # Advance to next stage
│   ├── workflow-status.md  # Show progress checklist
│   ├── skip-stage.md       # Force-skip (escape hatch)
│   └── reset-workflow.md   # Clear state
├── hooks/
│   └── enforce-gate.cjs    # PreToolUse hook that blocks writes
├── settings.local.json     # Hook configuration
└── workflow-state.json     # Current workflow state (auto-generated)
```

## Customization

### Changing allowed stages for writes

Edit `.claude/hooks/enforce-gate.cjs`, line with `allowedWriteStages`:

```js
const allowedWriteStages = ['tdd', 'code_generation', 'code_review'];
```

### Adding or removing stages

Edit the `STAGES` and `STAGE_LABELS` arrays in `enforce-gate.cjs`, then update the slash command files to match.

### Disabling the workflow temporarily

Remove or comment out the `hooks` section in `.claude/settings.local.json`. The slash commands will still work for tracking, but writes will no longer be blocked.
