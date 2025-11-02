import { useMemo } from "react";
import { Music, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";

interface TrackData {
  id: string;
  name: string;
  tempo: number;
  key: string;
  energy: number;
  waveform?: number[];
}

interface TrackAnalyzerProps {
  track: TrackData;
}

export const TrackAnalyzer = ({ track }: TrackAnalyzerProps) => {
  const waveform = track.waveform;
  const hasWaveform = Array.isArray(waveform) && waveform.length > 0;

  const waveformPoints = useMemo(() => {
    if (!hasWaveform || !waveform) {
      return "";
    }

    const height = 100;
    const length = waveform.length;

    return waveform
      .map((value, index) => {
        const clamped = Math.min(Math.max(value, 0), 1);
        const x = length > 1 ? (index / (length - 1)) * 100 : 0;
        const y = (1 - clamped) * height;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(" ");
  }, [hasWaveform, waveform]);

  return (
    <Card className="p-4 sm:p-6 bg-gradient-card border-border hover:border-primary/50 transition-all duration-300 animate-slide-up">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="p-2 sm:p-3 rounded-lg bg-primary/10 border border-primary/20">
          <Music className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold truncate mb-3">{track.name}</h3>
          
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="space-y-1">
              <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">Tempo</p>
              <p className="text-xl sm:text-2xl font-bold text-primary">{track.tempo}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">BPM</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">Key</p>
              <p className="text-xl sm:text-2xl font-bold text-secondary">{track.key}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Detected</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">Energy</p>
              <div className="flex items-center gap-1 sm:gap-2">
                <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-accent" />
                <p className="text-xl sm:text-2xl font-bold text-accent">{track.energy}%</p>
              </div>
            </div>
          </div>
          
          <div className="mt-3 sm:mt-4 h-12 sm:h-16 rounded-lg bg-muted/30 relative overflow-hidden">
            {hasWaveform ? (
              <svg
                role="img"
                aria-label={`Waveform visualization for ${track.name}`}
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full text-primary"
              >
                <polyline
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinejoin="round"
                  points={waveformPoints}
                />
                <polyline
                  fill="currentColor"
                  opacity={0.15}
                  points={`0,100 ${waveformPoints} 100,100`}
                />
              </svg>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center px-4 text-[10px] sm:text-xs text-muted-foreground text-center">
                Waveform data unavailable for this track.
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
