import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Radio, Send, Volume2, Mic, MicOff } from 'lucide-react';
import { atcAPI, dispatchAPI } from '@/integrations/aws/api';
import { toast } from 'sonner';

interface Message {
  id: string;
  sender: 'pilot' | 'atc';
  text: string;
  timestamp: Date;
  controllerType?: string;
  frequency?: string;
}

interface ATCChatProps {
  missionId: string;
  callsign: string;
}

const ATCChat = ({ missionId, callsign }: ATCChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [controllerType, setControllerType] = useState<string>('tower');
  const [airportCode, setAirportCode] = useState('');
  const [frequency, setFrequency] = useState('');
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast.error(`Voice input error: ${event.error}`);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = (sender: 'pilot' | 'atc', text: string, controllerType?: string, frequency?: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender,
      text,
      timestamp: new Date(),
      controllerType,
      frequency
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const playAudio = async (text: string) => {
    try {
      const response = await dispatchAPI.generateTTS(text);
      if (response.audio_url) {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        audioRef.current = new Audio(response.audio_url);
        audioRef.current.play();
      }
    } catch (error) {
      console.error('TTS error:', error);
    }
  };

  const handleSend = async () => {
    if (!inputMessage.trim() || isProcessing) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsProcessing(true);

    // Add pilot message
    addMessage('pilot', userMessage);

    try {
      // Send to ATC API
      const response = await atcAPI.contact(
        missionId,
        userMessage,
        controllerType,
        airportCode || undefined,
        frequency || undefined
      );

      if (response.success && response.response_text) {
        // Add ATC response
        addMessage('atc', response.response_text, controllerType, frequency);
        
        // Play TTS
        await playAudio(response.response_text);
      } else {
        toast.error('ATC did not respond');
      }
    } catch (error: any) {
      toast.error(`ATC communication failed: ${error.message}`);
      addMessage('atc', '[No response from ATC]', controllerType);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast.error('Voice input not supported in this browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast.info('Listening... Speak your message');
      } catch (error) {
        console.error('Failed to start recognition:', error);
        toast.error('Failed to start voice input');
      }
    }
  };

  const getControllerLabel = (type: string) => {
    const labels: Record<string, string> = {
      ground: 'Ground',
      tower: 'Tower',
      departure: 'Departure',
      approach: 'Approach',
      center: 'Center'
    };
    return labels[type] || 'Tower';
  };

  const getFrequencyPlaceholder = (type: string) => {
    const frequencies: Record<string, string> = {
      ground: '121.9',
      tower: '118.1',
      departure: '125.8',
      approach: '119.3',
      center: '132.45'
    };
    return frequencies[type] || '118.1';
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Radio className="w-5 h-5" />
          ATC Communications
        </CardTitle>
        
        {/* Controller Selection */}
        <div className="grid grid-cols-3 gap-2 mt-2">
          <Select value={controllerType} onValueChange={setControllerType}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ground">Ground</SelectItem>
              <SelectItem value="tower">Tower</SelectItem>
              <SelectItem value="departure">Departure</SelectItem>
              <SelectItem value="approach">Approach</SelectItem>
              <SelectItem value="center">Center</SelectItem>
            </SelectContent>
          </Select>
          
          <Input
            placeholder="ICAO (e.g., KPIT)"
            value={airportCode}
            onChange={(e) => setAirportCode(e.target.value.toUpperCase())}
            className="h-8 text-xs"
            maxLength={4}
          />
          
          <Input
            placeholder={getFrequencyPlaceholder(controllerType)}
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="h-8 text-xs"
          />
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-3 pt-0 min-h-0">
        {/* Messages */}
        <ScrollArea className="flex-1 pr-3 mb-3" ref={scrollRef}>
          <div className="space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-8">
                <Radio className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Select controller and start communication</p>
                <p className="text-xs mt-1">Example: "{callsign}, request taxi"</p>
              </div>
            )}
            
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'pilot' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 ${
                    msg.sender === 'pilot'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {msg.sender === 'atc' && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase">
                        {msg.controllerType ? getControllerLabel(msg.controllerType) : 'ATC'}
                      </span>
                      {msg.frequency && (
                        <span className="text-xs opacity-70">{msg.frequency}</span>
                      )}
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {msg.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-3 py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="flex gap-2">
          <Button
            onClick={toggleVoiceInput}
            disabled={isProcessing}
            size="icon"
            variant={isListening ? 'destructive' : 'outline'}
            className={isListening ? 'animate-pulse' : ''}
          >
            {isListening ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </Button>
          <Input
            placeholder={`${callsign}, your message...`}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isProcessing || isListening}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!inputMessage.trim() || isProcessing || isListening}
            size="icon"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Quick Phrases */}
        <div className="flex flex-wrap gap-1 mt-2">
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-xs"
            onClick={() => setInputMessage(`${callsign}, request taxi`)}
            disabled={isProcessing}
          >
            Request Taxi
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-xs"
            onClick={() => setInputMessage(`${callsign}, ready for departure`)}
            disabled={isProcessing}
          >
            Ready for Departure
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-xs"
            onClick={() => setInputMessage(`${callsign}, request landing`)}
            disabled={isProcessing}
          >
            Request Landing
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-xs"
            onClick={() => setInputMessage(`${callsign}, emergency priority, medical flight`)}
            disabled={isProcessing}
          >
            Declare Emergency
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ATCChat;
