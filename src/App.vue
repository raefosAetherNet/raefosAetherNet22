<script setup lang="ts">
import { Authenticator } from '@aws-amplify/ui-vue';
import '@aws-amplify/ui-vue/styles.css';
import AetherNetDashboard from './components/AetherNetDashboard.vue';
</script>

<template>
  <Authenticator :hide-sign-up="false">
    <template #default="{ user }">
      <!-- user is authenticated — show the main app -->
      <AetherNetDashboard v-if="user" />
    </template>

    <!-- Custom header shown on the login page above the Cognito form -->
    <template #header>
      <div class="auth-header">
        <span class="auth-logo">✦</span>
        <h1 class="auth-title">raefos<span class="auth-colon">:</span>AetherNet</h1>
        <p class="auth-subtitle">Social networking &amp; collaborative archiving, powered by AI.</p>
      </div>
    </template>

    <!-- Custom footer -->
    <template #footer>
      <p class="auth-footer-text">
        By signing in you join the shared AetherNet community where our AI agent learns from
        your contributions.
      </p>
    </template>
  </Authenticator>
</template>

<style>
/* ─── AetherNet design tokens ────────────────────────────────────────── */
:root {
  --color-bg: #0d0f17;
  --color-header: #111320;
  --color-card: #161b2e;
  --color-border: rgba(255,255,255,0.1);
  --color-input: #1e2438;
  --color-text: #e8eaf0;
  --color-muted: #7a82a0;
  --color-accent: #6366f1;
  --color-ai-badge: #6366f1;
  --color-tag-bg: rgba(99,102,241,0.15);

  /* Override Amplify Authenticator colours to match dark theme */
  --amplify-colors-background-primary: #0d0f17;
  --amplify-colors-background-secondary: #161b2e;
  --amplify-colors-border-primary: rgba(255,255,255,0.12);
  --amplify-colors-font-primary: #e8eaf0;
  --amplify-colors-font-secondary: #7a82a0;
  --amplify-colors-brand-primary-10: #1e2451;
  --amplify-colors-brand-primary-20: #2a316e;
  --amplify-colors-brand-primary-40: #3d47a0;
  --amplify-colors-brand-primary-60: #5256c8;
  --amplify-colors-brand-primary-80: #6366f1;
  --amplify-colors-brand-primary-90: #818cf8;
  --amplify-colors-brand-primary-100: #a5b4fc;
}

* { box-sizing: border-box; }
body { margin: 0; background: var(--color-bg); color: var(--color-text); font-family: Inter, system-ui, sans-serif; }

/* ─── Cognito login page branding ───────────────────────────────────── */
.auth-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem 0.5rem;
  text-align: center;
}
.auth-logo { font-size: 2.5rem; color: var(--color-accent); line-height: 1; }
.auth-title { margin: 0.25rem 0 0.5rem; font-size: 1.8rem; font-weight: 700; color: var(--color-text); }
.auth-colon { color: var(--color-accent); }
.auth-subtitle { margin: 0; color: var(--color-muted); font-size: 0.95rem; }
.auth-footer-text {
  text-align: center;
  font-size: 0.78rem;
  color: var(--color-muted);
  padding: 0.75rem 1.5rem 1.5rem;
  max-width: 340px;
  margin: 0 auto;
}

/* ─── Global button style ────────────────────────────────────────────── */
.btn-primary {
  background: var(--color-accent);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.55rem 1.25rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}
.btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
.btn-primary:not(:disabled):hover { opacity: 0.88; }
</style>

