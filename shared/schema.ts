import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { length: 20 }).notNull().default("client"), // 'admin' or 'client'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Displays (Android TV devices)
export const displays = pgTable("displays", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  inviteCode: varchar("invite_code", { length: 6 }).notNull().unique(),
  accessToken: varchar("access_token", { length: 64 }), // Bearer token for player authentication
  clientId: varchar("client_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  isLinked: boolean("is_linked").notNull().default(false),
  lastCheckIn: timestamp("last_check_in"),
  assignedPlaylistId: varchar("assigned_playlist_id").references(() => playlists.id, { onDelete: 'set null' }),
  resolution: varchar("resolution", { length: 20 }).default("1080p"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Media files (images and videos)
export const media = pgTable("media", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: varchar("type", { length: 10 }).notNull(), // 'image' or 'video'
  filename: text("filename").notNull(), // actual file path on server
  fileSize: integer("file_size").notNull(), // in bytes
  mimeType: varchar("mime_type", { length: 50 }).notNull(),
  clientId: varchar("client_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Playlists
export const playlists = pgTable("playlists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  clientId: varchar("client_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Playlist items (junction table)
export const playlistItems = pgTable("playlist_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  playlistId: varchar("playlist_id").notNull().references(() => playlists.id, { onDelete: 'cascade' }),
  mediaId: varchar("media_id").notNull().references(() => media.id, { onDelete: 'cascade' }),
  order: integer("order").notNull(), // display order in playlist
  duration: integer("duration").notNull().default(10), // duration in seconds (for images)
  createdAt: timestamp("created_at").defaultNow(),
});

// Schedules
export const schedules = pgTable("schedules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  displayId: varchar("display_id").notNull().references(() => displays.id, { onDelete: 'cascade' }),
  playlistId: varchar("playlist_id").notNull().references(() => playlists.id, { onDelete: 'cascade' }),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  alwaysOn: boolean("always_on").notNull().default(false),
  priority: integer("priority").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  displays: many(displays),
  media: many(media),
  playlists: many(playlists),
}));

export const displaysRelations = relations(displays, ({ one, many }) => ({
  client: one(users, {
    fields: [displays.clientId],
    references: [users.id],
  }),
  schedules: many(schedules),
}));

export const mediaRelations = relations(media, ({ one, many }) => ({
  client: one(users, {
    fields: [media.clientId],
    references: [users.id],
  }),
  playlistItems: many(playlistItems),
}));

export const playlistsRelations = relations(playlists, ({ one, many }) => ({
  client: one(users, {
    fields: [playlists.clientId],
    references: [users.id],
  }),
  items: many(playlistItems),
  schedules: many(schedules),
}));

export const playlistItemsRelations = relations(playlistItems, ({ one }) => ({
  playlist: one(playlists, {
    fields: [playlistItems.playlistId],
    references: [playlists.id],
  }),
  media: one(media, {
    fields: [playlistItems.mediaId],
    references: [media.id],
  }),
}));

export const schedulesRelations = relations(schedules, ({ one }) => ({
  display: one(displays, {
    fields: [schedules.displayId],
    references: [displays.id],
  }),
  playlist: one(playlists, {
    fields: [schedules.playlistId],
    references: [playlists.id],
  }),
}));

// Insert schemas
export const upsertUserSchema = z.object({
  id: z.string(),
  email: z.string().nullable().optional(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  profileImageUrl: z.string().nullable().optional(),
  role: z.enum(["admin", "client"]).optional(),
});

export const insertDisplaySchema = createInsertSchema(displays).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMediaSchema = createInsertSchema(media).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPlaylistSchema = createInsertSchema(playlists).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPlaylistItemSchema = createInsertSchema(playlistItems).omit({
  id: true,
  createdAt: true,
});

export const insertScheduleSchema = createInsertSchema(schedules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type Display = typeof displays.$inferSelect;
export type InsertDisplay = z.infer<typeof insertDisplaySchema>;
export type Media = typeof media.$inferSelect;
export type InsertMedia = z.infer<typeof insertMediaSchema>;
export type Playlist = typeof playlists.$inferSelect;
export type InsertPlaylist = z.infer<typeof insertPlaylistSchema>;
export type PlaylistItem = typeof playlistItems.$inferSelect;
export type InsertPlaylistItem = z.infer<typeof insertPlaylistItemSchema>;
export type Schedule = typeof schedules.$inferSelect;
export type InsertSchedule = z.infer<typeof insertScheduleSchema>;
