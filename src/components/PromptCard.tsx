import { Prompt } from '@/types/prompt';
import { Check, Copy, Download, Eye, Heart, Loader2, Pencil, User } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface PromptCardProps {
  prompt: Prompt;
  onClick: () => void;
  onCopy: (id: string) => void | Promise<void>;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  isAdmin?: boolean;
  onEdit?: (prompt: Prompt) => void;
  layout?: 'grid' | 'list';
}

export function PromptCard({ prompt, onClick, onCopy, isFavorite, onToggleFavorite, isAdmin, onEdit, layout = 'grid' }: PromptCardProps) {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Serve a small thumbnail via Supabase Storage render transform.
  // Original images are 1-3MB — thumbs are ~30-80KB, drastically reducing load time.
  const buildThumb = (url: string | undefined, width: number): string | undefined => {
    if (!url) return url;
    if (!url.includes('/storage/v1/object/public/')) return url;
    const rendered = url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');
    const sep = rendered.includes('?') ? '&' : '?';
    return `${rendered}${sep}width=${width}&quality=70&resize=contain`;
  };
  const thumbUrl = buildThumb(prompt.imageUrl, layout === 'list' ? 200 : 600);

  
  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await onCopy(prompt.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.(prompt.id);
  };

  const isNew = (Date.now() - prompt.createdAt.getTime()) < 7 * 24 * 60 * 60 * 1000;
  
  // Get category label
  const getCategoryLabel = () => {
    const labels: Record<string, string> = {
      'retrato-realista': 'Retrato Realista',
      'foto-artistica': 'Foto Artística',
      'moda-estilo': 'Moda & Estilo',
      'cenarios': 'Cenários',
      'profile': 'Perfil',
      'social-media': 'Mídias Sociais',
      'video-effect': 'Video Effect',
      'body-art': 'Body Painting',
      'fotografia': 'Fotografia',
      'arte-digital': 'Arte Digital',
      'infographic': 'Infográfico',
      'youtube': 'YouTube',
      'comics': 'Quadrinhos',
      'poster': 'Pôster',
      'app-design': 'Design App',
      'logo-marca': 'Logo / Marca',
      'outro': 'Outro',
    };
    return labels[prompt.category] || prompt.category;
  };
  
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(prompt);
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!prompt.imageUrl || isDownloading) return;
    setIsDownloading(true);
    console.log('[ImageCard - Admin Download] Starting:', prompt.imageUrl);
    try {
      const response = await fetch(prompt.imageUrl);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${prompt.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'image'}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Download iniciado!');
    } catch (err) {
      console.error('[ImageCard - Admin Download] Error:', err);
      toast.error('Erro ao baixar imagem.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (layout === 'list') {
    return (
      <article 
        className="prompt-card cursor-pointer group flex flex-row items-center gap-3 p-3"
        onClick={onClick}
      >
        {/* Thumbnail */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-lg overflow-hidden">
          {prompt.imageUrl ? (
            <img 
              src={thumbUrl} 
              alt={prompt.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none select-none"
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              loading="lazy"
              decoding="async"
            />

          ) : (
            <div className="w-full h-full bg-primary/20 flex items-center justify-center">
              <span className="text-2xl opacity-50">📷</span>
            </div>
          )}
          {isAdmin && (
            <button
              onClick={handleEdit}
              className="absolute top-1 right-1 bg-background/70 backdrop-blur-sm rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-primary/80 hover:text-primary-foreground min-w-[44px] min-h-[44px] flex items-center justify-center"
              title="Editar"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-primary text-primary-foreground border-0 text-[10px] px-2 py-0.5 shrink-0">
              {getCategoryLabel()}
            </Badge>
            {isNew && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/50 text-primary shrink-0">NEW</Badge>
            )}
          </div>
          <h3 className="font-display text-sm tracking-wide leading-tight line-clamp-1 group-hover:text-primary transition-colors">
            {prompt.title}
          </h3>
          <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-1">
            {prompt.description}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <Avatar className="h-4 w-4 shrink-0">
              <AvatarImage src={prompt.authorAvatar} alt={prompt.author} />
              <AvatarFallback className="bg-primary/20 text-primary text-[7px] font-bold">
                {prompt.author?.slice(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="text-[10px] text-muted-foreground truncate">{prompt.author}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5">
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Eye className="w-3 h-3" />{prompt.viewCount}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Copy className="w-3 h-3" />{prompt.copyCount}
            </div>
          </div>
          <button
            onClick={handleFavorite}
            className={`rounded-full p-1.5 transition-colors ${
              isFavorite ? 'text-primary' : 'text-muted-foreground hover:text-primary'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          <Button size="sm" className="gap-1 h-7 text-[11px] btn-gradient rounded-lg" onClick={handleCopy}>
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copiado!' : 'Copiar'}
          </Button>
        </div>
      </article>
    );
  }

  return (
    <article 
      className="prompt-card cursor-pointer group flex flex-col"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden">
        {prompt.imageUrl ? (
          <img 
            src={thumbUrl} 
            alt={prompt.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none select-none"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
            loading="lazy"
            decoding="async"
          />

        ) : (
          <div className="w-full h-full bg-primary/20 flex items-center justify-center">
            <span className="text-5xl opacity-50">📷</span>
          </div>
        )}
        
        {/* Category badge */}
        <Badge className="absolute top-2.5 left-2.5 bg-primary text-primary-foreground border-0 text-[10px] px-2 py-0.5">
          {getCategoryLabel()}
        </Badge>
        
        {/* Counters top right */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-background/70 backdrop-blur-sm rounded-full px-2 py-0.5 text-[11px] text-foreground">
            <Eye className="w-3 h-3" />
            {prompt.viewCount}
          </div>
          <div className="flex items-center gap-1 bg-background/70 backdrop-blur-sm rounded-full px-2 py-0.5 text-[11px] text-foreground">
            <Copy className="w-3 h-3" />
            {prompt.copyCount}
          </div>
          <button
            onClick={handleFavorite}
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] transition-colors ${
              isFavorite 
                ? 'bg-primary/90 text-primary-foreground' 
                : 'bg-background/70 backdrop-blur-sm text-foreground hover:bg-primary/50'
            }`}
          >
            <Heart className={`w-3 h-3 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          {isAdmin && (
            <button
              onClick={handleEdit}
              className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] bg-background/70 backdrop-blur-sm text-foreground hover:bg-primary/80 hover:text-primary-foreground transition-all duration-200 opacity-0 group-hover:opacity-100 min-w-[44px] min-h-[44px] justify-center"
              title="Editar"
            >
              <Pencil className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        {/* Author */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <Avatar className="h-5 w-5 shrink-0">
            <AvatarImage src={prompt.authorAvatar} alt={prompt.author} />
            <AvatarFallback className="bg-primary/20 text-primary text-[8px] font-bold">
              {prompt.author?.slice(0, 2).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <span className="text-[11px] font-medium text-muted-foreground truncate">
            {prompt.author}
            {prompt.authorHandle && <span className="text-primary/70 ml-1">{prompt.authorHandle}</span>}
          </span>
        </div>

        <h3 className="font-display text-sm tracking-wide leading-tight line-clamp-1 group-hover:text-primary transition-colors">
          {prompt.title}
        </h3>
        
        <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2 flex-1">
          {prompt.description}
        </p>

        {/* Tags */}
        {prompt.tags && prompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {prompt.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[10px] text-primary/80 bg-primary/10 rounded-full px-2 py-0.5">
                #{tag}
              </span>
            ))}
          </div>
        )}
        
        {/* Action buttons */}
        <div className="mt-3 flex flex-col gap-2">
          <Button 
            size="sm" 
            className="w-full gap-1.5 h-8 text-xs btn-gradient rounded-lg"
            onClick={handleCopy}
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copiado!' : 'Copiar Prompt'}
          </Button>
          {isAdmin && prompt.imageUrl && (
            <Button
              size="sm"
              variant="outline"
              className="w-full gap-1.5 h-8 text-xs rounded-lg bg-zinc-800 border-zinc-700/50 text-zinc-200 hover:bg-zinc-700 transition-colors"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              {isDownloading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
              {isDownloading ? 'Baixando...' : 'Baixar Alta Qualidade'}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
