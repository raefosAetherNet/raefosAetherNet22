<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { generateClient } from 'aws-amplify/data';
import { getCurrentUser } from 'aws-amplify/auth';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

const archives = ref<Array<Schema['Archive']['type']>>([]);
const selectedArchive = ref<Schema['Archive']['type'] | null>(null);
const archiveItems = ref<Array<Schema['ArchiveItem']['type']>>([]);

const newArchiveTitle = ref('');
const newArchiveDesc = ref('');
const newArchiveTags = ref('');

const newItemTitle = ref('');
const newItemContent = ref('');
const newItemUrl = ref('');
const newItemType = ref<'link' | 'image' | 'text' | 'video'>('link');

const loading = ref(false);
const currentUserId = ref('');
const currentUserName = ref('');

async function loadCurrentUser() {
  const user = await getCurrentUser();
  currentUserId.value = user.userId;
  currentUserName.value = user.username;
}

function loadArchives() {
  client.models.Archive.observeQuery().subscribe({
    next: ({ items }) => {
      archives.value = [...items].sort(
        (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
      );
    },
  });
}

function loadArchiveItems(archiveId: string) {
  client.models.ArchiveItem.observeQuery({
    filter: { archiveId: { eq: archiveId } },
  }).subscribe({
    next: ({ items }) => {
      archiveItems.value = [...items].sort(
        (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
      );
    },
  });
}

function selectArchive(archive: Schema['Archive']['type']) {
  selectedArchive.value = archive;
  archiveItems.value = [];
  loadArchiveItems(archive.id);
}

async function createArchive() {
  if (!newArchiveTitle.value.trim()) return;
  loading.value = true;
  try {
    const created = await client.models.Archive.create({
      title: newArchiveTitle.value.trim(),
      description: newArchiveDesc.value.trim() || undefined,
      curatorId: currentUserId.value,
      curatorName: currentUserName.value,
      tags: newArchiveTags.value
        ? newArchiveTags.value.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
      isAiCurated: false,
    });
    newArchiveTitle.value = '';
    newArchiveDesc.value = '';
    newArchiveTags.value = '';
    if (created.data) selectArchive(created.data);
  } finally {
    loading.value = false;
  }
}

async function addArchiveItem() {
  if (!selectedArchive.value || !newItemTitle.value.trim()) return;
  loading.value = true;
  try {
    await client.models.ArchiveItem.create({
      archiveId: selectedArchive.value.id,
      title: newItemTitle.value.trim(),
      content: newItemContent.value.trim() || undefined,
      sourceUrl: newItemUrl.value.trim() || undefined,
      itemType: newItemType.value,
      contributorId: currentUserId.value,
      contributorName: currentUserName.value,
    });
    newItemTitle.value = '';
    newItemContent.value = '';
    newItemUrl.value = '';
    newItemType.value = 'link';
  } finally {
    loading.value = false;
  }
}

function formatDate(iso?: string | null) {
  if (!iso) return '';
  return new Date(iso).toLocaleString();
}

onMounted(async () => {
  await loadCurrentUser();
  loadArchives();
});
</script>

<template>
  <section class="archive-view">
    <h2>🗄️ Collaborative Archive</h2>

    <div class="archive-layout">
      <!-- Sidebar: archive list -->
      <aside class="archive-sidebar">
        <div class="new-archive card">
          <h3>New Archive</h3>
          <input v-model="newArchiveTitle" placeholder="Archive title" />
          <input v-model="newArchiveDesc" placeholder="Description (optional)" />
          <input v-model="newArchiveTags" placeholder="Tags (comma-separated)" />
          <button :disabled="loading || !newArchiveTitle.trim()" @click="createArchive" class="btn-primary">
            {{ loading ? 'Creating…' : '+ Create' }}
          </button>
        </div>

        <div class="archive-list">
          <div
            v-for="archive in archives"
            :key="archive.id"
            class="archive-item card"
            :class="{ active: selectedArchive?.id === archive.id }"
            @click="selectArchive(archive)"
          >
            <div class="archive-item-header">
              <span class="archive-title">{{ archive.title }}</span>
              <span v-if="archive.isAiCurated" class="ai-badge">🤖</span>
            </div>
            <p v-if="archive.description" class="archive-desc">{{ archive.description }}</p>
            <div class="post-tags" v-if="archive.tags && archive.tags.length">
            <span v-for="tag in archive.tags" :key="tag ?? undefined" class="tag">#{{ tag }}</span>
            </div>
            <small class="curator">by {{ archive.curatorName || 'Anonymous' }}</small>
          </div>
          <p v-if="archives.length === 0" class="empty-state">No archives yet. Create one!</p>
        </div>
      </aside>

      <!-- Main: items in selected archive -->
      <main class="archive-main">
        <template v-if="selectedArchive">
          <h3>{{ selectedArchive.title }}</h3>

          <div class="add-item-form card">
            <h4>Add Item</h4>
            <input v-model="newItemTitle" placeholder="Item title" />
            <select v-model="newItemType">
              <option value="link">🔗 Link</option>
              <option value="text">📝 Text</option>
              <option value="image">🖼️ Image URL</option>
              <option value="video">🎬 Video</option>
            </select>
            <input v-if="newItemType !== 'text'" v-model="newItemUrl" placeholder="URL" />
            <textarea v-model="newItemContent" placeholder="Notes or content" rows="2" />
            <button :disabled="loading || !newItemTitle.trim()" @click="addArchiveItem" class="btn-primary">
              {{ loading ? 'Adding…' : '+ Add Item' }}
            </button>
          </div>

          <div v-if="archiveItems.length === 0" class="empty-state">
            No items yet. Start adding content to this archive!
          </div>

          <article v-for="item in archiveItems" :key="item.id" class="item-card card">
            <div class="item-header">
              <span class="item-type-badge">{{ ({ link: '🔗', text: '📝', image: '🖼️', video: '🎬' } as Record<string, string>)[item.itemType ?? 'link'] ?? '📌' }}</span>
              <span class="item-title">{{ item.title }}</span>
              <span class="item-contributor">by {{ item.contributorName || 'Anonymous' }}</span>
              <span class="item-date">{{ formatDate(item.createdAt) }}</span>
            </div>
            <a v-if="item.sourceUrl" :href="item.sourceUrl" target="_blank" rel="noopener" class="item-url">
              {{ item.sourceUrl }}
            </a>
            <p v-if="item.content" class="item-content">{{ item.content }}</p>
            <div v-if="item.aiNotes" class="ai-notes">
              <span class="ai-badge">🤖 AI Notes</span> {{ item.aiNotes }}
            </div>
          </article>
        </template>

        <div v-else class="empty-state select-prompt">
          ← Select an archive or create a new one to get started.
        </div>
      </main>
    </div>
  </section>
</template>

<style scoped>
.archive-view { display: flex; flex-direction: column; gap: 1rem; }
.archive-layout { display: flex; gap: 1.25rem; align-items: flex-start; }
.archive-sidebar { width: 280px; flex-shrink: 0; display: flex; flex-direction: column; gap: 0.75rem; }
.archive-main { flex: 1; display: flex; flex-direction: column; gap: 1rem; }
.card { background: var(--color-card); border-radius: 12px; padding: 1.1rem; box-shadow: 0 2px 12px rgba(0,0,0,0.18); }
.new-archive { display: flex; flex-direction: column; gap: 0.4rem; }
.new-archive input { border-radius: 8px; border: 1px solid var(--color-border); padding: 0.45rem 0.75rem; background: var(--color-input); color: var(--color-text); font-size: 0.9rem; }
.archive-item { cursor: pointer; transition: background 0.15s; }
.archive-item.active { border: 2px solid var(--color-accent); }
.archive-item-header { display: flex; align-items: center; gap: 0.5rem; }
.archive-title { font-weight: 600; }
.archive-desc { font-size: 0.85rem; color: var(--color-muted); margin: 0.25rem 0; }
.curator { color: var(--color-muted); font-size: 0.78rem; }
.add-item-form { display: flex; flex-direction: column; gap: 0.4rem; }
.add-item-form input, .add-item-form select, .add-item-form textarea { border-radius: 8px; border: 1px solid var(--color-border); padding: 0.45rem 0.75rem; background: var(--color-input); color: var(--color-text); font-size: 0.9rem; }
.item-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.4rem; flex-wrap: wrap; }
.item-title { font-weight: 600; }
.item-type-badge { font-size: 1.1rem; }
.item-contributor { color: var(--color-muted); font-size: 0.82rem; }
.item-date { margin-left: auto; font-size: 0.78rem; color: var(--color-muted); }
.item-url { display: block; color: var(--color-accent); word-break: break-all; font-size: 0.85rem; margin-bottom: 0.3rem; }
.item-content { margin: 0; font-size: 0.92rem; line-height: 1.5; }
.ai-notes { background: rgba(99,102,241,0.12); border-left: 3px solid var(--color-accent); padding: 0.4rem 0.75rem; border-radius: 0 8px 8px 0; font-size: 0.88rem; margin-top: 0.4rem; }
.ai-badge { background: var(--color-ai-badge); color: #fff; border-radius: 20px; padding: 0.1rem 0.5rem; font-size: 0.75rem; }
.post-tags { display: flex; flex-wrap: wrap; gap: 0.3rem; margin: 0.3rem 0; }
.tag { background: var(--color-tag-bg); color: var(--color-accent); padding: 0.12rem 0.45rem; border-radius: 20px; font-size: 0.75rem; }
.empty-state { color: var(--color-muted); text-align: center; padding: 2rem 0; }
.select-prompt { font-size: 1.05rem; }

@media (max-width: 700px) {
  .archive-layout { flex-direction: column; }
  .archive-sidebar { width: 100%; }
}
</style>
