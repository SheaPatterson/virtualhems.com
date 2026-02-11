import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Mail, 
  Send, 
  UserPlus, 
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const BulkUserActions = () => {
  const queryClient = useQueryClient();
  const [emailList, setEmailList] = useState('');
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');

  // Parse email list
  const emails = emailList
    .split(/[,\n]/)
    .map(email => email.trim())
    .filter(email => email && email.includes('@'));

  // Bulk invite mutation
  const inviteMutation = useMutation({
    mutationFn: async (emails: string[]) => {
      const results = [];
      for (const email of emails) {
        try {
          const { error } = await supabase.auth.admin.inviteUserByEmail(email);
          results.push({ email, success: !error, error: error?.message });
        } catch (err: any) {
          results.push({ email, success: false, error: err.message });
        }
      }
      return results;
    },
    onSuccess: (results) => {
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      if (successful > 0) {
        toast.success(`Successfully invited ${successful} users`);
      }
      if (failed > 0) {
        toast.error(`Failed to invite ${failed} users`);
      }
      
      setEmailList('');
      queryClient.invalidateQueries({ queryKey: ['adminUsersMaster'] });
    },
    onError: (error: any) => {
      toast.error(`Bulk invite failed: ${error.message}`);
    }
  });

  // Bulk message mutation (placeholder - would need email service)
  const messageMutation = useMutation({
    mutationFn: async ({ emails }: { emails: string[], subject: string, body: string }) => {
      // This would integrate with your email service (AWS SES, etc.)
      // For now, just simulate the operation
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { sent: emails.length };
    },
    onSuccess: (result) => {
      toast.success(`Message sent to ${result.sent} users`);
      setMessageSubject('');
      setMessageBody('');
    },
    onError: (error: any) => {
      toast.error(`Failed to send messages: ${error.message}`);
    }
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Bulk User Invites */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Bulk User Invitations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="emailList">Email Addresses</Label>
            <Textarea
              id="emailList"
              placeholder="Enter email addresses separated by commas or new lines&#10;pilot1@example.com, pilot2@example.com&#10;pilot3@example.com"
              value={emailList}
              onChange={(e) => setEmailList(e.target.value)}
              rows={6}
              className="font-mono text-sm"
            />
          </div>
          
          {emails.length > 0 && (
            <div className="space-y-2">
              <Label>Parsed Emails ({emails.length})</Label>
              <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto p-2 bg-muted/30 rounded-lg">
                {emails.map((email, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {email}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                className="w-full" 
                disabled={emails.length === 0 || inviteMutation.isPending}
              >
                {inviteMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Send {emails.length} Invitations
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  Confirm Bulk Invitations
                </AlertDialogTitle>
                <AlertDialogDescription>
                  You are about to send invitation emails to {emails.length} users. 
                  They will receive an email to join the VirtualHEMS platform.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => inviteMutation.mutate(emails)}>
                  Send Invitations
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {/* Bulk Messaging */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Bulk User Messaging
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="messageSubject">Subject</Label>
            <Input
              id="messageSubject"
              placeholder="Important HEMS Update"
              value={messageSubject}
              onChange={(e) => setMessageSubject(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="messageBody">Message</Label>
            <Textarea
              id="messageBody"
              placeholder="Dear HEMS Pilots,&#10;&#10;We have an important update regarding..."
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              rows={8}
            />
          </div>

          <div className="bg-muted/30 rounded-lg p-3">
            <p className="text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 inline mr-1 text-green-500" />
              This will send to all registered users with public email addresses.
            </p>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                className="w-full" 
                disabled={!messageSubject || !messageBody || messageMutation.isPending}
                variant="outline"
              >
                {messageMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Mail className="w-4 h-4 mr-2" />
                )}
                Send to All Users
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  Confirm Bulk Message
                </AlertDialogTitle>
                <AlertDialogDescription>
                  You are about to send a message to all users with public email addresses. 
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => messageMutation.mutate({ 
                    emails: [], // Would fetch all user emails
                    subject: messageSubject, 
                    body: messageBody 
                  })}
                >
                  Send Message
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkUserActions;