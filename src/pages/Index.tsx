import { useState } from "react";
import { Activity } from "lucide-react";
import { FileUpload } from "@/components/FileUpload";
import { TrackAnalyzer } from "@/components/TrackAnalyzer";
import { TrackList } from "@/components/TrackList";
import { DashboardHeader } from "@/components/DashboardHeader";
import { useToast } from "@/hooks/use-toast";

interface Track {
  id: string;
  name: string;
  size: number;
}

interface TrackData {
  id: string;
  name: string;
  tempo: number;
  key: string;
  energy: number;
}

// Mock analysis function - in production, this would call your API
const analyzeTrack = (file: File): TrackData => {
  const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const modes = ['maj', 'min'];
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    name: file.name.replace(/\.[^/.]+$/, ''),
    tempo: Math.floor(Math.random() * (140 - 100) + 100),
    key: `${keys[Math.floor(Math.random() * keys.length)]} ${modes[Math.floor(Math.random() * modes.length)]}`,
    energy: Math.floor(Math.random() * (95 - 60) + 60),
  };
};

const Index = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [analyzedTracks, setAnalyzedTracks] = useState<TrackData[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState<string>();
  const { toast } = useToast();

  const handleFilesSelected = (files: File[]) => {
    const newTracks: Track[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
    }));
    
    setTracks(prev => [...prev, ...newTracks]);
    
    // Simulate analysis
    const analyzed = files.map(analyzeTrack);
    setAnalyzedTracks(prev => [...prev, ...analyzed]);
    
    toast({
      title: "Tracks uploaded",
      description: `${files.length} track${files.length > 1 ? 's' : ''} ready for analysis`,
    });
  };

  const handleRemoveTrack = (id: string) => {
    setTracks(prev => prev.filter(t => t.id !== id));
    setAnalyzedTracks(prev => prev.filter(t => t.id !== id));
    if (selectedTrackId === id) {
      setSelectedTrackId(undefined);
    }
  };

  const selectedTrack = analyzedTracks.find(t => t.id === selectedTrackId);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column - Upload and Track List */}
          <div className="lg:col-span-1 space-y-6">
            <FileUpload onFilesSelected={handleFilesSelected} />
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
              <div className="h-full min-h-[500px] rounded-lg border-2 border-dashed border-border bg-card/50 flex flex-col items-center justify-center text-center p-8">
                <div className="p-4 rounded-full bg-muted mb-4">
                  <Activity className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Select a track to analyze
                </h3>
                <p className="text-muted-foreground max-w-md">
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
