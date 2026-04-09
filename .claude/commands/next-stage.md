Advance the development workflow to the next stage.

Follow these steps exactly:

1. Read `.claude/workflow-state.json` to get the current state.
2. Validate the current stage has been meaningfully completed:
   - **story_expansion**: Sub-tasks must have been listed and discussed. The user must have approved them.
   - **plan_approval**: An implementation plan must have been presented. The user must have approved it.
   - **tdd**: Failing test files must exist. Tests must fail (not pass — they have no implementation yet).
   - **code_generation**: Implementation code must exist. Do NOT check if tests pass yet — that's the next stage.
   - **verification**: All tests must pass. Run `pnpm test` (or the project's test command) to confirm.
   - **code_review**: A self-review must have been presented covering edge cases, naming, complexity, and security.
   - **ship**: This is the final stage — summarize all changes and confirm ready to merge.
3. If validation fails, explain what's missing and do NOT advance.
4. If validation passes:
   - Record the completed stage in the `history` array with a timestamp
   - Set the `stage` field to the next stage in the sequence
   - Write the updated state back to `.claude/workflow-state.json`
5. Announce the new stage with a clear header:
   ```
   ## Stage [N]: [Name] — Starting now
   ```
6. Briefly explain what this stage requires before proceeding.

The stage sequence is:

1. story_expansion
2. plan_approval
3. tdd
4. code_generation
5. verification
6. code_review
7. ship
