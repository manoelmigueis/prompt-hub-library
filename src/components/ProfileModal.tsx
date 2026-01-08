import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Instagram, Twitter, Youtube, Globe, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { UserProfile } from '@/hooks/useAuth';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  onSave: (updates: Partial<UserProfile>) => Promise<{ error: any }>;
}

export function ProfileModal({ isOpen, onClose, profile, onSave }: ProfileModalProps) {
  const [displayName, setDisplayName] = useState('');
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [youtube, setYoutube] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [website, setWebsite] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setInstagram(profile.instagram || '');
      setTwitter(profile.twitter || '');
      setYoutube(profile.youtube || '');
      setTiktok(profile.tiktok || '');
      setWebsite(profile.website || '');
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      display_name: displayName,
      instagram: instagram || null,
      twitter: twitter || null,
      youtube: youtube || null,
      tiktok: tiktok || null,
      website: website || null
    });
    setSaving(false);
    onClose();
  };

  const initials = displayName?.slice(0, 2).toUpperCase() || 'U';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-wider">MEU PERFIL</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Avatar */}
          <div className="flex justify-center">
            <Avatar className="h-24 w-24 border-4 border-primary/20">
              <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="displayName">Nome de Exibição</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Seu nome"
              className="h-12 rounded-xl"
            />
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <Label className="text-muted-foreground">Redes Sociais</Label>
            
            <div className="relative">
              <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-500" />
              <Input
                value={instagram}
                onChange={(e) => setInstagram(e.target.value.replace('@', ''))}
                placeholder="seu.instagram"
                className="h-12 pl-12 rounded-xl"
              />
            </div>

            <div className="relative">
              <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
              <Input
                value={twitter}
                onChange={(e) => setTwitter(e.target.value.replace('@', ''))}
                placeholder="seu_twitter"
                className="h-12 pl-12 rounded-xl"
              />
            </div>

            <div className="relative">
              <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
              <Input
                value={youtube}
                onChange={(e) => setYoutube(e.target.value)}
                placeholder="canal-youtube"
                className="h-12 pl-12 rounded-xl"
              />
            </div>

            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
              <Input
                value={tiktok}
                onChange={(e) => setTiktok(e.target.value.replace('@', ''))}
                placeholder="seu.tiktok"
                className="h-12 pl-12 rounded-xl"
              />
            </div>

            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="seusite.com"
                className="h-12 pl-12 rounded-xl"
              />
            </div>
          </div>

          <Button 
            onClick={handleSave} 
            className="w-full h-12 btn-gradient rounded-xl gap-2"
            disabled={saving}
          >
            <Save className="w-4 h-4" />
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}