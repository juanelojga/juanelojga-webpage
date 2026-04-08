Show the current development workflow status.

1. Read `.claude/workflow-state.json`
2. Display a checklist of all 7 stages with their status:
   - ✅ Completed (with timestamp if available from history)
   - 🔄 Current (highlight this one)
   - ⬚ Pending
3. Show the current stage name and what is expected to complete it.
4. If the workflow hasn't been initialized yet, inform the user to run `/project:new-feature` to start.

Stage sequence:

1. Story Expansion — Break ticket into sub-tasks
2. Plan Approval — Present implementation plan
3. TDD — Write failing tests first
4. Code Generation — Implement to make tests pass
5. Verification — Run tests, all must pass
6. Code Review — Self-review for quality
7. Final Ship — Summarize and confirm ready to merge
