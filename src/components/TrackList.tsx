import { Music2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Track {
  id: string;
  name: string;
  size: number;
}

interface TrackListProps {
  tracks: Track[];
  onRemove: (id: string) => void;
  onSelect: (id: string) => void;
  selectedId?: string;
}

export const TrackList = ({ tracks, onRemove, onSelect, selectedId }: TrackListProps) => {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="p-3 sm:p-4 border-b border-border">
        <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
          <Music2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          <span className="hidden sm:inline">Track Queue</span>
          <span className="sm:hidden">Tracks</span>
          <span className="text-xs sm:text-sm text-muted-foreground ml-auto">
            {tracks.length} / 50
          </span>
        </h2>
      </div>
      
      <ScrollArea className="h-[300px] sm:h-[400px]">
        <div className="p-2 space-y-1">
          {tracks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center text-muted-foreground">
              <Music2 className="h-10 w-10 sm:h-12 sm:w-12 mb-2 sm:mb-3 opacity-50" />
              <p className="text-xs sm:text-sm">No tracks uploaded yet</p>
            </div>
          ) : (
            tracks.map((track) => (
              <div
                key={track.id}
                onClick={() => onSelect(track.id)}
                className={`
                  group flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg cursor-pointer
                  transition-all duration-200
                  ${selectedId === track.id 
                    ? 'bg-primary/20 border border-primary' 
                    : 'hover:bg-muted/50 border border-transparent'
                  }
                `}
              >
                <div className={`
                  p-1.5 sm:p-2 rounded-md transition-colors duration-200
                  ${selectedId === track.id ? 'bg-primary/30' : 'bg-muted'}
                `}>
                  <Music2 className={`h-3 w-3 sm:h-4 sm:w-4 ${
                    selectedId === track.id ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium truncate">{track.name}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    {formatFileSize(track.size)}
                  </p>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(track.id);
                  }}
                  className="opacity-0 sm:group-hover:opacity-100 sm:opacity-0 opacity-100 transition-opacity hover:text-destructive h-7 w-7 sm:h-9 sm:w-9"
                >
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
