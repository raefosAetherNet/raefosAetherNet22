<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { generateClient } from 'aws-amplify/data';
import { getCurrentUser } from 'aws-amplify/auth';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

const agentLogs = ref<Array<Schema['AiAgentLog']['type']>>([]);
const agentThought = ref('');
const agentRunning = ref(false);
const agentStatus = ref('Idle');
const currentUserName = ref('');

// A simulated AI agent that "observes" recent posts and archives, then logs its actions.
// In a real deployment this would call a backend Lambda / Bedrock agent via API.
const AGENT_ACTIONS = [
  'Curated trending posts into a new archive',
  'Generated a social post summarising recent community activity',
  'Annotated archive items with contextual AI notes',
  'Discovered and linked related archive items',
  'Learned from 10 new community posts',
  'Suggested new tags for recent content',
  'Highlighted collaborative archiving opportunities',
];

async function loadCurrentUser() {
  const user = await getCurrentUser();
  currentUserName.value = user.username;
}

function loadLogs() {
  client.models.AiAgentLog.observeQuery().subscribe({
    next: ({ items }) => {
      agentLogs.value = [...items].sort(
        (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
      );
    },
  });
}

async function runAgentCycle() {
  agentRunning.value = true;
  agentStatus.value = 'Analysing community content…';
  agentThought.value = '';

  const steps = [
    'Scanning recent posts and archive activity…',
    'Identifying patterns and learning opportunities…',
    'Generating action plan…',
    'Executing actions…',
    'Logging results…',
  ];

  for (const step of steps) {
    agentStatus.value = step;
    agentThought.value += `• ${step}\n`;
    await delay(600);
  }

  const action = AGENT_ACTIONS[Math.floor(Math.random() * AGENT_ACTIONS.length)];
  const targetTypes = ['post', 'comment', 'archive', 'archiveItem'] as const;
  const targetType = targetTypes[Math.floor(Math.random() * targetTypes.length)];

  await client.models.AiAgentLog.create({
    action,
    targetType,
    summary: `Agent cycle completed at ${new Date().toLocaleTimeString()} — ${action.toLowerCase()}.`,
    learnedFrom: `Community activity observed by ${currentUserName.value || 'the AetherNet agent'}`,
  });

  agentStatus.value = 'Idle — cycle complete ✅';
  agentRunning.value = false;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatDate(iso?: string | null) {
  if (!iso) return '';
  return new Date(iso).toLocaleString();
}

const TARGET_ICONS: Record<string, string> = {
  post: '📢',
  comment: '💬',
  archive: '🗄️',
  archiveItem: '📌',
};

onMounted(async () => {
  await loadCurrentUser();
  loadLogs();
});
</script>

<template>
  <section class="ai-agent-panel">
    <h2>🤖 AI Agent — raefos:AetherNet</h2>
    <p class="agent-desc">
      This autonomous agent monitors the shared AetherNet account, learns from social posts and
      collaborative archives, and periodically curates content, generates insights, and enriches
      the community's knowledge base.
    </p>

    <!-- Control Panel -->
    <div class="control-card card">
      <div class="status-row">
        <span class="status-dot" :class="agentRunning ? 'running' : 'idle'" />
        <strong>Status:</strong>&nbsp;{{ agentStatus }}
      </div>

      <pre v-if="agentThought" class="agent-thought">{{ agentThought }}</pre>

      <button
        class="btn-primary run-btn"
        :disabled="agentRunning"
        @click="runAgentCycle"
      >
        {{ agentRunning ? '⏳ Running…' : '▶ Run Agent Cycle' }}
      </button>
    </div>

    <!-- Activity Log -->
    <h3>Activity Log</h3>

    <div v-if="agentLogs.length === 0" class="empty-state">
      No agent activity yet. Run a cycle to get started!
    </div>

    <article v-for="log in agentLogs" :key="log.id" class="log-card card">
      <div class="log-header">
        <span class="log-icon">{{ TARGET_ICONS[log.targetType ?? 'post'] ?? '🤖' }}</span>
        <span class="log-action">{{ log.action }}</span>
        <span class="log-date">{{ formatDate(log.createdAt) }}</span>
      </div>
      <p v-if="log.summary" class="log-summary">{{ log.summary }}</p>
      <p v-if="log.learnedFrom" class="log-learned">
        <em>Learned from:</em> {{ log.learnedFrom }}
      </p>
    </article>
  </section>
</template>

<style scoped>
.ai-agent-panel { display: flex; flex-direction: column; gap: 1rem; }
.agent-desc { color: var(--color-muted); line-height: 1.6; margin-top: -0.5rem; }
.card { background: var(--color-card); border-radius: 12px; padding: 1.25rem; box-shadow: 0 2px 12px rgba(0,0,0,0.18); }
.control-card { display: flex; flex-direction: column; gap: 0.85rem; }
.status-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.95rem; }
.status-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
.status-dot.idle { background: #6ee7b7; }
.status-dot.running { background: #f59e0b; animation: pulse 0.8s infinite alternate; }
@keyframes pulse { from { opacity: 1; } to { opacity: 0.3; } }
.agent-thought { background: rgba(0,0,0,0.25); border-radius: 8px; padding: 0.75rem 1rem; font-size: 0.85rem; white-space: pre-wrap; color: #a5f3fc; }
.run-btn { align-self: flex-start; }
.log-card { display: flex; flex-direction: column; gap: 0.4rem; }
.log-header { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.log-icon { font-size: 1.15rem; }
.log-action { font-weight: 600; flex: 1; }
.log-date { font-size: 0.78rem; color: var(--color-muted); margin-left: auto; }
.log-summary { margin: 0; font-size: 0.9rem; color: var(--color-text); }
.log-learned { margin: 0; font-size: 0.82rem; color: var(--color-muted); }
.empty-state { text-align: center; color: var(--color-muted); padding: 2rem 0; }
</style>
