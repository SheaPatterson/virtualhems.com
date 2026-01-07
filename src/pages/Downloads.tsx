import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Download, Loader2, FileText, Tag, ExternalLink, AlertCircle, Package } from 'lucide-react';
import { useContent } from '@/hooks/useContent';
import { useDownloads } from '@/hooks/useDownloads';
import SanitizedHTML from '@/components/SanitizedHTML';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/PageHeader';
import { Separator } from '@/components/ui/separator';

const Downloads = () => {
  const { data: pageContent, isLoading: isContentLoading } = useContent('downloads');
  const { downloads, isLoading: isDownloadsLoading, isError } = useDownloads();

  const isLoading = isContentLoading || isDownloadsLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto p-20 flex flex-col justify-center items-center h-64 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Indexing Resource Library...</p>
      </div>
    );
  }

  // Group downloads by category
  const categories = [...new Set(downloads.map(item => item.category))];

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-10 max-w-6xl">
      <PageHeader 
        title="Tactical Resource Center"
        description="Access essential manuals, checklists, and high-fidelity visual asset packages."
        icon={Download}
      />

      {/* Dynamic Introduction Content */}
      {pageContent?.body && (
        <Card className="bg-primary/[0.03] border-2 border-primary/10 shadow-inner rounded-3xl overflow-hidden">
          <CardContent className="pt-8 px-8">
            <SanitizedHTML 
              html={pageContent.body} 
              className="prose dark:prose-invert max-w-none text-muted-foreground font-medium leading-relaxed" 
            />
          </CardContent>
        </Card>
      )}

      {isError ? (
        <div className="p-10 bg-destructive/5 border-2 border-destructive/20 rounded-3xl flex flex-col items-center text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-destructive" />
            <div className="space-y-1">
                <p className="text-destructive font-black uppercase text-xl">Repository Sync Failure</p>
                <p className="text-sm text-muted-foreground">The system was unable to synchronize with the regional asset database.</p>
            </div>
        </div>
      ) : downloads.length === 0 ? (
        <div className="p-20 text-center border-2 border-dashed rounded-[2.5rem] bg-muted/20">
            <Package className="w-16 h-16 mx-auto text-muted-foreground opacity-10 mb-4" />
            <p className="text-muted-foreground font-bold italic">No public assets have been published to the registry.</p>
        </div>
      ) : (
        <div className="space-y-16">
            {categories.map(category => (
                <section key={category} className="space-y-6">
                    <div className="flex items-center space-x-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Tag className="w-5 h-5 text-primary" />
                        </div>
                        <h2 className="text-2xl font-black italic uppercase tracking-tight text-foreground">{category}</h2>
                        <Separator className="flex-grow opacity-50" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {downloads.filter(d => d.category === category).map(item => (
                            <Card key={item.id} className="hover:border-primary transition-all duration-300 group bg-card/40 backdrop-blur-sm border-2 rounded-2xl shadow-sm hover:shadow-xl">
                                <CardHeader className="p-6 pb-4">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="space-y-1">
                                            <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors leading-snug">{item.title}</CardTitle>
                                            <CardDescription className="text-xs font-medium leading-relaxed italic">
                                                {item.description || 'Standard operational resource.'}
                                            </CardDescription>
                                        </div>
                                        <div className="p-2 bg-muted rounded-xl text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 pt-0">
                                    <Separator className="mb-6 opacity-30" />
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Release Date</span>
                                            <span className="text-xs font-mono font-bold text-primary">{new Date(item.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <Button asChild size="lg" className="h-12 px-6 font-black italic uppercase shadow-lg rounded-xl">
                                            <a href={item.file_url} target="_blank" rel="noopener noreferrer">
                                                <Download className="w-4 h-4 mr-2" /> GET ASSET
                                            </a>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            ))}
        </div>
      )}

      <footer className="pt-32">
        <Card className="bg-muted border-none rounded-[2.5rem] overflow-hidden">
            <CardContent className="p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-2 text-center md:text-left">
                    <h4 className="text-2xl font-black italic uppercase">Resource Request</h4>
                    <p className="text-sm text-muted-foreground font-medium max-w-md">Contact the Regional Operations department to request specific flight manuals, medical protocols, or custom visual packages.</p>
                </div>
                <Button variant="outline" size="lg" className="h-14 px-10 border-2 font-black uppercase tracking-widest rounded-2xl hover:bg-background">
                    <ExternalLink className="w-5 h-5 mr-3" /> OPS PORTAL
                </Button>
            </CardContent>
        </Card>
      </footer>
    </div>
  );
};

export default Downloads;