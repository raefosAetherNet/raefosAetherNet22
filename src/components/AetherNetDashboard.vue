<script setup lang="ts">
import { ref } from 'vue';
import { signOut } from 'aws-amplify/auth';
import SocialFeed from './SocialFeed.vue';
import ArchiveView from './ArchiveView.vue';
import AiAgentPanel from './AiAgentPanel.vue';

type Tab = 'social' | 'archive' | 'agent';

const activeTab = ref<Tab>('social');

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'social', label: 'Social', icon: '🌐' },
  { id: 'archive', label: 'Archive', icon: '🗄️' },
  { id: 'agent', label: 'AI Agent', icon: '🤖' },
];

async function handleSignOut() {
  await signOut();
}
</script>

<template>
  <div class="dashboard">
    <!-- Header -->
    <header class="dashboard-header">
      <div class="brand">
        <span class="brand-logo">✦</span>
        <span class="brand-name">raefos<span class="brand-colon">:</span>AetherNet</span>
      </div>
      <nav class="tab-nav">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="tab-btn"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          {{ tab.icon }} {{ tab.label }}
        </button>
      </nav>
      <button class="btn-signout" @click="handleSignOut">Sign out</button>
    </header>

    <!-- Content -->
    <main class="dashboard-content">
      <SocialFeed v-if="activeTab === 'social'" />
      <ArchiveView v-if="activeTab === 'archive'" />
      <AiAgentPanel v-if="activeTab === 'agent'" />
    </main>
  </div>
</template>

<style scoped>
.dashboard { display: flex; flex-direction: column; min-height: 100vh; }
.dashboard-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 0.75rem 2rem;
  background: var(--color-header);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 10;
  flex-wrap: wrap;
}
.brand { display: flex; align-items: center; gap: 0.4rem; font-size: 1.2rem; font-weight: 700; letter-spacing: 0.01em; white-space: nowrap; }
.brand-logo { color: var(--color-accent); font-size: 1.5rem; }
.brand-name { color: var(--color-text); }
.brand-colon { color: var(--color-accent); }
.tab-nav { display: flex; gap: 0.25rem; flex: 1; justify-content: center; flex-wrap: wrap; }
.tab-btn {
  background: none;
  border: none;
  color: var(--color-muted);
  font-size: 0.92rem;
  padding: 0.4rem 0.9rem;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.tab-btn:hover { background: rgba(255,255,255,0.07); color: var(--color-text); }
.tab-btn.active { background: var(--color-accent); color: #fff; font-weight: 600; }
.btn-signout {
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-muted);
  border-radius: 20px;
  padding: 0.35rem 0.9rem;
  cursor: pointer;
  font-size: 0.85rem;
  transition: color 0.15s, border-color 0.15s;
  white-space: nowrap;
}
.btn-signout:hover { color: var(--color-text); border-color: var(--color-text); }
.dashboard-content { flex: 1; max-width: 900px; margin: 0 auto; width: 100%; padding: 1.5rem 1rem; }
</style>
