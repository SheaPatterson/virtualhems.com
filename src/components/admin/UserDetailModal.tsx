import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  User, 
  Mail, 
  MapPin, 
  Calendar, 
  Shield, 
  ShieldCheck, 
  Monitor, 
  Award, 
  MessageCircle, 
  Linkedin,
  Globe
} from 'lucide-react';

interface UserDetailModalProps {
  user: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMakeAdmin?: () => void;
  onRevokeAdmin?: () => void;
  onDeleteUser?: () => void;
  currentUserId?: string;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  open,
  onOpenChange,
  onMakeAdmin,
  onRevokeAdmin,
  onDeleteUser,
  currentUserId
}) => {
  if (!user) return null;

  const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown Pilot';
  const initials = (user.first_name?.[0] || '') + (user.last_name?.[0] || '');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <User className="w-5 h-5 text-primary" />
            User Profile Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-start gap-6">
            <Avatar className="h-20 w-20 border-4 border-primary/20">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-black">
                {initials || <User />}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <h2 className="text-2xl font-black tracking-tight">{fullName}</h2>
              <div className="flex flex-wrap gap-2">
                {user.isAdmin ? (
                  <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
                    <ShieldCheck className="w-3 h-3 mr-1" /> ADMIN
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="font-mono text-muted-foreground">PILOT</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground font-mono">ID: {user.id}</p>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Mail className="w-4 h-4 mr-2 text-primary" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {user.email_public && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{user.email_public}</span>
                </div>
              )}
              {user.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{user.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  Last Updated: {new Date(user.updated_at).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Professional Profile */}
          {(user.experience || user.simulators || user.bio) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Award className="w-4 h-4 mr-2 text-primary" />
                  Professional Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.experience && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      Experience Level
                    </p>
                    <p className="text-sm">{user.experience}</p>
                  </div>
                )}
                {user.simulators && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 flex items-center">
                      <Monitor className="w-3 h-3 mr-1" /> Equipment & Simulators
                    </p>
                    <p className="text-sm">{user.simulators}</p>
                  </div>
                )}
                {user.bio && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      Biography
                    </p>
                    <p className="text-sm leading-relaxed">{user.bio}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Social Links */}
          {user.social_links && (user.social_links.linkedin || user.social_links.discord || user.social_links.website) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Globe className="w-4 h-4 mr-2 text-primary" />
                  Social Presence
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {user.social_links.linkedin && (
                  <div className="flex items-center gap-2">
                    <Linkedin className="w-4 h-4 text-blue-600" />
                    <a 
                      href={user.social_links.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      LinkedIn Profile
                    </a>
                  </div>
                )}
                {user.social_links.discord && (
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm">{user.social_links.discord}</span>
                  </div>
                )}
                {user.social_links.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <a 
                      href={user.social_links.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      Personal Website
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Admin Actions */}
          {user.id !== currentUserId && (
            <>
              <Separator />
              <div className="flex flex-wrap gap-3">
                {user.isAdmin ? (
                  <Button 
                    variant="outline" 
                    onClick={onRevokeAdmin}
                    className="flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    Revoke Admin Access
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    onClick={onMakeAdmin}
                    className="flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Grant Admin Access
                  </Button>
                )}
                <Button 
                  variant="destructive" 
                  onClick={onDeleteUser}
                  className="flex items-center gap-2"
                >
                  Delete Account
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailModal;