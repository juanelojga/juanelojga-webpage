Start a new gated development workflow for a feature or task.

The user's description of the feature/task follows this command: $ARGUMENTS

Follow these steps:

1. Initialize the workflow state by writing `.claude/workflow-state.json`:
   ```json
   {
     "stage": "story_expansion",
     "approved": false,
     "feature": "<feature description from arguments>",
     "started_at": "<current ISO timestamp>",
     "history": []
   }
   ```
2. Announce:
   ```
   ## Stage 1: Story Expansion — Starting now
   ```
3. Break down the described feature/task into concrete sub-tasks. For each sub-task include:
   - A short title
   - What it involves technically
   - Any dependencies on other sub-tasks
4. Present the sub-tasks as a numbered list.
5. Ask the user to approve the breakdown before proceeding.
6. Do NOT write any code or implementation plans yet — that comes in later stages.

Remember: You cannot skip stages. The hook system will block file writes until the TDD stage.
