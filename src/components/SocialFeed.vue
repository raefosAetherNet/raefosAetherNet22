<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { generateClient } from 'aws-amplify/data';
import { getCurrentUser } from 'aws-amplify/auth';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

const posts = ref<Array<Schema['Post']['type']>>([]);
const newPostContent = ref('');
const newPostTags = ref('');
const loading = ref(false);
const currentUserId = ref('');
const currentUserName = ref('');

async function loadCurrentUser() {
  const user = await getCurrentUser();
  currentUserId.value = user.userId;
  currentUserName.value = user.username;
}

function loadPosts() {
  client.models.Post.observeQuery().subscribe({
    next: ({ items }) => {
      posts.value = [...items].sort(
        (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
      );
    },
  });
}

async function createPost() {
  if (!newPostContent.value.trim()) return;
  loading.value = true;
  try {
    await client.models.Post.create({
      content: newPostContent.value.trim(),
      authorId: currentUserId.value,
      authorName: currentUserName.value,
      tags: newPostTags.value
        ? newPostTags.value.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
      isAiGenerated: false,
    });
    newPostContent.value = '';
    newPostTags.value = '';
  } finally {
    loading.value = false;
  }
}

async function likePost(post: Schema['Post']['type']) {
  await client.models.Post.update({
    id: post.id,
    likesCount: (post.likesCount ?? 0) + 1,
  });
}

function formatDate(iso?: string | null) {
  if (!iso) return '';
  return new Date(iso).toLocaleString();
}

onMounted(async () => {
  await loadCurrentUser();
  loadPosts();
});
</script>

<template>
  <section class="social-feed">
    <h2>🌐 Social Feed</h2>

    <!-- New Post Form -->
    <div class="post-form card">
      <textarea
        v-model="newPostContent"
        placeholder="What's on your mind? Share with the AetherNet community…"
        rows="3"
      />
      <input
        v-model="newPostTags"
        type="text"
        placeholder="Tags (comma-separated)"
        class="tags-input"
      />
      <button :disabled="loading || !newPostContent.trim()" @click="createPost" class="btn-primary">
        {{ loading ? 'Posting…' : 'Post' }}
      </button>
    </div>

    <!-- Feed -->
    <div v-if="posts.length === 0" class="empty-state">
      No posts yet — be the first to share something!
    </div>

    <article v-for="post in posts" :key="post.id" class="post-card card">
      <div class="post-header">
        <span class="post-author">{{ post.authorName || 'Anonymous' }}</span>
        <span v-if="post.isAiGenerated" class="ai-badge">🤖 AI</span>
        <span class="post-date">{{ formatDate(post.createdAt) }}</span>
      </div>
      <p class="post-content">{{ post.content }}</p>
      <div class="post-tags" v-if="post.tags && post.tags.length">
        <span v-for="tag in post.tags" :key="tag ?? undefined" class="tag">#{{ tag }}</span>
      </div>
      <div class="post-actions">
        <button class="btn-like" @click="likePost(post)">
          ❤️ {{ post.likesCount ?? 0 }}
        </button>
      </div>
    </article>
  </section>
</template>

<style scoped>
.social-feed { display: flex; flex-direction: column; gap: 1rem; }
.card { background: var(--color-card); border-radius: 12px; padding: 1.25rem; box-shadow: 0 2px 12px rgba(0,0,0,0.18); }
.post-form { display: flex; flex-direction: column; gap: 0.5rem; }
.post-form textarea { resize: vertical; border-radius: 8px; border: 1px solid var(--color-border); padding: 0.75rem; background: var(--color-input); color: var(--color-text); font-size: 0.95rem; }
.tags-input { border-radius: 8px; border: 1px solid var(--color-border); padding: 0.5rem 0.75rem; background: var(--color-input); color: var(--color-text); }
.post-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
.post-author { font-weight: 600; color: var(--color-accent); }
.post-date { margin-left: auto; font-size: 0.78rem; color: var(--color-muted); }
.ai-badge { background: var(--color-ai-badge); color: #fff; border-radius: 20px; padding: 0.1rem 0.5rem; font-size: 0.75rem; }
.post-content { margin: 0 0 0.5rem; line-height: 1.6; }
.post-tags { display: flex; flex-wrap: wrap; gap: 0.35rem; margin-bottom: 0.5rem; }
.tag { background: var(--color-tag-bg); color: var(--color-accent); padding: 0.15rem 0.5rem; border-radius: 20px; font-size: 0.78rem; }
.post-actions { display: flex; gap: 0.75rem; }
.btn-like { background: none; border: 1px solid var(--color-border); border-radius: 20px; padding: 0.3rem 0.9rem; cursor: pointer; color: var(--color-text); transition: background 0.2s; }
.btn-like:hover { background: rgba(255,80,80,0.12); }
.empty-state { text-align: center; color: var(--color-muted); padding: 2rem 0; }
</style>
