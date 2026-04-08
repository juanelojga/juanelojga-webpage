const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, '..', 'workflow-state.json');

const STAGES = [
  'story_expansion',
  'plan_approval',
  'tdd',
  'code_generation',
  'verification',
  'code_review',
  'ship',
];

const STAGE_LABELS = {
  story_expansion: 'Story Expansion',
  plan_approval: 'Plan Approval',
  tdd: 'TDD (Write Tests First)',
  code_generation: 'Code Generation',
  verification: 'Verification',
  code_review: 'Code Review',
  ship: 'Final Ship',
};

function getState() {
  if (!fs.existsSync(STATE_FILE)) {
    return { stage: 'story_expansion', approved: false, history: [] };
  }
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch {
    return { stage: 'story_expansion', approved: false, history: [] };
  }
}

function getStageIndex(stage) {
  return STAGES.indexOf(stage);
}

const [, , event] = process.argv;
const state = getState();
const currentIndex = getStageIndex(state.stage);

if (event === 'pre_write') {
  // Only allow file writes during TDD, code generation, and code review stages
  const allowedWriteStages = ['tdd', 'code_generation', 'code_review'];

  if (!allowedWriteStages.includes(state.stage)) {
    const currentLabel = STAGE_LABELS[state.stage] || state.stage;
    const nextAllowed = STAGES.filter(s => allowedWriteStages.includes(s))
      .map(s => STAGE_LABELS[s])
      .join(', ');

    console.error(
      `\n[GATE BLOCKED] Cannot write/edit files at stage: "${currentLabel}" (${currentIndex + 1}/${STAGES.length}).\n` +
        `File writes are only allowed during: ${nextAllowed}.\n` +
        `Use /project:next-stage to advance after completing the current stage.\n` +
        `Use /project:workflow-status to see full workflow state.\n`
    );
    process.exit(1);
  }
}

if (event === 'post_bash') {
  if (state.stage === 'verification') {
    // Read stdin for tool result context if available
    console.log(
      '[GATE] Verification stage active — ensure ALL tests pass before advancing to code review.'
    );
    console.log('[GATE] If tests fail, fix them before using /project:next-stage.');
  }
}

if (event === 'pre_bash') {
  // During TDD stage, warn if running implementation-related commands
  if (state.stage === 'tdd') {
    console.log(
      '[GATE REMINDER] TDD stage — you should only be writing failing tests, not implementation code.'
    );
  }
}
