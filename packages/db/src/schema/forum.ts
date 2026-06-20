import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'
import { user } from './auth'

export const forumPosts = sqliteTable('forum_posts', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

export const forumReplies = sqliteTable('forum_replies', {
  id: text('id').primaryKey(),
  body: text('body').notNull(),
  postId: text('post_id').notNull().references(() => forumPosts.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

export const forumPostsRelations = relations(forumPosts, ({ one, many }) => ({
  user: one(user, { fields: [forumPosts.userId], references: [user.id] }),
  forumReplies: many(forumReplies),
}))

export const forumRepliesRelations = relations(forumReplies, ({ one }) => ({
  post: one(forumPosts, { fields: [forumReplies.postId], references: [forumPosts.id] }),
  user: one(user, { fields: [forumReplies.userId], references: [user.id] }),
}))
