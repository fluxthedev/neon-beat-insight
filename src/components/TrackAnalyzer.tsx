import { Music, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";

interface TrackData {
  id: string;
  name: string;
  tempo: number;
  key: string;
  energy: number;
}

interface TrackAnalyzerProps {
  track: TrackData;
}

export const TrackAnalyzer = ({ track }: TrackAnalyzerProps) => {
  return (
    <Card className="p-6 bg-gradient-card border-border hover:border-primary/50 transition-all duration-300 animate-slide-up">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
          <Music className="h-6 w-6 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold truncate mb-3">{track.name}</h3>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Tempo</p>
              <p className="text-2xl font-bold text-primary">{track.tempo}</p>
              <p className="text-xs text-muted-foreground">BPM</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Key</p>
              <p className="text-2xl font-bold text-secondary">{track.key}</p>
              <p className="text-xs text-muted-foreground">Detected</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Energy</p>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-accent" />
                <p className="text-2xl font-bold text-accent">{track.energy}%</p>
              </div>
            </div>
          </div>
          
          {/* Waveform visualization placeholder */}
          <div className="mt-4 h-16 rounded-lg bg-muted/30 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center gap-[2px] px-2">
              {Array.from({ length: 80 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 bg-primary/40 rounded-full transition-all duration-300 hover:bg-primary"
                  style={{
                    height: `${Math.random() * 70 + 30}%`,
                    animation: `pulse-glow ${2 + Math.random() * 2}s ease-in-out infinite`,
                    animationDelay: `${i * 0.05}s`
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
