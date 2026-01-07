import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Mic, Activity, Radio } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { MissionReport as IMissionReport } from '@/data/hemsData';
import { sendCrewMessageToAgent, fetchDispatchAudio } from '@/integrations/dispatch/api';
import { useMissionLogs } from '@/hooks/useMissionLogs';
import { toast } from 'sonner';

interface DispatcherChatProps {
    missionReport: IMissionReport | null;
}

// Audio elements for effects
// NOTE: User must place a short MP3 file for radio static at /public/audio/radio_static.mp3
const staticAudio = new Audio('/audio/radio_static.mp3'); 
staticAudio.volume = 0.3;

const DispatcherChat: React.FC<DispatcherChatProps> = ({ missionReport }) => {
    const { logs, addLog } = useMissionLogs(missionReport?.missionId);
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // NEW: High-Quality Audio Playback
    const playAudioFromUrl = (url: string) => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = url;
        } else {
            audioRef.current = new Audio(url);
        }

        // Add static before and after the main audio
        staticAudio.currentTime = 0;
        staticAudio.play();

        audioRef.current.onloadeddata = () => {
            // Stop static shortly after audio starts
            setTimeout(() => staticAudio.pause(), 500); 
            audioRef.current?.play();
        };

        audioRef.current.onended = () => {
            // Play static briefly after audio ends
            staticAudio.currentTime = 0;
            staticAudio.play();
            setTimeout(() => staticAudio.pause(), 500);
        };
    };

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript.toUpperCase());
                setIsListening(false);
                handleSend(transcript.toUpperCase());
            };

            recognitionRef.current.onerror = (event: any) => {
                toast.error(`Speech recognition error: ${event.error}`);
                setIsListening(false);
            };
            recognitionRef.current.onend = () => setIsListening(false);
        }
    }, []);

    const handlePTT = () => {
        if (!recognitionRef.current) {
            toast.error("Speech recognition not supported on this browser.");
            return;
        }
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            toast.info("Listening for voice command...");
            setIsListening(true);
            recognitionRef.current.start();
        }
    };

    const handleSend = async (manualText?: string) => {
        if (!missionReport) return;
        
        const text = manualText || input.trim();
        if (text === '') return;

        const callsign = missionReport.callsign || "HEMS UNIT";
        await addLog('Crew', text, callsign);
        setInput('');
        setIsProcessing(true);

        const response = await sendCrewMessageToAgent(missionReport.missionId, text);
        
        setIsProcessing(false);
        if (response) {
            await addLog('Dispatcher', response.responseText);
            
            // NEW: Fetch and play high-quality audio
            const audioUrl = await fetchDispatchAudio(response.responseText);
            if (audioUrl) {
                playAudioFromUrl(audioUrl);
            } else {
                console.warn("High-quality TTS failed. Audio playback skipped.");
            }
        }
    };

    // Removed the old useEffect that handled window.speechSynthesis

    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
    }, [logs, isProcessing]);

    if (!missionReport) return null;

    return (
        <Card className="h-full flex flex-col border-2 border-primary/20 bg-[#050505] text-[#00ff41] font-mono shadow-2xl overflow-hidden">
            <CardHeader className="p-3 border-b border-[#00ff41]/20 bg-black/40 shrink-0">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-[10px] tracking-widest uppercase font-black italic flex items-center">
                        <Radio className="w-3 h-3 mr-2 text-primary" /> TACTICAL COMMS STACK
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                        <div className={cn("w-2 h-2 rounded-full", isListening ? "bg-red-500 animate-pulse" : "bg-green-500")} />
                        <span className="text-[8px] font-bold uppercase">{isListening ? 'TX' : 'RX READY'}</span>
                    </div>
                </div>
            </CardHeader>
            
            <CardContent className="flex-1 min-h-0 p-0 relative">
                <ScrollArea className="h-full w-full absolute inset-0" ref={scrollAreaRef}>
                    <div className="p-4 space-y-4">
                        {logs.map((msg) => (
                            <div key={msg.id} className="animate-in fade-in slide-in-from-bottom-1">
                                <div className="flex justify-between items-center text-[7px] mb-1 opacity-50">
                                    <span className="font-black uppercase">{msg.sender === 'Crew' ? (msg.callsign || 'PILOT') : msg.sender}</span>
                                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}Z</span>
                                </div>
                                <div className={cn(
                                    "p-2 rounded border-l-2 text-xs",
                                    msg.sender === 'Dispatcher' ? "bg-[#00ff41]/5 border-[#00ff41]" : 
                                    msg.sender === 'System' ? "bg-primary/5 border-primary text-primary" : "bg-white/5 border-white/20"
                                )}>
                                    {msg.message}
                                </div>
                            </div>
                        ))}
                        {isProcessing && (
                            <div className="flex items-center space-x-2 text-[10px] animate-pulse">
                                <Activity className="w-3 h-3" />
                                <span>WAITING FOR DATA LINK...</span>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>

            <CardFooter className="p-4 border-t border-[#00ff41]/10 bg-black/60 flex flex-col gap-3">
                <Button 
                    onMouseDown={handlePTT}
                    onMouseUp={handlePTT}
                    className={cn(
                        "flex-grow h-14 font-black italic uppercase transition-all rounded-xl",
                        isListening ? "bg-red-600 text-white animate-pulse" : "bg-primary text-black"
                    )}
                >
                    <Mic className="w-5 h-5 mr-2" /> {isListening ? 'TRANSMITTING...' : 'PUSH TO TALK'}
                </Button>
                <div className="flex w-full space-x-2">
                    <Input
                        placeholder="MANUAL CMD..."
                        value={input}
                        onChange={(e) => setInput(e.target.value.toUpperCase())}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        className="bg-black border-[#00ff41]/20 text-[#00ff41] h-9 text-xs"
                    />
                    <Button onClick={() => handleSend()} size="sm" className="bg-[#00ff41] text-black h-9 px-4">
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
};

export default DispatcherChat;