import { useEffect, useState } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ShieldCheck } from 'lucide-react';
import { useTheme } from 'next-themes';

function Login() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const { theme } = useTheme();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                navigate('/dashboard', { replace: true });
            } else {
                setIsLoading(false);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                navigate('/dashboard', { replace: true });
            }
        });

        return () => subscription.unsubscribe();
    }, [navigate]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 space-y-10">
            <div className="flex flex-col items-center space-y-6">
                <div className="p-4 bg-primary/10 rounded-[3rem] border-2 border-primary/20 shadow-2xl transition-transform hover:scale-105">
                    <img 
                        src="/logo-main.png" 
                        alt="HEMS Simulation Logo" 
                        className="w-32 h-32 object-contain" 
                    />
                </div>
                <div className="text-center space-y-1">
                    <h1 className="text-4xl font-black tracking-tighter text-primary italic leading-none text-shadow-primary uppercase">HEMS SIMULATION</h1>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.5em] font-bold">Integrated Flight Operations</p>
                </div>
            </div>

            <Card className="w-full max-w-md shadow-2xl border-primary/20 bg-card/50 backdrop-blur-md overflow-hidden">
                <CardHeader className="bg-primary/5 border-b border-primary/10 py-4">
                    <CardTitle className="text-xs text-center font-black uppercase tracking-[0.2em] flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4 mr-2 text-primary" /> Secure Personnel Access
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="p-2 auth-ui-wrapper">
                        <Auth
                            supabaseClient={supabase}
                            providers={[]} 
                            appearance={{
                                theme: ThemeSupa,
                                variables: {
                                    default: {
                                        colors: {
                                            brand: 'hsl(39 100% 50%)',
                                            brandAccent: 'hsl(39 100% 40%)',
                                            inputBackground: 'transparent',
                                            inputText: theme === 'dark' ? '#ffffff' : '#000000',
                                            inputLabelText: theme === 'dark' ? '#a1a1aa' : '#4b5563',
                                            inputPlaceholder: theme === 'dark' ? '#71717a' : '#9ca3af',
                                            inputBorder: 'rgba(255, 165, 0, 0.2)',
                                            inputBorderHover: 'rgba(255, 165, 0, 0.5)',
                                            inputBorderFocus: 'rgba(255, 165, 0, 0.8)',
                                        },
                                    },
                                },
                            }}
                            theme={theme === 'dark' ? 'dark' : 'light'}
                            showLinks={true}
                        />
                    </div>
                </CardContent>
            </Card>
            
            <div className="flex flex-col items-center space-y-2">
                <p className="text-[9px] text-muted-foreground/60 uppercase tracking-[0.3em] font-mono">Terminal Protocol v5.2.0-STABLE</p>
                <div className="h-0.5 w-32 bg-primary/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary/40 w-1/3 animate-[pulse_2s_infinite]" />
                </div>
            </div>
        </div>
    );
}

export default Login;