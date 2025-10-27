import { Upload } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
}

export const FileUpload = ({ onFilesSelected }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(
      file => file.type.startsWith('audio/')
    );
    
    if (files.length === 0) {
      toast({
        title: "Invalid files",
        description: "Please upload audio files only",
        variant: "destructive",
      });
      return;
    }
    
    if (files.length > 50) {
      toast({
        title: "Too many files",
        description: "Maximum 50 files allowed",
        variant: "destructive",
      });
      return;
    }
    
    onFilesSelected(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length > 50) {
      toast({
        title: "Too many files",
        description: "Maximum 50 files allowed",
        variant: "destructive",
      });
      return;
    }
    
    onFilesSelected(files);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative overflow-hidden rounded-lg border-2 border-dashed 
        transition-all duration-300 cursor-pointer
        ${isDragging 
          ? 'border-primary bg-primary/10 shadow-glow-cyan' 
          : 'border-border bg-card hover:border-primary/50'
        }
      `}
    >
      <input
        type="file"
        multiple
        accept="audio/*"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className={`
          mb-4 rounded-full p-4 transition-all duration-300
          ${isDragging ? 'bg-primary/20 shadow-glow-cyan' : 'bg-muted'}
        `}>
          <Upload 
            className={`h-8 w-8 transition-colors duration-300 ${
              isDragging ? 'text-primary' : 'text-muted-foreground'
            }`} 
          />
        </div>
        
        <h3 className="text-lg font-semibold mb-2">
          Drop your tracks here
        </h3>
        
        <p className="text-sm text-muted-foreground mb-1">
          or click to browse
        </p>
        
        <p className="text-xs text-muted-foreground">
          Supports MP3, WAV, FLAC • Max 50 files
        </p>
      </div>
      
      {isDragging && (
        <div className="absolute inset-0 bg-gradient-neon pointer-events-none" />
      )}
    </div>
  );
};
