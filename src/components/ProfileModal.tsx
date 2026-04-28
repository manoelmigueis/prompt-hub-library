import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Instagram, Twitter, Youtube, Globe, Save, Camera, Loader2, Check, MessageCircle } from 'lucide-react';
import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { UserProfile } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  onSave: (updates: Partial<UserProfile>) => Promise<{ error: any }>;
}

const CROP_PREVIEW_SIZE = 192;
const CROP_OUTPUT_SIZE = 512;

export function ProfileModal({ isOpen, onClose, profile, onSave }: ProfileModalProps) {
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [youtube, setYoutube] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [website, setWebsite] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropOffsetX, setCropOffsetX] = useState(0);
  const [cropOffsetY, setCropOffsetY] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setBio(profile.bio || '');
      setWhatsapp(profile.whatsapp || '');
      setInstagram(profile.instagram || '');
      setTwitter(profile.twitter || '');
      setYoutube(profile.youtube || '');
      setTiktok(profile.tiktok || '');
      setWebsite(profile.website || '');
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile]);

  const resetCropState = () => {
    setCropImageSrc(null);
    setCropZoom(1);
    setCropOffsetX(0);
    setCropOffsetY(0);
  };

  const handleAvatarSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Formato inválido. Use JPG, PNG ou WebP.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCropImageSrc(reader.result as string);
      setCropZoom(1);
      setCropOffsetX(0);
      setCropOffsetY(0);
    };
    reader.onerror = () => toast.error('Não foi possível carregar a imagem.');
    reader.readAsDataURL(file);

    e.target.value = '';
  };

  const createCroppedAvatarBlob = (imageSrc: string) =>
    new Promise<Blob>((resolve, reject) => {
      const image = new Image();

      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = CROP_OUTPUT_SIZE;
        canvas.height = CROP_OUTPUT_SIZE;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Falha ao processar imagem'));
          return;
        }

        const baseScale = Math.max(
          CROP_OUTPUT_SIZE / image.width,
          CROP_OUTPUT_SIZE / image.height,
        );
        const finalScale = baseScale * cropZoom;

        const drawWidth = image.width * finalScale;
        const drawHeight = image.height * finalScale;

        const offsetScale = CROP_OUTPUT_SIZE / CROP_PREVIEW_SIZE;
        const drawX = (CROP_OUTPUT_SIZE - drawWidth) / 2 + cropOffsetX * offsetScale;
        const drawY = (CROP_OUTPUT_SIZE - drawHeight) / 2 + cropOffsetY * offsetScale;

        ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Falha ao gerar arquivo da imagem'));
              return;
            }
            resolve(blob);
          },
          'image/jpeg',
          0.92,
        );
      };

      image.onerror = () => reject(new Error('Falha ao abrir imagem para recorte'));
      image.src = imageSrc;
    });

  const handleApplyAvatarCrop = async () => {
    if (!cropImageSrc || !profile) return;

    setUploadingAvatar(true);

    try {
      const croppedBlob = await createCroppedAvatarBlob(cropImageSrc);
      const fileName = `${profile.id}/${Date.now()}.jpg`;

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, croppedBlob, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'image/jpeg',
        });

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(data.path);

      setAvatarUrl(publicUrl);
      resetCropState();
      toast.success('Foto ajustada! Agora clique em “Salvar Alterações”.');
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error('Erro ao recortar/enviar a foto. Tente novamente.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const result = await onSave({
      display_name: displayName,
      bio: bio || null,
      whatsapp: whatsapp || null,
      instagram: instagram || null,
      twitter: twitter || null,
      youtube: youtube || null,
      tiktok: tiktok || null,
      website: website || null,
      avatar_url: avatarUrl,
    });
    setSaving(false);

    if (!result.error) {
      onClose();
    }
  };

  const initials = displayName?.slice(0, 2).toUpperCase() || 'U';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto rounded-2xl overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-wider">MEU PERFIL</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Avatar with upload */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-primary/20">
                <AvatarImage src={avatarUrl || undefined} alt={displayName} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
              >
                {uploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarSelect}
                className="hidden"
              />
            </div>

            {!cropImageSrc && (
              <p className="text-xs text-muted-foreground text-center">
                Clique na câmera para selecionar, ajustar e recortar sua foto.
              </p>
            )}
          </div>

          {cropImageSrc && (
            <div className="space-y-4 rounded-xl border border-border p-4 bg-muted/20">
              <p className="text-sm font-medium">Ajuste e recorte da foto</p>

              <div className="mx-auto h-48 w-48 overflow-hidden rounded-full border-2 border-primary/40 bg-background">
                <img
                  src={cropImageSrc}
                  alt="Recorte do avatar"
                  className="h-full w-full object-cover select-none"
                  style={{
                    transform: `translate(${cropOffsetX}px, ${cropOffsetY}px) scale(${cropZoom})`,
                  }}
                  draggable={false}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Zoom</Label>
                <input
                  type="range"
                  min={1}
                  max={2.5}
                  step={0.01}
                  value={cropZoom}
                  onChange={(e) => setCropZoom(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Posição horizontal</Label>
                <input
                  type="range"
                  min={-90}
                  max={90}
                  step={1}
                  value={cropOffsetX}
                  onChange={(e) => setCropOffsetX(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Posição vertical</Label>
                <input
                  type="range"
                  min={-90}
                  max={90}
                  step={1}
                  value={cropOffsetY}
                  onChange={(e) => setCropOffsetY(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={resetCropState}>
                  Cancelar
                </Button>
                <Button type="button" className="flex-1 gap-2" onClick={handleApplyAvatarCrop} disabled={uploadingAvatar}>
                  {uploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Aplicar recorte
                </Button>
              </div>
            </div>
          )}

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

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio (aparece no seu portfólio)</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Conte um pouco sobre você…"
              maxLength={300}
              rows={3}
              className="rounded-xl"
            />
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <Label className="text-muted-foreground">Redes Sociais & Contato</Label>

            <div className="relative">
              <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
              <Input
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="WhatsApp (ex: 5511999999999)"
                className="h-12 pl-12 rounded-xl"
              />
            </div>

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
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
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
            className="w-full h-12 btn-gradient rounded-xl gap-2 mb-4"
            disabled={saving || uploadingAvatar || !!cropImageSrc}
          >
            <Save className="w-4 h-4" />
            {saving ? 'Salvando...' : cropImageSrc ? 'Aplique o recorte para salvar' : 'Salvar Alterações'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
