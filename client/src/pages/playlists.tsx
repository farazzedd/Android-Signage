import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, GripVertical, Image as ImageIcon, Video } from "lucide-react";
import type { Playlist, Media, PlaylistItem } from "@shared/schema";

export default function Playlists() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [mediaDurations, setMediaDurations] = useState<Record<string, number>>({});

  const { data: playlists, isLoading: playlistsLoading } = useQuery<Playlist[]>({
    queryKey: ["/api/playlists"],
  });

  const { data: media, isLoading: mediaLoading } = useQuery<Media[]>({
    queryKey: ["/api/media"],
  });

  const { data: playlistItems, isLoading: itemsLoading } = useQuery<PlaylistItem[]>({
    queryKey: ["/api/playlist-items", selectedPlaylist?.id],
    enabled: !!selectedPlaylist,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  const createPlaylistMutation = useMutation({
    mutationFn: async (name: string) => {
      return await apiRequest("POST", "/api/playlists", { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/playlists"] });
      setShowCreateDialog(false);
      setNewPlaylistName("");
      toast({
        title: "Playlist Created",
        description: "Your new playlist has been created.",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create playlist. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addMediaToPlaylistMutation = useMutation({
    mutationFn: async ({ playlistId, mediaId, order, duration }: { playlistId: string; mediaId: string; order: number; duration: number }) => {
      return await apiRequest("POST", "/api/playlist-items", {
        playlistId,
        mediaId,
        order,
        duration,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/playlist-items", selectedPlaylist?.id] });
      toast({
        title: "Media Added",
        description: "Media has been added to the playlist.",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add media. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddMedia = (mediaId: string) => {
    if (!selectedPlaylist) return;
    const order = (playlistItems?.length || 0) + 1;
    const mediaItem = media?.find(m => m.id === mediaId);
    const duration = mediaItem?.type === "image" ? (mediaDurations[mediaId] || 10) : 0;
    
    addMediaToPlaylistMutation.mutate({
      playlistId: selectedPlaylist.id,
      mediaId,
      order,
      duration,
    });
  };

  const handleEditPlaylist = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setShowEditDialog(true);
  };

  const getMediaById = (id: string) => media?.find(m => m.id === id);

  if (authLoading) {
    return null;
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold mb-2" data-testid="text-page-title">Playlists</h1>
          <p className="text-muted-foreground">Create and manage your media playlists</p>
        </div>
        <Button 
          onClick={() => setShowCreateDialog(true)}
          data-testid="button-create-playlist"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Playlist
        </Button>
      </div>

      {playlistsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : playlists && playlists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist) => (
            <Card 
              key={playlist.id} 
              data-testid={`card-playlist-${playlist.id}`}
              className="hover-elevate cursor-pointer"
              onClick={() => handleEditPlaylist(playlist)}
            >
              <CardHeader>
                <CardTitle className="text-lg" data-testid={`text-playlist-name-${playlist.id}`}>
                  {playlist.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Created {new Date(playlist.createdAt!).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">No playlists yet</p>
              <Button onClick={() => setShowCreateDialog(true)} data-testid="button-create-first">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Playlist
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent data-testid="dialog-create-playlist">
          <DialogHeader>
            <DialogTitle>Create New Playlist</DialogTitle>
            <DialogDescription>
              Give your playlist a name to get started.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Playlist Name</Label>
              <Input
                id="name"
                placeholder="e.g., Morning Content, Promotions"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                data-testid="input-playlist-name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              data-testid="button-cancel-create"
            >
              Cancel
            </Button>
            <Button
              onClick={() => createPlaylistMutation.mutate(newPlaylistName)}
              disabled={!newPlaylistName.trim() || createPlaylistMutation.isPending}
              data-testid="button-confirm-create"
            >
              {createPlaylistMutation.isPending ? "Creating..." : "Create Playlist"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl" data-testid="dialog-edit-playlist">
          <DialogHeader>
            <DialogTitle>Edit Playlist: {selectedPlaylist?.name}</DialogTitle>
            <DialogDescription>
              Add media to your playlist and set display durations.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6 py-4">
            <div>
              <h3 className="font-medium mb-4">Available Media</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {mediaLoading ? (
                  [1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)
                ) : media && media.length > 0 ? (
                  media.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-md bg-muted/50 hover-elevate"
                    >
                      <div className="flex items-center gap-3">
                        {item.type === "image" ? (
                          <ImageIcon className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Video className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddMedia(item.id)}
                        disabled={addMediaToPlaylistMutation.isPending}
                        data-testid={`button-add-media-${item.id}`}
                      >
                        Add
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No media available</p>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-4">Playlist Items</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {itemsLoading ? (
                  [1, 2].map(i => <Skeleton key={i} className="h-16 w-full" />)
                ) : playlistItems && playlistItems.length > 0 ? (
                  playlistItems.map((item) => {
                    const mediaItem = getMediaById(item.mediaId);
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-md bg-muted/50"
                        data-testid={`playlist-item-${item.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <GripVertical className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{mediaItem?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {mediaItem?.type === "image" && (
                            <span className="text-xs text-muted-foreground">{item.duration}s</span>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground">No media in this playlist</p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowEditDialog(false)} data-testid="button-close-edit">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
