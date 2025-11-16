import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import type { Schedule, Display, Playlist } from "@shared/schema";

export default function Schedules() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedDisplay, setSelectedDisplay] = useState<string>("");
  const [selectedPlaylist, setSelectedPlaylist] = useState<string>("");
  const [alwaysOn, setAlwaysOn] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: schedules, isLoading: schedulesLoading } = useQuery<Schedule[]>({
    queryKey: ["/api/schedules"],
  });

  const { data: displays } = useQuery<Display[]>({
    queryKey: ["/api/displays"],
  });

  const { data: playlists } = useQuery<Playlist[]>({
    queryKey: ["/api/playlists"],
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

  const createScheduleMutation = useMutation({
    mutationFn: async (data: {
      displayId: string;
      playlistId: string;
      alwaysOn: boolean;
      startDate?: string;
      endDate?: string;
    }) => {
      return await apiRequest("POST", "/api/schedules", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedules"] });
      setShowCreateDialog(false);
      resetForm();
      toast({
        title: "Schedule Created",
        description: "Your schedule has been created successfully.",
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
        description: "Failed to create schedule. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteScheduleMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/schedules/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedules"] });
      toast({
        title: "Schedule Deleted",
        description: "The schedule has been removed.",
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
        description: "Failed to delete schedule.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSelectedDisplay("");
    setSelectedPlaylist("");
    setAlwaysOn(true);
    setStartDate("");
    setEndDate("");
  };

  const handleCreateSchedule = () => {
    if (!selectedDisplay || !selectedPlaylist) {
      toast({
        title: "Validation Error",
        description: "Please select both a display and a playlist.",
        variant: "destructive",
      });
      return;
    }

    const data: any = {
      displayId: selectedDisplay,
      playlistId: selectedPlaylist,
      alwaysOn,
    };

    if (!alwaysOn) {
      if (startDate) data.startDate = new Date(startDate).toISOString();
      if (endDate) data.endDate = new Date(endDate).toISOString();
    }

    createScheduleMutation.mutate(data);
  };

  const getDisplayName = (id: string) => displays?.find(d => d.id === id)?.name || "Unknown";
  const getPlaylistName = (id: string) => playlists?.find(p => p.id === id)?.name || "Unknown";

  if (authLoading) {
    return null;
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold mb-2" data-testid="text-page-title">Schedules</h1>
          <p className="text-muted-foreground">Assign playlists to displays with scheduling rules</p>
        </div>
        <Button 
          onClick={() => setShowCreateDialog(true)}
          data-testid="button-create-schedule"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Schedule
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Schedules</CardTitle>
        </CardHeader>
        <CardContent>
          {schedulesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : schedules && schedules.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Display</TableHead>
                  <TableHead>Playlist</TableHead>
                  <TableHead>Schedule Type</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((schedule) => (
                  <TableRow key={schedule.id} data-testid={`row-schedule-${schedule.id}`}>
                    <TableCell className="font-medium">
                      {getDisplayName(schedule.displayId)}
                    </TableCell>
                    <TableCell>{getPlaylistName(schedule.playlistId)}</TableCell>
                    <TableCell>
                      {schedule.alwaysOn ? (
                        <span className="text-sm text-status-online">Always On</span>
                      ) : (
                        <span className="text-sm">Time-based</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {schedule.startDate ? new Date(schedule.startDate).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {schedule.endDate ? new Date(schedule.endDate).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteScheduleMutation.mutate(schedule.id)}
                        disabled={deleteScheduleMutation.isPending}
                        data-testid={`button-delete-${schedule.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No schedules yet</p>
              <Button onClick={() => setShowCreateDialog(true)} data-testid="button-create-first">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Schedule
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent data-testid="dialog-create-schedule">
          <DialogHeader>
            <DialogTitle>Create New Schedule</DialogTitle>
            <DialogDescription>
              Assign a playlist to a display with scheduling options.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="display">Display</Label>
              <Select value={selectedDisplay} onValueChange={setSelectedDisplay}>
                <SelectTrigger id="display" data-testid="select-display">
                  <SelectValue placeholder="Select a display" />
                </SelectTrigger>
                <SelectContent>
                  {displays?.filter(d => d.isLinked).map((display) => (
                    <SelectItem key={display.id} value={display.id}>
                      {display.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="playlist">Playlist</Label>
              <Select value={selectedPlaylist} onValueChange={setSelectedPlaylist}>
                <SelectTrigger id="playlist" data-testid="select-playlist">
                  <SelectValue placeholder="Select a playlist" />
                </SelectTrigger>
                <SelectContent>
                  {playlists?.map((playlist) => (
                    <SelectItem key={playlist.id} value={playlist.id}>
                      {playlist.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="always-on">Always On</Label>
              <Switch
                id="always-on"
                checked={alwaysOn}
                onCheckedChange={setAlwaysOn}
                data-testid="switch-always-on"
              />
            </div>

            {!alwaysOn && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date (Optional)</Label>
                  <Input
                    id="start-date"
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    data-testid="input-start-date"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date (Optional)</Label>
                  <Input
                    id="end-date"
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    data-testid="input-end-date"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                resetForm();
              }}
              data-testid="button-cancel-create"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateSchedule}
              disabled={createScheduleMutation.isPending || !selectedDisplay || !selectedPlaylist}
              data-testid="button-confirm-create"
            >
              {createScheduleMutation.isPending ? "Creating..." : "Create Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
