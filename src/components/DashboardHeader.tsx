import { Activity, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export const DashboardHeader = () => {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-neon">
              <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                Beat<span className="text-primary">Lab</span>
              </h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">
                Professional Track Analyzer
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" size="icon" className="hover:text-primary h-8 w-8 sm:h-10 sm:w-10">
              <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
