import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  // ─── Existing Todo ───────────────────────────────────────────────────────
  Todo: a
    .model({
      content: a.string(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  // ─── Social Networking ───────────────────────────────────────────────────
  Post: a
    .model({
      content: a.string().required(),
      authorId: a.string(),
      authorName: a.string(),
      tags: a.string().array(),
      likesCount: a.integer().default(0),
      isAiGenerated: a.boolean().default(false),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(["read"]),
    ]),

  Comment: a
    .model({
      postId: a.string().required(),
      content: a.string().required(),
      authorId: a.string(),
      authorName: a.string(),
      isAiGenerated: a.boolean().default(false),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(["read"]),
    ]),

  // ─── Collaborative Archiving ─────────────────────────────────────────────
  Archive: a
    .model({
      title: a.string().required(),
      description: a.string(),
      curatorId: a.string(),
      curatorName: a.string(),
      tags: a.string().array(),
      isAiCurated: a.boolean().default(false),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(["read"]),
    ]),

  ArchiveItem: a
    .model({
      archiveId: a.string().required(),
      title: a.string().required(),
      content: a.string(),
      sourceUrl: a.string(),
      itemType: a.enum(["link", "image", "text", "video"]),
      aiNotes: a.string(),
      contributorId: a.string(),
      contributorName: a.string(),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(["read"]),
    ]),

  // ─── AI Agent Activity Log ────────────────────────────────────────────────
  AiAgentLog: a
    .model({
      action: a.string().required(),
      targetType: a.enum(["post", "comment", "archive", "archiveItem"]),
      targetId: a.string(),
      summary: a.string(),
      learnedFrom: a.string(),
    })
    .authorization((allow) => [allow.authenticated()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
    // API Key kept for the legacy Todo model (publicApiKey rule)
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
