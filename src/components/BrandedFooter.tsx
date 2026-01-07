import { ShieldCheck } from 'lucide-react';

export const BrandedFooter = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="mt-auto py-6 border-t bg-card/30 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="flex items-center space-x-2 text-primary/80">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-widest font-mono">
              Secure Operations Protocol
            </span>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground font-medium">
              &copy; {currentYear} SRP Consulting Group, LLC. All rights reserved.
            </p>
            <p className="text-[10px] text-muted-foreground/60 uppercase tracking-tighter mt-1">
              Mission Critical Systems & Training Solutions
            </p>
          </div>
          
          <div className="flex items-center space-x-4 pt-2">
            <div className="h-px w-8 bg-border" />
            <span className="text-[10px] text-muted-foreground/40 font-mono">
              v5.2.0-STABLE
            </span>
            <div className="h-px w-8 bg-border" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default BrandedFooter;