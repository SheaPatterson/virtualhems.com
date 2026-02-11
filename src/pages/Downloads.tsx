import { 
  Download, 
  Plane, 
  Monitor, 
  Smartphone, 
  Apple, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  FileCode,
  Cpu,
  Wifi,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const Downloads = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/10 to-background border-b">
        <div className="container mx-auto px-4 py-16 text-center">
          <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
            Professional Grade Plugins
          </Badge>
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tight mb-4">
            Downloads & Plugins
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect your flight simulator to VirtualHEMS for real-time telemetry, 
            mission tracking, and AI-powered dispatch communications.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 space-y-16">
        
        {/* Quick Start */}
        <section className="bg-primary/5 border-2 border-primary/20 rounded-3xl p-8">
          <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-3">
            <Settings className="w-6 h-6 text-primary" />
            Quick Start Guide
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-black shrink-0">1</div>
              <div>
                <h3 className="font-bold">Download Plugin</h3>
                <p className="text-sm text-muted-foreground">Get the plugin for your simulator (X-Plane or MSFS)</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-black shrink-0">2</div>
              <div>
                <h3 className="font-bold">Install & Launch</h3>
                <p className="text-sm text-muted-foreground">Follow the installation steps, then start your simulator</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-black shrink-0">3</div>
              <div>
                <h3 className="font-bold">Connect & Fly</h3>
                <p className="text-sm text-muted-foreground">Open VirtualHEMS web app, start a mission, and fly!</p>
              </div>
            </div>
          </div>
        </section>

        {/* Simulator Plugins */}
        <section>
          <h2 className="text-3xl font-black uppercase mb-8 text-center">Simulator Plugins</h2>
          
          <Tabs defaultValue="xplane" className="w-full">
            <TabsList className="grid w-full max-w-lg mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="xplane" className="text-lg font-bold">X-Plane 11/12</TabsTrigger>
              <TabsTrigger value="msfs" className="text-lg font-bold">MSFS 2020/2024</TabsTrigger>
            </TabsList>

            {/* X-Plane Tab */}
            <TabsContent value="xplane">
              <Card className="border-2">
                <CardHeader className="bg-blue-500/10 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                        <Plane className="w-8 h-8 text-blue-500" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">X-Plane Plugin v3.0</CardTitle>
                        <CardDescription>Interactive UI with Direct API Connection - No Bridge App Needed!</CardDescription>
                      </div>
                    </div>
                    <Badge variant="default" className="bg-green-500">Ready</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                    <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      🎉 New in v3.0: Interactive in-simulator UI! Select missions, manage phases, and view live telemetry without leaving X-Plane.
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-bold mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" /> Features
                      </h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <Monitor className="w-4 h-4 text-muted-foreground" />
                          Interactive in-sim UI window
                        </li>
                        <li className="flex items-center gap-2">
                          <Settings className="w-4 h-4 text-muted-foreground" />
                          Mission selection from active missions
                        </li>
                        <li className="flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-muted-foreground" />
                          Phase management (Dispatch → Complete)
                        </li>
                        <li className="flex items-center gap-2">
                          <Wifi className="w-4 h-4 text-muted-foreground" />
                          Live telemetry display (altitude, speed, fuel)
                        </li>
                        <li className="flex items-center gap-2">
                          <FileCode className="w-4 h-4 text-muted-foreground" />
                          Direct REST API connection (no bridge app!)
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold mb-3">Requirements</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• X-Plane 11.50+ or X-Plane 12</li>
                        <li>• FlyWithLua NG plugin</li>
                        <li>• LuaSocket library (for HTTP)</li>
                        <li>• VirtualHEMS backend running</li>
                      </ul>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-bold mb-4">Download Options</h4>
                    <div className="flex flex-wrap gap-4">
                      <Button asChild size="lg" className="gap-2">
                        <a href="/downloads/HEMS_XPlane_Plugin_v2.zip" download>
                          <Download className="w-5 h-5" />
                          Download Plugin Package (.zip)
                        </a>
                      </Button>
                      <Button asChild variant="outline" size="lg" className="gap-2">
                        <a href="/downloads/hems-dispatch-xp.lua" download>
                          <FileCode className="w-5 h-5" />
                          Legacy Script Only (.lua)
                        </a>
                      </Button>
                    </div>
                  </div>

                  <Accordion type="single" collapsible className="border rounded-xl">
                    <AccordionItem value="install" className="border-none">
                      <AccordionTrigger className="px-4 font-bold">
                        Installation Instructions
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <ol className="space-y-3 text-sm">
                          <li className="flex gap-3">
                            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">1</span>
                            <span>Install FlyWithLua NG plugin in X-Plane</span>
                          </li>
                          <li className="flex gap-3">
                            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">2</span>
                            <span>Install LuaSocket library (see documentation for your OS)</span>
                          </li>
                          <li className="flex gap-3">
                            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">3</span>
                            <span>Download and extract the plugin ZIP file</span>
                          </li>
                          <li className="flex gap-3">
                            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">4</span>
                            <span>Copy <code className="bg-muted px-1 rounded">init.lua</code> to:<br/>
                              <code className="bg-muted px-2 py-1 rounded text-xs block mt-1">X-Plane/Resources/plugins/FlyWithLua/Scripts/HEMS_Bridge/</code>
                            </span>
                          </li>
                          <li className="flex gap-3">
                            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">5</span>
                            <span>Restart X-Plane - plugin loads automatically</span>
                          </li>
                          <li className="flex gap-3">
                            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">6</span>
                            <span>Open HEMS window: Plugins → FlyWithLua → Macros → "HEMS Bridge: Toggle Window"</span>
                          </li>
                          <li className="flex gap-3">
                            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">7</span>
                            <span>Click "Refresh Missions" to load active missions, select one, and click "Start Mission"!</span>
                          </li>
                        </ol>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>

            {/* MSFS Tab */}
            <TabsContent value="msfs">
              <Card className="border-2">
                <CardHeader className="bg-purple-500/10 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center">
                        <Monitor className="w-8 h-8 text-purple-500" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">MSFS Plugin v3.0</CardTitle>
                        <CardDescription>Full Windows Application with Interactive UI - Direct API Connection!</CardDescription>
                      </div>
                    </div>
                    <Badge variant="default" className="bg-green-500">Ready</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                    <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                      🎉 New in v3.0: Full Windows application with mission selection, phase management, live telemetry display, and activity logs!
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-bold mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" /> Features
                      </h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <Monitor className="w-4 h-4 text-muted-foreground" />
                          Full Windows application UI
                        </li>
                        <li className="flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-muted-foreground" />
                          Native SimConnect SDK integration
                        </li>
                        <li className="flex items-center gap-2">
                          <Settings className="w-4 h-4 text-muted-foreground" />
                          Mission selection and management
                        </li>
                        <li className="flex items-center gap-2">
                          <Wifi className="w-4 h-4 text-muted-foreground" />
                          Live telemetry display (altitude, speed, fuel)
                        </li>
                        <li className="flex items-center gap-2">
                          <FileCode className="w-4 h-4 text-muted-foreground" />
                          Direct REST API connection (no bridge app!)
                        </li>
                        <li className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-muted-foreground" />
                          Activity log with real-time updates
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold mb-3">Requirements</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• MSFS 2020 or MSFS 2024</li>
                        <li>• Windows 10/11 (64-bit)</li>
                        <li>• .NET 6.0 or later</li>
                        <li>• VirtualHEMS backend running</li>
                      </ul>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-bold mb-4">Download</h4>
                    <div className="flex flex-wrap gap-4">
                      <Button asChild size="lg" className="gap-2">
                        <a href="/downloads/HEMS_MSFS_Plugin_v1.zip" download>
                          <Download className="w-5 h-5" />
                          Download MSFS Plugin (.zip)
                        </a>
                      </Button>
                    </div>
                  </div>

                  <Accordion type="single" collapsible className="border rounded-xl">
                    <AccordionItem value="install" className="border-none">
                      <AccordionTrigger className="px-4 font-bold">
                        Installation Instructions
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <ol className="space-y-3 text-sm">
                          <li className="flex gap-3">
                            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">1</span>
                            <span>Ensure .NET 6.0 or later is installed (download from Microsoft if needed)</span>
                          </li>
                          <li className="flex gap-3">
                            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">2</span>
                            <span>Download and extract the plugin ZIP file</span>
                          </li>
                          <li className="flex gap-3">
                            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">3</span>
                            <span>Launch MSFS and load any helicopter</span>
                          </li>
                          <li className="flex gap-3">
                            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">4</span>
                            <span>Run <code className="bg-muted px-1 rounded">HEMS_MSFS_Bridge.exe</code></span>
                          </li>
                          <li className="flex gap-3">
                            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">5</span>
                            <span>Main window appears - verify "SimConnect: Connected" shows green</span>
                          </li>
                          <li className="flex gap-3">
                            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">6</span>
                            <span>Click "Refresh Missions" to load active missions</span>
                          </li>
                          <li className="flex gap-3">
                            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">7</span>
                            <span>Select a mission and click "Start Mission" - telemetry begins streaming!</span>
                          </li>
                        </ol>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        {/* Desktop Apps */}
        <section>
          <h2 className="text-3xl font-black uppercase mb-8 text-center">Desktop Applications</h2>
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Windows App */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Monitor className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <CardTitle>Windows Desktop</CardTitle>
                    <CardDescription>Standalone bridge application</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600">Coming Soon</Badge>
                <p className="text-sm text-muted-foreground">
                  Native Windows application for direct simulator communication without browser dependency.
                </p>
                <Button disabled className="w-full gap-2">
                  <Download className="w-4 h-4" /> Windows x64 (.exe)
                </Button>
              </CardContent>
            </Card>

            {/* Mac App */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-500/20 rounded-xl flex items-center justify-center">
                    <Apple className="w-6 h-6 text-gray-500" />
                  </div>
                  <div>
                    <CardTitle>macOS Desktop</CardTitle>
                    <CardDescription>Universal binary (Intel + Apple Silicon)</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600">Coming Soon</Badge>
                <p className="text-sm text-muted-foreground">
                  Native macOS application supporting both Intel and Apple Silicon Macs.
                </p>
                <Button disabled className="w-full gap-2">
                  <Download className="w-4 h-4" /> macOS Universal (.dmg)
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Mobile Apps */}
        <section>
          <h2 className="text-3xl font-black uppercase mb-8 text-center">iPad & Mobile</h2>
          <Card className="border-2 max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-green-500" />
              </div>
              <CardTitle className="text-2xl">iPad EFB (Electronic Flight Bag)</CardTitle>
              <CardDescription>Optimized cockpit view for tablets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
                <p className="text-sm">
                  <strong>Available Now!</strong> Add VirtualHEMS to your iPad home screen for a native app-like experience.
                  The EFB view is optimized for landscape cockpit use with large touch targets.
                </p>
              </div>
              
              {/* Main EFB Button */}
              <Button asChild size="lg" className="w-full h-16 text-lg gap-3">
                <a href="/efb">
                  <Smartphone className="w-6 h-6" />
                  Open iPad EFB View
                </a>
              </Button>

              <div className="border-t pt-4">
                <h4 className="font-bold text-sm mb-3 text-center">Add to Home Screen:</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-muted/50 rounded-xl p-3">
                    <div className="font-bold flex items-center gap-2 mb-2">
                      <Apple className="w-4 h-4" /> iPad/iPhone
                    </div>
                    <ol className="text-xs text-muted-foreground space-y-1">
                      <li>1. Open Safari on this site</li>
                      <li>2. Tap the Share button</li>
                      <li>3. Select "Add to Home Screen"</li>
                    </ol>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-3">
                    <div className="font-bold flex items-center gap-2 mb-2">
                      <Monitor className="w-4 h-4" /> Desktop
                    </div>
                    <ol className="text-xs text-muted-foreground space-y-1">
                      <li>1. Click the install icon in URL bar</li>
                      <li>2. Or use Menu → Install App</li>
                      <li>3. App appears in dock/taskbar</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-xs text-center text-muted-foreground mb-3">
                  Native apps coming soon:
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <Button disabled variant="outline" className="h-12 gap-2">
                    <Apple className="w-4 h-4" />
                    <div className="text-left text-xs">
                      <div className="text-muted-foreground">Soon on</div>
                      <div className="font-bold">App Store</div>
                    </div>
                  </Button>
                  <Button disabled variant="outline" className="h-12 gap-2">
                    <Smartphone className="w-4 h-4" />
                    <div className="text-left text-xs">
                      <div className="text-muted-foreground">Soon on</div>
                      <div className="font-bold">Google Play</div>
                    </div>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Help Section */}
        <section className="bg-muted/30 rounded-3xl p-8 text-center">
          <h3 className="text-2xl font-black uppercase mb-4">Need Help?</h3>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Having trouble with installation or connectivity? Check out our documentation 
            or reach out for support.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Button variant="outline" asChild className="gap-2">
              <a href="/documentation">
                <FileCode className="w-4 h-4" /> Documentation
              </a>
            </Button>
            <Button variant="outline" asChild className="gap-2">
              <a href="https://github.com/virtualhems" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" /> GitHub
              </a>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Downloads;
