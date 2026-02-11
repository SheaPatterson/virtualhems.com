import { 
  Brain, 
  Mic, 
  Radio, 
  MessageSquare, 
  Sparkles,
  Volume2,
  Zap,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AIFeatures = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/10 to-background border-b">
        <div className="container mx-auto px-4 py-16 text-center">
          <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
            <Sparkles className="w-3 h-3 mr-1" />
            Powered by AWS Bedrock AI
          </Badge>
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tight mb-4">
            AI-Powered Communications
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience realistic HEMS operations with AI Dispatch coordination and 
            professional ATC communications, all with voice input support.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 space-y-16">
        
        {/* Overview Cards */}
        <section className="grid md:grid-cols-3 gap-6">
          <Card className="border-2 border-blue-500/20">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-3">
                <MessageSquare className="w-6 h-6 text-blue-500" />
              </div>
              <CardTitle>AI Dispatch</CardTitle>
              <CardDescription>Intelligent mission coordination</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Get real-time mission updates, weather briefings, and operational support 
                from your AI dispatch coordinator.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-500/20">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-3">
                <Radio className="w-6 h-6 text-purple-500" />
              </div>
              <CardTitle>ATC Communications</CardTitle>
              <CardDescription>5 realistic controller types</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Communicate with Ground, Tower, Departure, Approach, and Center controllers 
                using proper aviation phraseology.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-500/20">
            <CardHeader>
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-3">
                <Mic className="w-6 h-6 text-green-500" />
              </div>
              <CardTitle>Voice Input</CardTitle>
              <CardDescription>Hands-free operation</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Speak your messages naturally - AI transcribes and sends. Keep your hands 
                on the controls during critical operations.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Main Features Tabs */}
        <section>
          <h2 className="text-3xl font-black uppercase mb-8 text-center">AI Communication Systems</h2>
          
          <Tabs defaultValue="dispatch" className="w-full">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 mb-8">
              <TabsTrigger value="dispatch" className="text-lg font-bold">Dispatch</TabsTrigger>
              <TabsTrigger value="atc" className="text-lg font-bold">ATC</TabsTrigger>
              <TabsTrigger value="voice" className="text-lg font-bold">Voice</TabsTrigger>
            </TabsList>

            {/* Dispatch Tab */}
            <TabsContent value="dispatch">
              <Card className="border-2">
                <CardHeader className="bg-blue-500/10 border-b">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                      <MessageSquare className="w-8 h-8 text-blue-500" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">AI Dispatch Coordinator</CardTitle>
                      <CardDescription>Your intelligent mission support partner</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-bold mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" /> What Dispatch Can Do
                      </h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <ArrowRight className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                          <span>Provide mission briefings and updates</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ArrowRight className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                          <span>Share weather conditions and forecasts</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ArrowRight className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                          <span>Coordinate patient care and transport</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ArrowRight className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                          <span>Monitor fuel and suggest alternates</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ArrowRight className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                          <span>Provide emergency support and guidance</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ArrowRight className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                          <span>Answer operational questions</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold mb-3">Example Interactions</h4>
                      <div className="space-y-3 text-sm">
                        <div className="bg-muted/50 rounded-lg p-3">
                          <p className="font-semibold text-blue-600 dark:text-blue-400 mb-1">Pilot:</p>
                          <p className="text-muted-foreground">"What's the patient status?"</p>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-3">
                          <p className="font-semibold text-green-600 dark:text-green-400 mb-1">Dispatch:</p>
                          <p className="text-muted-foreground">"Patient is stable, critical transport. ETA to hospital 12 minutes."</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-bold mb-4">How to Use</h4>
                    <ol className="space-y-2 text-sm">
                      <li className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">1</span>
                        <span>Start a mission from Mission Planning page</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">2</span>
                        <span>Go to Mission Tracking page and select "Dispatch" tab</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">3</span>
                        <span>Type or speak your message to dispatch</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">4</span>
                        <span>Receive intelligent, context-aware responses</span>
                      </li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ATC Tab */}
            <TabsContent value="atc">
              <Card className="border-2">
                <CardHeader className="bg-purple-500/10 border-b">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center">
                      <Radio className="w-8 h-8 text-purple-500" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">ATC Communications</CardTitle>
                      <CardDescription>Professional air traffic control simulation</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-bold mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" /> 5 Controller Types
                      </h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <Badge variant="outline" className="shrink-0">Ground</Badge>
                          <span>Taxi instructions, parking, ground movement</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Badge variant="outline" className="shrink-0">Tower</Badge>
                          <span>Takeoff/landing clearances, runway ops</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Badge variant="outline" className="shrink-0">Departure</Badge>
                          <span>Initial climb, traffic advisories, handoffs</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Badge variant="outline" className="shrink-0">Approach</Badge>
                          <span>Descent instructions, approach clearances</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Badge variant="outline" className="shrink-0">Center</Badge>
                          <span>Enroute flight following, altitude changes</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold mb-3">Realistic Features</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Proper ATC phraseology</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Context-aware responses</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Emergency priority handling</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Traffic advisories</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Weather information</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Text-to-speech audio</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-bold mb-4">Example Communication</h4>
                    <div className="space-y-3 text-sm">
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="font-semibold text-blue-600 dark:text-blue-400 mb-1">Pilot:</p>
                        <p className="text-muted-foreground">"STAT-1, request taxi"</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="font-semibold text-purple-600 dark:text-purple-400 mb-1">Ground:</p>
                        <p className="text-muted-foreground">"STAT-1, Ground, taxi to runway 28 via taxiway Alpha, hold short of runway 28, altimeter 30.12"</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="font-semibold text-blue-600 dark:text-blue-400 mb-1">Pilot:</p>
                        <p className="text-muted-foreground">"STAT-1, ready for departure, runway 28"</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="font-semibold text-purple-600 dark:text-purple-400 mb-1">Tower:</p>
                        <p className="text-muted-foreground">"STAT-1, Tower, runway 28, cleared for takeoff, wind 270 at 8, emergency priority approved"</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-bold mb-4">How to Use</h4>
                    <ol className="space-y-2 text-sm">
                      <li className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">1</span>
                        <span>During an active mission, go to Mission Tracking page</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">2</span>
                        <span>Click the "ATC" tab (next to Dispatch)</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">3</span>
                        <span>Select appropriate controller type for your phase of flight</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">4</span>
                        <span>Enter airport code and frequency (optional but recommended)</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">5</span>
                        <span>Type or speak your message using standard phraseology</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">6</span>
                        <span>Receive realistic ATC responses with audio playback</span>
                      </li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Voice Tab */}
            <TabsContent value="voice">
              <Card className="border-2">
                <CardHeader className="bg-green-500/10 border-b">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center">
                      <Mic className="w-8 h-8 text-green-500" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Voice Input</CardTitle>
                      <CardDescription>Hands-free communication for realistic operations</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-bold mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" /> Features
                      </h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <Mic className="w-4 h-4 text-muted-foreground" />
                          <span>Hands-free operation - keep hands on controls</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Brain className="w-4 h-4 text-muted-foreground" />
                          <span>Natural speech recognition</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-muted-foreground" />
                          <span>Real-time transcription</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Volume2 className="w-4 h-4 text-muted-foreground" />
                          <span>Works with both Dispatch and ATC</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-muted-foreground" />
                          <span>Review before sending</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-muted-foreground" />
                          <span>Browser-based (no extra software)</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold mb-3">Supported Browsers</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Chrome (Desktop & Mobile)</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Edge (Desktop)</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Safari (macOS & iOS)</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Opera (Desktop)</span>
                        </li>
                      </ul>
                      <p className="text-xs text-muted-foreground mt-3">
                        The microphone button appears automatically if your browser supports voice input.
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-bold mb-4">How to Use Voice Input</h4>
                    <ol className="space-y-2 text-sm">
                      <li className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">1</span>
                        <span>Allow microphone access when prompted (first time only)</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">2</span>
                        <span>Click the microphone button in Dispatch or ATC chat</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">3</span>
                        <span>Button turns red and pulses - start speaking</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">4</span>
                        <span>Speak your message clearly using standard phraseology</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">5</span>
                        <span>Voice input stops automatically when you finish</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">6</span>
                        <span>Review transcription and click Send</span>
                      </li>
                    </ol>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-bold mb-4">Tips for Best Results</h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="font-semibold mb-2">✅ Do:</p>
                        <ul className="space-y-1 text-muted-foreground">
                          <li>• Speak clearly and at normal pace</li>
                          <li>• Use standard aviation terms</li>
                          <li>• Reduce background noise</li>
                          <li>• Use a good microphone/headset</li>
                        </ul>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="font-semibold mb-2">❌ Avoid:</p>
                        <ul className="space-y-1 text-muted-foreground">
                          <li>• Speaking too fast or mumbling</li>
                          <li>• Noisy environments</li>
                          <li>• Poor quality microphones</li>
                          <li>• Non-standard terminology</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        {/* Technical Details */}
        <section className="bg-muted/30 rounded-3xl p-8">
          <h3 className="text-2xl font-black uppercase mb-6 text-center">Powered by AWS AI Services</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  AWS Bedrock
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Claude 3 Sonnet powers both Dispatch and ATC with context-aware, 
                  intelligent responses using advanced language understanding.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-primary" />
                  AWS Polly
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Neural text-to-speech converts ATC responses to realistic audio, 
                  enhancing immersion with natural-sounding voice output.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mic className="w-5 h-5 text-primary" />
                  Web Speech API
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Browser-native speech recognition enables voice input without 
                  additional software, processing locally for privacy.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Use Cases */}
        <section>
          <h3 className="text-2xl font-black uppercase mb-6 text-center">Real-World Use Cases</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  Training & Practice
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p>Perfect for pilots training for HEMS operations:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Practice proper radio communications</li>
                  <li>• Learn ATC phraseology</li>
                  <li>• Simulate emergency scenarios</li>
                  <li>• Build muscle memory for procedures</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-500" />
                  Realistic Simulation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p>Enhance your flight simulation experience:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Immersive HEMS operations</li>
                  <li>• Realistic mission coordination</li>
                  <li>• Professional ATC interactions</li>
                  <li>• Voice-controlled communications</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Getting Started */}
        <section className="bg-primary/5 border-2 border-primary/20 rounded-3xl p-8 text-center">
          <h3 className="text-2xl font-black uppercase mb-4">Ready to Experience AI-Powered HEMS?</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Start a mission and communicate with AI Dispatch and ATC using voice or text. 
            Experience the most realistic HEMS simulation available.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Button asChild size="lg" className="gap-2">
              <a href="/generate">
                <Sparkles className="w-5 h-5" />
                Start a Mission
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2">
              <a href="/documentation">
                <MessageSquare className="w-5 h-5" />
                View Documentation
              </a>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AIFeatures;
