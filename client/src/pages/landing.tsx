import { Monitor, Image, Calendar, Tv } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary text-primary-foreground">
              <Monitor className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-semibold" data-testid="text-brand-landing">Elvision</h1>
              <p className="text-xs text-muted-foreground">Digital Signage</p>
            </div>
          </div>
          <Button 
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-login"
          >
            Log In
          </Button>
        </div>
      </header>

      <main>
        <section className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold mb-4" data-testid="text-hero-title">
              Enterprise Digital Signage for Android Smart TVs
            </h2>
            <p className="text-lg text-muted-foreground mb-8" data-testid="text-hero-subtitle">
              Manage displays, media, playlists, and schedules from one powerful CMS. Deploy content instantly to your Android TV network.
            </p>
            <Button 
              size="lg"
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-get-started"
            >
              Get Started
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-md bg-primary/10 text-primary mb-4">
                <Tv className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Display Management</h3>
              <p className="text-muted-foreground">
                Register displays with simple invite codes. Monitor status and control content from anywhere.
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-md bg-primary/10 text-primary mb-4">
                <Image className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Media Library</h3>
              <p className="text-muted-foreground">
                Upload images and videos. Organize your content library with powerful search and filtering.
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-md bg-primary/10 text-primary mb-4">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Smart Scheduling</h3>
              <p className="text-muted-foreground">
                Create playlists and schedule content with precision. Set time-based rules for automated playback.
              </p>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <p className="text-sm text-muted-foreground text-center">
            © 2024 Elvision. Enterprise Digital Signage System.
          </p>
        </div>
      </footer>
    </div>
  );
}
