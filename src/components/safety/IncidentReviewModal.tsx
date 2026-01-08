"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2, ShieldAlert, FileText, ClipboardCheck } from 'lucide-react';
import { IncidentReport } from '@/hooks/useIncidentReports';
import { Separator } from '@/components/ui/separator';

interface IncidentReviewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    incident: IncidentReport | null;
    onResolve: (id: string, resolution: string) => Promise<void>;
    isResolving: boolean;
}

const IncidentReviewModal: React.FC<IncidentReviewModalProps> = ({ open, onOpenChange, incident, onResolve, isResolving }) => {
    const [resolution, setResolution] = useState('');

    const handleResolve = async () => {
        if (!incident || !resolution.trim()) return;
        
        try {
            await onResolve(incident.id, resolution);
            onOpenChange(false);
            setResolution('');
        } catch (e) {
            // Error handled by parent/hook
        }
    };

    if (!incident) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl border-t-8 border-destructive">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter flex items-center">
                        <ShieldAlert className="w-6 h-6 mr-2 text-destructive" /> Safety Review Case: {incident.mission_id}
                    </DialogTitle>
                    <DialogDescription>Document the organizational resolution for this safety event.</DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="p-4 bg-muted/50 rounded-xl border space-y-2">
                        <p className="text-[10px] font-black uppercase text-muted-foreground flex items-center">
                            <FileText className="w-3 h-3 mr-1" /> Initial Hazard Account
                        </p>
                        <p className="text-sm leading-relaxed italic">"{incident.description}"</p>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                        <Label htmlFor="resolution" className="text-[10px] font-black uppercase tracking-widest flex items-center">
                            <ClipboardCheck className="w-4 h-4 mr-1 text-primary" /> Management Resolution
                        </Label>
                        <Textarea 
                            id="resolution"
                            value={resolution}
                            onChange={(e) => setResolution(e.target.value)}
                            placeholder="Detail training assigned, equipment repaired, or protocol changes implemented..."
                            rows={6}
                            className="rounded-xl border-2 focus-visible:ring-primary"
                            disabled={isResolving || incident.status === 'Resolved'}
                        />
                    </div>
                </div>

                <DialogFooter className="bg-muted/30 -mx-6 -mb-6 p-6">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isResolving} className="font-bold">ABORT REVIEW</Button>
                    {incident.status === 'Open' && (
                        <Button 
                            onClick={handleResolve} 
                            disabled={isResolving || !resolution.trim()}
                            className="bg-green-600 hover:bg-green-700 text-white font-black italic uppercase shadow-lg h-12 px-8 rounded-xl"
                        >
                            {isResolving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                            CLOSE CASE
                        </Button>
                    )}
                    {incident.status === 'Resolved' && (
                        <Button disabled className="bg-green-600/50 text-white font-black italic uppercase shadow-lg h-12 px-8 rounded-xl">
                            <CheckCircle2 className="w-4 h-4 mr-2" /> CASE CLOSED
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default IncidentReviewModal;