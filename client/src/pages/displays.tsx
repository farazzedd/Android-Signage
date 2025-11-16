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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Copy, Check } from "lucide-react";
import type { Display } from "@shared/schema";

export default function Displays() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);

  const { data: displays, isLoading } = useQuery<Display[]>({
    queryKey: ["/api/displays"],
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

  const createDisplayMutation = useMutation({
    mutationFn: async (name: string) => {
      return await apiRequest("POST", "/api/displays", { name });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/displays"] });
      setGeneratedCode(data.inviteCode);
      setShowCreateDialog(false);
      setShowInviteDialog(true);
      setNewDisplayName("");
      toast({
        title: "Display Created",
        description: "Your invite code has been generated.",
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
        description: "Failed to create display. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    toast({
      title: "Copied",
      description: "Invite code copied to clipboard",
    });
  };

  const isDisplayOnline = (display: Display) => {
    if (!display.lastCheckIn) return false;
    const now = new Date();
    const lastCheckIn = new Date(display.lastCheckIn);
    const diffMinutes = (now.getTime() - lastCheckIn.getTime()) / 1000 / 60;
    return diffMinutes < 10;
  };

  if (authLoading) {
    return null;
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold mb-2" data-testid="text-page-title">Displays</h1>
          <p className="text-muted-foreground">Manage your Android TV displays</p>
        </div>
        <Button 
          onClick={() => setShowCreateDialog(true)}
          data-testid="button-create-display"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Display
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Displays</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : displays && displays.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Invite Code</TableHead>
                  <TableHead>Linked</TableHead>
                  <TableHead>Last Check-in</TableHead>
                  <TableHead>Resolution</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displays.map((display) => {
                  const online = isDisplayOnline(display);
                  return (
                    <TableRow key={display.id} data-testid={`row-display-${display.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div 
                            className={`w-2 h-2 rounded-full ${online ? 'bg-status-online' : 'bg-status-offline'}`}
                            data-testid={`status-${display.id}`}
                          />
                          <span className="text-sm">{online ? "Online" : "Offline"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium" data-testid={`text-name-${display.id}`}>{display.name}</TableCell>
                      <TableCell>
                        <code className="px-2 py-1 rounded bg-muted text-sm font-mono" data-testid={`text-code-${display.id}`}>
                          {display.inviteCode}
                        </code>
                      </TableCell>
                      <TableCell>
                        {display.isLinked ? (
                          <span className="text-sm text-status-online">✓ Linked</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Not linked</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {display.lastCheckIn 
                          ? new Date(display.lastCheckIn).toLocaleString()
                          : "Never"}
                      </TableCell>
                      <TableCell className="text-sm">{display.resolution}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No displays yet</p>
              <Button onClick={() => setShowCreateDialog(true)} data-testid="button-create-first">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Display
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent data-testid="dialog-create-display">
          <DialogHeader>
            <DialogTitle>Create New Display</DialogTitle>
            <DialogDescription>
              Enter a name for your display. An invite code will be generated.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                placeholder="e.g., Lobby Screen, Store Front Display"
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                data-testid="input-display-name"
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
              onClick={() => createDisplayMutation.mutate(newDisplayName)}
              disabled={!newDisplayName.trim() || createDisplayMutation.isPending}
              data-testid="button-confirm-create"
            >
              {createDisplayMutation.isPending ? "Creating..." : "Create Display"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent data-testid="dialog-invite-code">
          <DialogHeader>
            <DialogTitle>Invite Code Generated</DialogTitle>
            <DialogDescription>
              Enter this code on your Android TV player to link the display.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="flex items-center justify-center gap-4 p-6 rounded-md bg-muted">
              <code 
                className="text-4xl font-mono font-bold tracking-wider" 
                data-testid="text-invite-code"
              >
                {generatedCode}
              </code>
              <Button
                size="icon"
                variant="outline"
                onClick={handleCopyCode}
                data-testid="button-copy-code"
              >
                {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowInviteDialog(false)} data-testid="button-close-invite">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
