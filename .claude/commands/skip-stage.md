Force-skip the current workflow stage (use with caution).

This is an escape hatch for when a stage genuinely doesn't apply (e.g., no tests needed for a docs-only change).

1. Read `.claude/workflow-state.json`
2. Warn the user: "⚠️ Skipping stage '[current stage]'. This bypasses the quality gate."
3. Ask for explicit confirmation before proceeding.
4. If confirmed:
   - Record the skip in history with reason "manually skipped" and timestamp
   - Advance to the next stage
   - Write updated state to `.claude/workflow-state.json`
   - Announce the new stage
5. If not confirmed, do nothing.
