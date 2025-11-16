import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Monitor, Loader2 } from "lucide-react";
import type { Media, PlaylistItem } from "@shared/schema";

export default function Player() {
  const { toast } = useToast();
  const [inviteCode, setInviteCode] = useState("");
  const [displayId, setDisplayId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check if display is already linked (stored in localStorage)
  useEffect(() => {
    const storedDisplayId = localStorage.getItem("elvision_display_id");
    const storedAccessToken = localStorage.getItem("elvision_access_token");
    if (storedDisplayId && storedAccessToken) {
      setDisplayId(storedDisplayId);
      setAccessToken(storedAccessToken);
    }
  }, []);

  // Fetch playlist items for this display
  const { data: playlistItems, isLoading: playlistLoading } = useQuery<(PlaylistItem & { media: Media })[]>({
    queryKey: ["/api/player/playlist", displayId],
    enabled: !!displayId && !!accessToken,
    refetchInterval: 5 * 60 * 1000, // Poll every 5 minutes as fallback
    queryFn: async () => {
      const response = await fetch(`/api/player/playlist/${displayId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch playlist');
      }
      return response.json();
    }
  });

  // Link display with invite code
  const linkDisplayMutation = useMutation({
    mutationFn: async (code: string) => {
      return await apiRequest("POST", "/api/player/link", { inviteCode: code });
    },
    onSuccess: (data: any) => {
      setDisplayId(data.displayId);
      setAccessToken(data.accessToken);
      localStorage.setItem("elvision_display_id", data.displayId);
      localStorage.setItem("elvision_access_token", data.accessToken);
      toast({
        title: "Display Linked",
        description: "Your display has been successfully linked.",
      });
      // Reload to fetch playlist
      queryClient.invalidateQueries({ queryKey: ["/api/player/playlist"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Link Failed",
        description: error.message || "Invalid invite code. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Check-in to update last seen status
  useEffect(() => {
    if (!displayId || !accessToken) return;

    const checkIn = async () => {
      try {
        await fetch("/api/player/checkin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
          }
        });
      } catch (error) {
        console.error("Check-in failed:", error);
      }
    };

    // Initial check-in
    checkIn();

    // Check in every 2 minutes
    const interval = setInterval(checkIn, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [displayId, accessToken]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!displayId || !accessToken) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("WebSocket connected");
      // Register this display with access token
      socket.send(JSON.stringify({ 
        type: "register", 
        displayId,
        accessToken 
      }));
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "refresh" && message.displayId === displayId) {
        console.log("Received refresh command");
        queryClient.invalidateQueries({ queryKey: ["/api/player/playlist"] });
        setCurrentMediaIndex(0); // Restart playlist
      } else if (message.type === "registered") {
        console.log("WebSocket registration confirmed");
      } else if (message.type === "error") {
        console.error("WebSocket error:", message.message);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, [displayId, accessToken]);

  // Media playback logic
  useEffect(() => {
    if (!playlistItems || playlistItems.length === 0) return;

    const currentItem = playlistItems[currentMediaIndex];
    if (!currentItem) return;

    // Clear any existing timer
    if (imageTimerRef.current) {
      clearTimeout(imageTimerRef.current);
    }

    // For images, set timer based on duration
    if (currentItem.media.type === "image") {
      imageTimerRef.current = setTimeout(() => {
        setCurrentMediaIndex((prev) => (prev + 1) % playlistItems.length);
      }, currentItem.duration * 1000);
    }

    return () => {
      if (imageTimerRef.current) {
        clearTimeout(imageTimerRef.current);
      }
    };
  }, [currentMediaIndex, playlistItems]);

  // Handle video end
  const handleVideoEnd = () => {
    if (playlistItems) {
      setCurrentMediaIndex((prev) => (prev + 1) % playlistItems.length);
    }
  };

  // Reset playback when playlist changes
  useEffect(() => {
    setCurrentMediaIndex(0);
  }, [playlistItems]);

  // If not linked, show invite code screen
  if (!displayId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-md bg-primary text-primary-foreground mx-auto mb-4">
              <Monitor className="w-8 h-8" />
            </div>
            <CardTitle className="text-2xl">Elvision Player</CardTitle>
            <CardDescription>Enter your invite code to link this display</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Enter 6-digit code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="text-center text-2xl font-mono tracking-wider"
                data-testid="input-invite-code"
              />
            </div>
            <Button
              className="w-full"
              onClick={() => linkDisplayMutation.mutate(inviteCode)}
              disabled={inviteCode.length !== 6 || linkDisplayMutation.isPending}
              data-testid="button-link-display"
            >
              {linkDisplayMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Linking...
                </>
              ) : (
                "Link Display"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If linked but no playlist, show waiting screen
  if (playlistLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg text-muted-foreground">Loading content...</p>
        </div>
      </div>
    );
  }

  if (!playlistItems || playlistItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Monitor className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg text-muted-foreground">No content assigned</p>
          <p className="text-sm text-muted-foreground mt-2">
            Waiting for playlist assignment from CMS...
          </p>
        </div>
      </div>
    );
  }

  // Full-screen playback mode
  const currentItem = playlistItems[currentMediaIndex];

  return (
    <div className="fixed inset-0 bg-black">
      {currentItem.media.type === "image" ? (
        <img
          src={`/api/media/file/${currentItem.media.id}`}
          alt={currentItem.media.name}
          className="w-full h-full object-contain"
          data-testid="player-image"
        />
      ) : (
        <video
          ref={videoRef}
          src={`/api/media/file/${currentItem.media.id}`}
          className="w-full h-full object-contain"
          autoPlay
          muted
          onEnded={handleVideoEnd}
          data-testid="player-video"
        />
      )}
    </div>
  );
}
