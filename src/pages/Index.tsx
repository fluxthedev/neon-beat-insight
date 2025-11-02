import { useState, useCallback, useRef } from "react";
import { Activity } from "lucide-react";
import { FileUpload } from "@/components/FileUpload";
import { TrackAnalyzer } from "@/components/TrackAnalyzer";
import { TrackList } from "@/components/TrackList";
import { DashboardHeader } from "@/components/DashboardHeader";
import { useToast } from "@/hooks/use-toast";
import { analyzeTrack, TrackAnalysis } from "@/lib/analyze-track";

interface Track {
  id: string;
  name: string;
  size: number;
}

type TrackData = TrackAnalysis;

const Index = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [analyzedTracks, setAnalyzedTracks] = useState<TrackData[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState<string>();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const { toast } = useToast();
  const tracksRef = useRef<Track[]>([]);

  const updateTracks = useCallback((updater: (prev: Track[]) => Track[]) => {
    setTracks(prev => {
      const next = updater(prev);
      tracksRef.current = next;
      return next;
    });
  }, []);

  tracksRef.current = tracks;

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) {
      return;
    }

    const newTracks: Track[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
    }));

    updateTracks(prev => [...prev, ...newTracks]);

    setIsAnalyzing(true);
    setAnalysisError(null);

    let latestError: string | null = null;

    try {
      const analyses = await Promise.all(
        files.map(async (file, index) => {
          try {
            return await analyzeTrack(file, newTracks[index].id);
          } catch (error) {
            const description =
              error instanceof Error ? error.message : 'An unexpected error occurred during analysis';
            latestError = description;
            setAnalysisError(description);
            toast({
              title: `Failed to analyze ${file.name}`,
              description,
              variant: "destructive",
            });
            return null;
          }
        })
      );

      const successfulAnalyses = analyses.filter((analysis): analysis is TrackData => Boolean(analysis));
      const activeTrackIds = new Set(tracksRef.current.map(track => track.id));
      const filteredAnalyses = successfulAnalyses.filter(analysis => activeTrackIds.has(analysis.id));

      let appendedCount = 0;

      if (filteredAnalyses.length > 0) {
        setAnalyzedTracks(prev => {
          const existingIds = new Set(prev.map(track => track.id));
          const deduped = filteredAnalyses.filter(analysis => !existingIds.has(analysis.id));
          appendedCount = deduped.length;

          if (deduped.length === 0) {
            return prev;
          }

          return [...prev, ...deduped];
        });
      }

      if (appendedCount > 0) {
        toast({
          title: "Tracks analyzed",
          description: `${appendedCount} track${appendedCount > 1 ? 's' : ''} ready for review`,
        });
      }

      if (!successfulAnalyses.length && files.length > 0 && !latestError) {
        latestError = 'All analyses failed. Please try again with different files.';
        setAnalysisError(latestError);
      }
    } finally {
      setIsAnalyzing(false);
    }

    // Auto-select the first uploaded track if none selected
    if (!selectedTrackId && newTracks.length > 0) {
      setSelectedTrackId(newTracks[0].id);
    }
  };

  const handleRemoveTrack = (id: string) => {
    updateTracks(prev => prev.filter(t => t.id !== id));
    setAnalyzedTracks(prev => prev.filter(t => t.id !== id));
    if (selectedTrackId === id) {
      setSelectedTrackId(undefined);
    }
  };

  const selectedTrack = analyzedTracks.find(t => t.id === selectedTrackId);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left column - Upload and Track List */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            <FileUpload onFilesSelected={handleFilesSelected} />
            {isAnalyzing && (
              <div className="rounded-lg border border-primary/40 bg-primary/10 p-3 text-sm text-primary flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-primary animate-ping" aria-hidden="true" />
                <span>Analyzing audio… this may take a moment.</span>
              </div>
            )}
            {analysisError && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                {analysisError}
              </div>
            )}
            <TrackList
              tracks={tracks}
              onRemove={handleRemoveTrack}
              onSelect={setSelectedTrackId}
              selectedId={selectedTrackId}
            />
          </div>
          
          {/* Right column - Analysis Display */}
          <div className="lg:col-span-2">
            {selectedTrack ? (
              <TrackAnalyzer track={selectedTrack} />
            ) : (
              <div className="h-full min-h-[300px] sm:min-h-[500px] rounded-lg border-2 border-dashed border-border bg-card/50 flex flex-col items-center justify-center text-center p-4 sm:p-8">
                <div className="p-4 rounded-full bg-muted mb-4">
                  <Activity className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">
                  Select a track to analyze
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground max-w-md">
                  Upload audio files and select them from the queue to view detailed 
                  analysis including tempo, key detection, and waveform visualization.
                </p>
              </div>
            )}
            
            {/* Additional analyzed tracks */}
            {analyzedTracks.length > 0 && selectedTrack && (
              <div className="mt-6 space-y-4">
                <h2 className="text-lg font-semibold">Recent Analyses</h2>
                <div className="grid gap-4">
                  {analyzedTracks
                    .filter(t => t.id !== selectedTrackId)
                    .slice(0, 3)
                    .map(track => (
                      <div key={track.id} onClick={() => setSelectedTrackId(track.id)}>
                        <TrackAnalyzer track={track} />
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
