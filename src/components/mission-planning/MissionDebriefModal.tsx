"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileText, ClipboardCheck, Loader2, CheckCircle2, Trophy, AlertTriangle, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface MissionDebriefModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (notes: string, score: number, summary: any) => Promise<void>;
}

const MissionDebriefModal: React.FC<MissionDebriefModalProps> = ({ open, onOpenChange, onConfirm }) => {
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFinalize = async () => {
        if (!notes.trim()) {
            toast.error("Required: Please provide a mission narrative.");
            return;
        }

        setIsSubmitting(true);
        try {
            // Mock AAR Scoring Logic
            const performanceScore = Math.floor(Math.random() * 20) + 80; // 80-100 range for active pilots
            const flightSummary = {
                vfr_compliance: true,
                fuel_efficiency: "Nominal",
                comm_clarity: "High"
            };

            await onConfirm(notes, performanceScore, flightSummary);
            onOpenChange(false);
        } catch (error) {
            toast.error("Failed to finalize report.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl border-t-8 border-primary">
                <DialogHeader>
                    <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter flex items-center">
                        <ClipboardCheck className="w-8 h-8 mr-3 text-primary" /> After Action Review (AAR)
                    </DialogTitle>
                    <DialogDescription className="text-base font-medium">
                        Log final mission narrative and perform performance validation.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="notes" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center">
                                <FileText className="w-3 h-3 mr-1" /> Tactical Narrative
                            </Label>
                            <Textarea 
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Detail environmental hazards, technical snags, or clinical highlights..."
                                rows={8}
                                className="rounded-2xl border-2 focus-visible:ring-primary text-sm leading-relaxed bg-muted/20"
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="p-6 bg-primary/5 border-2 border-primary/20 rounded-[2rem] shadow-inner text-center">
                            <Trophy className="w-10 h-10 text-primary mx-auto mb-2" />
                            <h4 className="text-sm font-black uppercase tracking-widest text-primary/80">Projected Performance</h4>
                            <p className="text-5xl font-mono font-black italic text-primary">--%</p>
                            <p className="text-[9px] text-muted-foreground uppercase tracking-tighter mt-2">Calculated upon finalization</p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-xl border border-border/50">
                                <Zap className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                <p className="text-[10px] text-muted-foreground leading-tight">
                                    <strong>Data Integrity:</strong> Finalizing will lock the GPS breadcrumbs and comms logs for regional audit.
                                </p>
                            </div>
                            <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-xl border border-border/50">
                                <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-muted-foreground leading-tight">
                                    <strong>Risk Assessment:</strong> Ensure any incidents or near-misses are detailed in the narrative above.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="bg-muted/30 -mx-6 -mb-6 p-6">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting} className="font-bold">ABORT</Button>
                    <Button 
                        onClick={handleFinalize} 
                        disabled={isSubmitting}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-black italic uppercase shadow-xl h-14 px-12 rounded-2xl text-lg transition-transform hover:scale-105"
                    >
                        {isSubmitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
                        FINALIZE SORTIE
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default MissionDebriefModal;