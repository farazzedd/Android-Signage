import {
  users,
  displays,
  media,
  playlists,
  playlistItems,
  schedules,
  type User,
  type UpsertUser,
  type Display,
  type InsertDisplay,
  type Media,
  type InsertMedia,
  type Playlist,
  type InsertPlaylist,
  type PlaylistItem,
  type InsertPlaylistItem,
  type Schedule,
  type InsertSchedule,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import { randomBytes } from "crypto";

// Helper function to generate secure access tokens
function generateAccessToken(): string {
  return randomBytes(32).toString('hex'); // 64-character hex string
}

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Display operations
  createDisplay(display: Omit<InsertDisplay, "inviteCode">): Promise<Display>;
  getDisplays(clientId: string): Promise<Display[]>;
  getDisplay(id: string): Promise<Display | undefined>;
  getDisplayByInviteCode(code: string): Promise<Display | undefined>;
  linkDisplay(inviteCode: string): Promise<Display>;
  updateLastCheckIn(displayId: string): Promise<void>;
  updateDisplayPlaylist(displayId: string, playlistId: string | null): Promise<void>;
  getDisplayByAccessToken(token: string): Promise<Display | undefined>;
  
  // Media operations
  createMedia(mediaData: InsertMedia): Promise<Media>;
  getMedia(clientId: string): Promise<Media[]>;
  getMediaById(id: string): Promise<Media | undefined>;
  
  // Playlist operations
  createPlaylist(playlistData: InsertPlaylist): Promise<Playlist>;
  getPlaylists(clientId: string): Promise<Playlist[]>;
  getPlaylist(id: string): Promise<Playlist | undefined>;
  
  // Playlist item operations
  createPlaylistItem(item: InsertPlaylistItem): Promise<PlaylistItem>;
  getPlaylistItems(playlistId: string): Promise<PlaylistItem[]>;
  getPlaylistItem(id: string): Promise<PlaylistItem | undefined>;
  deletePlaylistItem(id: string): Promise<void>;
  
  // Schedule operations
  createSchedule(scheduleData: InsertSchedule): Promise<Schedule>;
  getSchedules(clientId: string): Promise<Schedule[]>;
  getSchedule(id: string): Promise<Schedule | undefined>;
  deleteSchedule(id: string): Promise<void>;
  
  // Player operations
  getActivePlaylist(displayId: string): Promise<(PlaylistItem & { media: Media })[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Display operations
  async createDisplay(displayData: Omit<InsertDisplay, "inviteCode">): Promise<Display> {
    // Generate 6-character invite code
    const inviteCode = randomBytes(3).toString('hex').toUpperCase();
    
    const [display] = await db
      .insert(displays)
      .values({ ...displayData, inviteCode })
      .returning();
    return display;
  }

  async getDisplays(clientId: string): Promise<Display[]> {
    return await db
      .select()
      .from(displays)
      .where(eq(displays.clientId, clientId))
      .orderBy(desc(displays.createdAt));
  }

  async getDisplay(id: string): Promise<Display | undefined> {
    const [display] = await db.select().from(displays).where(eq(displays.id, id));
    return display;
  }

  async getDisplayByInviteCode(code: string): Promise<Display | undefined> {
    const [display] = await db
      .select()
      .from(displays)
      .where(eq(displays.inviteCode, code));
    return display;
  }

  async linkDisplay(inviteCode: string): Promise<Display> {
    const accessToken = generateAccessToken();
    const [display] = await db
      .update(displays)
      .set({ 
        isLinked: true, 
        lastCheckIn: new Date(),
        accessToken 
      })
      .where(eq(displays.inviteCode, inviteCode))
      .returning();
    return display;
  }

  async getDisplayByAccessToken(token: string): Promise<Display | undefined> {
    const [display] = await db
      .select()
      .from(displays)
      .where(eq(displays.accessToken, token));
    return display;
  }

  async updateLastCheckIn(displayId: string): Promise<void> {
    await db
      .update(displays)
      .set({ lastCheckIn: new Date() })
      .where(eq(displays.id, displayId));
  }

  async updateDisplayPlaylist(displayId: string, playlistId: string | null): Promise<void> {
    await db
      .update(displays)
      .set({ assignedPlaylistId: playlistId })
      .where(eq(displays.id, displayId));
  }

  // Media operations
  async createMedia(mediaData: InsertMedia): Promise<Media> {
    const [mediaItem] = await db
      .insert(media)
      .values(mediaData)
      .returning();
    return mediaItem;
  }

  async getMedia(clientId: string): Promise<Media[]> {
    return await db
      .select()
      .from(media)
      .where(eq(media.clientId, clientId))
      .orderBy(desc(media.createdAt));
  }

  async getMediaById(id: string): Promise<Media | undefined> {
    const [mediaItem] = await db.select().from(media).where(eq(media.id, id));
    return mediaItem;
  }

  // Playlist operations
  async createPlaylist(playlistData: InsertPlaylist): Promise<Playlist> {
    const [playlist] = await db
      .insert(playlists)
      .values(playlistData)
      .returning();
    return playlist;
  }

  async getPlaylists(clientId: string): Promise<Playlist[]> {
    return await db
      .select()
      .from(playlists)
      .where(eq(playlists.clientId, clientId))
      .orderBy(desc(playlists.createdAt));
  }

  async getPlaylist(id: string): Promise<Playlist | undefined> {
    const [playlist] = await db.select().from(playlists).where(eq(playlists.id, id));
    return playlist;
  }

  // Playlist item operations
  async createPlaylistItem(item: InsertPlaylistItem): Promise<PlaylistItem> {
    const [playlistItem] = await db
      .insert(playlistItems)
      .values(item)
      .returning();
    return playlistItem;
  }

  async getPlaylistItems(playlistId: string): Promise<PlaylistItem[]> {
    return await db
      .select()
      .from(playlistItems)
      .where(eq(playlistItems.playlistId, playlistId))
      .orderBy(playlistItems.order);
  }

  async getPlaylistItem(id: string): Promise<PlaylistItem | undefined> {
    const [item] = await db.select().from(playlistItems).where(eq(playlistItems.id, id));
    return item;
  }

  async deletePlaylistItem(id: string): Promise<void> {
    await db.delete(playlistItems).where(eq(playlistItems.id, id));
  }

  // Schedule operations
  async createSchedule(scheduleData: InsertSchedule): Promise<Schedule> {
    const [schedule] = await db
      .insert(schedules)
      .values(scheduleData)
      .returning();
    return schedule;
  }

  async getSchedules(clientId: string): Promise<Schedule[]> {
    // Get all schedules for displays belonging to this client
    const result = await db
      .select({
        schedule: schedules,
        display: displays,
      })
      .from(schedules)
      .innerJoin(displays, eq(schedules.displayId, displays.id))
      .where(eq(displays.clientId, clientId))
      .orderBy(desc(schedules.createdAt));

    return result.map(r => r.schedule);
  }

  async getSchedule(id: string): Promise<Schedule | undefined> {
    const [schedule] = await db.select().from(schedules).where(eq(schedules.id, id));
    return schedule;
  }

  async deleteSchedule(id: string): Promise<void> {
    await db.delete(schedules).where(eq(schedules.id, id));
  }

  // Player operations
  async getActivePlaylist(displayId: string): Promise<(PlaylistItem & { media: Media })[]> {
    // Get the display
    const display = await this.getDisplay(displayId);
    if (!display || !display.assignedPlaylistId) {
      return [];
    }

    // Get playlist items with their media
    const items = await db
      .select({
        playlistItem: playlistItems,
        media: media,
      })
      .from(playlistItems)
      .innerJoin(media, eq(playlistItems.mediaId, media.id))
      .where(eq(playlistItems.playlistId, display.assignedPlaylistId))
      .orderBy(playlistItems.order);

    return items.map(item => ({
      ...item.playlistItem,
      media: item.media,
    }));
  }
}

export const storage = new DatabaseStorage();
