"use client";

import { Apple, Monitor, Download, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const DesktopDownload = () => {
  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  return (
    <Card className="border-2 border-primary/20 bg-primary/5 rounded-[2.5rem] overflow-hidden shadow-2xl group hover:border-primary/40 transition-all duration-500">
      <CardContent className="p-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center space-x-6">
          <div className="p-5 bg-primary/10 rounded-3xl border border-primary/20 group-hover:scale-110 transition-transform duration-500">
            {isMac ? <Apple className="w-10 h-10 text-primary" /> : <Monitor className="w-10 h-10 text-primary" />}
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-primary">
              <Zap className="w-4 h-4 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Native Desktop Client</span>
            </div>
            <h3 className="text-3xl font-black italic uppercase tracking-tighter">
              DOWNLOAD FOR {isMac ? 'MACOS' : 'WINDOWS'}
            </h3>
            <p className="text-sm text-muted-foreground font-medium">
              v5.2.0-STABLE | Includes Auto-Update & System Tray Integration
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <Button asChild size="lg" className="h-16 px-10 text-lg font-black italic uppercase shadow-xl rounded-2xl w-full sm:w-auto">
            <a href={`/downloads/hems-dispatch.zip`} download>
              <Download className="w-5 h-5 mr-2" /> GET INSTALLER
            </a>
          </Button>
          <Button variant="ghost" className="text-xs font-bold uppercase tracking-widest hover:text-primary no-drag">
            All Platforms <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DesktopDownload;