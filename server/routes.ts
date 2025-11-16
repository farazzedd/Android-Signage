import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import multer from "multer";
import path from "path";
import fs from "fs";
import { z } from "zod";
import { 
  insertDisplaySchema, 
  insertMediaSchema, 
  insertPlaylistSchema, 
  insertPlaylistItemSchema,
  insertScheduleSchema 
} from "@shared/schema";

// Configure file upload
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
});

// WebSocket connections map
const wsConnections = new Map<string, WebSocket>();

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Display routes
  app.post('/api/displays', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertDisplaySchema.omit({ inviteCode: true }).parse({
        ...req.body,
        clientId: userId,
        isLinked: false,
      });
      
      const display = await storage.createDisplay(data);
      res.json(display);
    } catch (error: any) {
      console.error("Error creating display:", error);
      res.status(400).json({ message: error.message || "Failed to create display" });
    }
  });

  app.get('/api/displays', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const displays = await storage.getDisplays(userId);
      res.json(displays);
    } catch (error) {
      console.error("Error fetching displays:", error);
      res.status(500).json({ message: "Failed to fetch displays" });
    }
  });

  app.get('/api/displays/:id', isAuthenticated, async (req: any, res) => {
    try {
      const display = await storage.getDisplay(req.params.id);
      if (!display) {
        return res.status(404).json({ message: "Display not found" });
      }
      
      // Verify ownership
      const userId = req.user.claims.sub;
      if (display.clientId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(display);
    } catch (error) {
      console.error("Error fetching display:", error);
      res.status(500).json({ message: "Failed to fetch display" });
    }
  });

  // Media routes
  app.post('/api/media/upload', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const userId = req.user.claims.sub;
      const type = req.file.mimetype.startsWith('image/') ? 'image' : 'video';
      
      const mediaData = {
        name: req.file.originalname,
        type,
        filename: req.file.filename,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        clientId: userId,
      };

      const media = await storage.createMedia(mediaData);
      res.json(media);
    } catch (error: any) {
      console.error("Error uploading media:", error);
      res.status(500).json({ message: error.message || "Failed to upload media" });
    }
  });

  app.get('/api/media', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const media = await storage.getMedia(userId);
      res.json(media);
    } catch (error) {
      console.error("Error fetching media:", error);
      res.status(500).json({ message: "Failed to fetch media" });
    }
  });

  app.get('/api/media/file/:id', async (req, res) => {
    try {
      const media = await storage.getMediaById(req.params.id);
      if (!media) {
        return res.status(404).json({ message: "Media not found" });
      }

      const filePath = path.join(uploadDir, media.filename);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found" });
      }

      res.sendFile(filePath);
    } catch (error) {
      console.error("Error serving media file:", error);
      res.status(500).json({ message: "Failed to serve file" });
    }
  });

  // Playlist routes
  app.post('/api/playlists', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertPlaylistSchema.parse({
        ...req.body,
        clientId: userId,
      });
      
      const playlist = await storage.createPlaylist(data);
      res.json(playlist);
    } catch (error: any) {
      console.error("Error creating playlist:", error);
      res.status(400).json({ message: error.message || "Failed to create playlist" });
    }
  });

  app.get('/api/playlists', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const playlists = await storage.getPlaylists(userId);
      res.json(playlists);
    } catch (error) {
      console.error("Error fetching playlists:", error);
      res.status(500).json({ message: "Failed to fetch playlists" });
    }
  });

  app.get('/api/playlists/:id', isAuthenticated, async (req: any, res) => {
    try {
      const playlist = await storage.getPlaylist(req.params.id);
      if (!playlist) {
        return res.status(404).json({ message: "Playlist not found" });
      }
      
      // Verify ownership
      const userId = req.user.claims.sub;
      if (playlist.clientId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(playlist);
    } catch (error) {
      console.error("Error fetching playlist:", error);
      res.status(500).json({ message: "Failed to fetch playlist" });
    }
  });

  // Playlist item routes
  app.post('/api/playlist-items', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertPlaylistItemSchema.parse(req.body);
      
      // Verify playlist ownership
      const playlist = await storage.getPlaylist(data.playlistId);
      if (!playlist || playlist.clientId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Verify media ownership
      const media = await storage.getMediaById(data.mediaId);
      if (!media || media.clientId !== userId) {
        return res.status(403).json({ message: "Forbidden - media not found or access denied" });
      }
      
      const item = await storage.createPlaylistItem(data);
      res.json(item);
    } catch (error: any) {
      console.error("Error creating playlist item:", error);
      res.status(400).json({ message: error.message || "Failed to create playlist item" });
    }
  });

  app.get('/api/playlist-items/:playlistId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const playlist = await storage.getPlaylist(req.params.playlistId);
      
      if (!playlist || playlist.clientId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const items = await storage.getPlaylistItems(req.params.playlistId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching playlist items:", error);
      res.status(500).json({ message: "Failed to fetch playlist items" });
    }
  });

  app.delete('/api/playlist-items/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Get the playlist item
      const item = await storage.getPlaylistItem(req.params.id);
      if (!item) {
        return res.status(404).json({ message: "Playlist item not found" });
      }
      
      // Verify playlist ownership
      const playlist = await storage.getPlaylist(item.playlistId);
      if (!playlist || playlist.clientId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deletePlaylistItem(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting playlist item:", error);
      res.status(500).json({ message: "Failed to delete playlist item" });
    }
  });

  // Schedule routes
  app.post('/api/schedules', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertScheduleSchema.parse(req.body);
      
      // Verify display ownership
      const display = await storage.getDisplay(data.displayId);
      if (!display || display.clientId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Verify playlist ownership
      const playlist = await storage.getPlaylist(data.playlistId);
      if (!playlist || playlist.clientId !== userId) {
        return res.status(403).json({ message: "Forbidden - playlist not found or access denied" });
      }
      
      const schedule = await storage.createSchedule(data);
      
      // Update display's assigned playlist
      await storage.updateDisplayPlaylist(data.displayId, data.playlistId);
      
      // Send WebSocket notification to refresh this display
      const displayWs = wsConnections.get(data.displayId);
      if (displayWs && displayWs.readyState === WebSocket.OPEN) {
        displayWs.send(JSON.stringify({ type: 'refresh', displayId: data.displayId }));
      }
      
      res.json(schedule);
    } catch (error: any) {
      console.error("Error creating schedule:", error);
      res.status(400).json({ message: error.message || "Failed to create schedule" });
    }
  });

  app.get('/api/schedules', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const schedules = await storage.getSchedules(userId);
      res.json(schedules);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      res.status(500).json({ message: "Failed to fetch schedules" });
    }
  });

  app.delete('/api/schedules/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Get the schedule
      const schedule = await storage.getSchedule(req.params.id);
      if (!schedule) {
        return res.status(404).json({ message: "Schedule not found" });
      }
      
      // Verify display ownership
      const display = await storage.getDisplay(schedule.displayId);
      if (!display || display.clientId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteSchedule(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting schedule:", error);
      res.status(500).json({ message: "Failed to delete schedule" });
    }
  });

  // Middleware to validate display access token
  const validateDisplayToken = async (req: any, res: any, next: any) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Unauthorized - missing or invalid token" });
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      const display = await storage.getDisplayByAccessToken(token);
      
      if (!display) {
        return res.status(401).json({ message: "Unauthorized - invalid token" });
      }

      req.display = display;
      next();
    } catch (error) {
      console.error("Error validating display token:", error);
      res.status(401).json({ message: "Unauthorized" });
    }
  };

  // Player routes - link endpoint is public, others require token
  app.post('/api/player/link', async (req, res) => {
    try {
      const { inviteCode } = req.body;
      
      if (!inviteCode) {
        return res.status(400).json({ message: "Invite code is required" });
      }

      const existingDisplay = await storage.getDisplayByInviteCode(inviteCode.toUpperCase());
      if (!existingDisplay) {
        return res.status(404).json({ message: "Invalid invite code" });
      }

      const display = await storage.linkDisplay(inviteCode.toUpperCase());
      res.json({ 
        displayId: display.id, 
        accessToken: display.accessToken,
        message: "Display linked successfully" 
      });
    } catch (error) {
      console.error("Error linking display:", error);
      res.status(500).json({ message: "Failed to link display" });
    }
  });

  app.post('/api/player/checkin', validateDisplayToken, async (req: any, res) => {
    try {
      await storage.updateLastCheckIn(req.display.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error checking in:", error);
      res.status(500).json({ message: "Failed to check in" });
    }
  });

  app.get('/api/player/playlist/:displayId', validateDisplayToken, async (req: any, res) => {
    try {
      // Verify the token matches the requested display
      if (req.display.id !== req.params.displayId) {
        return res.status(403).json({ message: "Forbidden - token does not match display" });
      }

      const playlistItems = await storage.getActivePlaylist(req.params.displayId);
      res.json(playlistItems);
    } catch (error) {
      console.error("Error fetching player playlist:", error);
      res.status(500).json({ message: "Failed to fetch playlist" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  // Set up WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection');
    
    let isAuthenticated = false;
    let registeredDisplayId: string | null = null;

    ws.on('message', async (message: string) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'register' && data.displayId && data.accessToken) {
          // Verify the access token
          const display = await storage.getDisplayByAccessToken(data.accessToken);
          
          if (!display || display.id !== data.displayId) {
            ws.send(JSON.stringify({ 
              type: 'error', 
              message: 'Invalid credentials - unauthorized' 
            }));
            ws.close();
            return;
          }

          // Register this connection for the specific display
          isAuthenticated = true;
          registeredDisplayId = data.displayId;
          wsConnections.set(data.displayId, ws);
          console.log(`Display ${data.displayId} registered for WebSocket updates`);
          
          ws.send(JSON.stringify({ 
            type: 'registered', 
            displayId: data.displayId 
          }));
        } else if (!isAuthenticated) {
          ws.send(JSON.stringify({ 
            type: 'error', 
            message: 'Not authenticated - send register message first' 
          }));
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: 'Invalid message format' 
        }));
      }
    });

    ws.on('close', () => {
      // Remove this connection from the map
      if (registeredDisplayId) {
        wsConnections.delete(registeredDisplayId);
        console.log(`Display ${registeredDisplayId} disconnected`);
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  return httpServer;
}
