import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, Image, List, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Display, Media, Playlist, Schedule } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: displays, isLoading: displaysLoading } = useQuery<Display[]>({
    queryKey: ["/api/displays"],
  });

  const { data: media, isLoading: mediaLoading } = useQuery<Media[]>({
    queryKey: ["/api/media"],
  });

  const { data: playlists, isLoading: playlistsLoading } = useQuery<Playlist[]>({
    queryKey: ["/api/playlists"],
  });

  const { data: schedules, isLoading: schedulesLoading } = useQuery<Schedule[]>({
    queryKey: ["/api/schedules"],
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

  if (authLoading) {
    return null;
  }

  const onlineDisplays = displays?.filter(d => {
    if (!d.lastCheckIn) return false;
    const now = new Date();
    const lastCheckIn = new Date(d.lastCheckIn);
    const diffMinutes = (now.getTime() - lastCheckIn.getTime()) / 1000 / 60;
    return diffMinutes < 10;
  }).length || 0;

  const stats = [
    {
      title: "Total Displays",
      value: displays?.length || 0,
      icon: Monitor,
      subtitle: `${onlineDisplays} online`,
      loading: displaysLoading,
    },
    {
      title: "Media Files",
      value: media?.length || 0,
      icon: Image,
      subtitle: `${media?.filter(m => m.type === "image").length || 0} images, ${media?.filter(m => m.type === "video").length || 0} videos`,
      loading: mediaLoading,
    },
    {
      title: "Playlists",
      value: playlists?.length || 0,
      icon: List,
      subtitle: "Active playlists",
      loading: playlistsLoading,
    },
    {
      title: "Schedules",
      value: schedules?.length || 0,
      icon: Calendar,
      subtitle: `${schedules?.filter(s => s.alwaysOn).length || 0} always-on`,
      loading: schedulesLoading,
    },
  ];

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2" data-testid="text-page-title">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your digital signage system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} data-testid={`card-stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {stat.loading ? (
                <>
                  <Skeleton className="h-8 w-16 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold" data-testid={`text-stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}-value`}>
                    {stat.value}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Displays</CardTitle>
          </CardHeader>
          <CardContent>
            {displaysLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : displays && displays.length > 0 ? (
              <div className="space-y-3">
                {displays.slice(0, 5).map((display) => {
                  const isOnline = display.lastCheckIn && 
                    (new Date().getTime() - new Date(display.lastCheckIn).getTime()) / 1000 / 60 < 10;
                  
                  return (
                    <div key={display.id} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-status-online' : 'bg-status-offline'}`} />
                        <div>
                          <p className="font-medium">{display.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {display.lastCheckIn 
                              ? `Last seen ${new Date(display.lastCheckIn).toLocaleString()}`
                              : "Never checked in"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No displays yet. Create your first display to get started.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Media</CardTitle>
          </CardHeader>
          <CardContent>
            {mediaLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : media && media.length > 0 ? (
              <div className="space-y-3">
                {media.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded bg-primary/10 text-primary">
                        <Image className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {item.type} • {(item.fileSize / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No media uploaded yet. Upload your first media file to get started.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
