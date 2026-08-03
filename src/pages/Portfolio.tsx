import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { InviteModal } from '@/components/InviteModal';
import { ProfileModal } from '@/components/ProfileModal';
import { SubmitPromptModal, SubmitPromptData } from '@/components/SubmitPromptModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, Copy, Eye, AlertCircle, Instagram, Twitter, Youtube, Globe, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { usePortfolio } from '@/hooks/usePortfolio';
import { usePrompts } from '@/hooks/usePrompts';
import { useInviteCodes } from '@/hooks/useInviteCodes';
import { supabase } from '@/integrations/supabase/client';
import { PortfolioImageGrid } from '@/components/portfolio/PortfolioImageGrid';
import { PortfolioSortableList } from '@/components/portfolio/PortfolioSortableList';
import { PortfolioShopModal } from '@/components/portfolio/PortfolioShopModal';
import { CollectionsPanel } from '@/components/portfolio/CollectionsPanel';

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);

export default function Portfolio() {
  const navigate = useNavigate();
  const {
    isAuthenticated, isAdmin, isModerator, profile, user,
    loading: authLoading, signIn, signUp, signOut, updateProfile, fetchUserData,
  } = useAuth();

  const { portfolio, items, userPrompts, loading, saving, savePortfolio } = usePortfolio(user?.id, isAdmin);
  const { createPrompt } = usePrompts(user?.id, isAdmin);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [about, setAbout] = useState('');
  const [coverId, setCoverId] = useState<string | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [isPublished, setIsPublished] = useState(true);

  // Username editing
  const [usernameInput, setUsernameInput] = useState('');
  const [savingUsername, setSavingUsername] = useState(false);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);
  
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Hydrate state from loaded portfolio
  useEffect(() => {
    if (portfolio) {
      setTitle(portfolio.title || '');
      setAbout(portfolio.about || '');
      setCoverId(portfolio.cover_prompt_id);
      setCoverImageUrl(portfolio.cover_image_url || null);
      setIsPublished(portfolio.is_published);
    }
    setSelectedIds(items.map((i) => i.prompt_id));
  }, [portfolio, items]);

  useEffect(() => {
    if ((profile as any)?.username) {
      setUsernameInput((profile as any).username);
    } else if (profile?.display_name && !usernameInput) {
      setUsernameInput(slugify(profile.display_name));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  const username = (profile as any)?.username as string | undefined;

  const publicUrl = useMemo(() => {
    if (!username) return null;
    return `${window.location.origin}/portfolio/${username}`;
  }, [username]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  const handleRemove = (id: string) => {
    setSelectedIds((prev) => prev.filter((p) => p !== id));
    if (coverId === id) setCoverId(null);
  };

  const handleSaveUsername = async () => {
    if (!user) return;
    const clean = slugify(usernameInput);
    if (clean.length < 3) {
      toast.error('O nome de usuário precisa de pelo menos 3 caracteres válidos.');
      return;
    }
    setSavingUsername(true);
    try {
      const { data: available } = await supabase.rpc('is_username_available', { _username: clean });
      if (!available) {
        toast.error('Esse nome de usuário já está em uso.');
        return;
      }
      const { error } = await supabase.from('profiles').update({ username: clean }).eq('id', user.id);
      if (error) throw error;
      toast.success('Nome de usuário salvo!');
      setUsernameInput(clean);
      await fetchUserData(user.id);
    } catch (err: any) {
      toast.error('Erro ao salvar: ' + (err?.message || ''));
    } finally {
      setSavingUsername(false);
    }
  };

  const handleSave = async () => {
    if (selectedIds.length === 0) {
      toast.error('Selecione pelo menos 1 imagem.');
      return;
    }
    await savePortfolio(selectedIds, {
      title: title || null,
      about: about || null,
      cover_prompt_id: coverImageUrl ? null : coverId,
      cover_image_url: coverImageUrl,
      is_published: isPublished,
    });
  };

  const handleSocialVisibility = async (checked: boolean) => {
    const result = await updateProfile({ show_social_links: checked });
    if (!result.error && user?.id) await fetchUserData(user.id);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Use JPG, PNG ou WebP.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error('Imagem deve ter até 20MB.');
      return;
    }
    setUploadingCover(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `${user.id}/cover-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('avatars')
        .upload(path, file, { cacheControl: '3600', upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
      setCoverImageUrl(publicUrl);
      setCoverId(null);
      console.log('[Portfolio] cover uploaded', publicUrl);
      await savePortfolio(selectedIds, {
        title: title || null,
        about: about || null,
        cover_prompt_id: null,
        cover_image_url: publicUrl,
        is_published: isPublished,
      });
      toast.success('Capa atualizada e salva!');
    } catch (err: any) {
      console.error('[Portfolio] cover upload error', err);
      toast.error('Erro ao enviar capa: ' + (err?.message || ''));
    } finally {
      setUploadingCover(false);
      e.target.value = '';
    }
  };

  const handleCopyLink = async () => {
    if (!publicUrl) return;
    await navigator.clipboard.writeText(publicUrl);
    toast.success('Link copiado!');
  };

  const handleSubmitPrompt = async (data: SubmitPromptData) => {
    const r = await createPrompt(
      { title: data.title, description: data.description, content: data.content, imageUrl: data.imageUrl, category: data.category, tags: data.tags },
      profile || undefined
    );
    if (r) {
      toast.success(r.autoApproved ? 'Prompt publicado!' : 'Prompt enviado para análise!');
      setShowSubmitModal(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    const result = await signIn(email, password);
    if (!result.error) toast.success('Bem-vindo!');
    return result;
  };
  const handleSignUp = async (email: string, password: string, displayName: string, inviteCode: string) => {
    const result = await signUp(email, password, displayName, inviteCode);
    if (!result.error) toast.success('Conta criada!');
    return result;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <InviteModal isOpen={!isAuthenticated} onLogin={handleLogin} onSignUp={handleSignUp} loading={authLoading} />

      {isAuthenticated && (
        <>
          <Header
            isAdmin={isAdmin}
            isModerator={isModerator}
            isAuthenticated={isAuthenticated}
            displayName={profile?.display_name || undefined}
            avatarUrl={profile?.avatar_url || undefined}
            onAdminClick={() => navigate('/?admin=1')}
            onSubmitClick={() => setShowSubmitModal(true)}
            onProfileClick={() => setShowProfileModal(true)}
            onShopClick={() => setShowShopModal(true)}
            onLogout={signOut}
          />

          <main className="pt-20 pb-24 container mx-auto px-4 max-w-5xl">
            <header className="mb-8">
              <h1 className="font-display text-4xl md:text-5xl tracking-wider mb-2">MEU PORTFÓLIO</h1>
              <p className="text-muted-foreground">
                Monte um portfólio profissional com seus prompts aprovados e gere um link compartilhável.
              </p>
            </header>

            {/* Username section */}
            <section className="mb-8 p-4 rounded-xl border border-border bg-card">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Seu link público</Label>
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <div className="flex items-center gap-1 flex-1 px-3 h-11 rounded-lg border border-input bg-background">
                  <span className="text-sm text-muted-foreground truncate">/portfolio/</span>
                  <Input
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(slugify(e.target.value))}
                    placeholder="seu-nome"
                    className="border-0 h-auto p-0 focus-visible:ring-0 shadow-none"
                  />
                </div>
                <Button onClick={handleSaveUsername} disabled={savingUsername || usernameInput === username} className="h-11">
                  {savingUsername ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar usuário'}
                </Button>
              </div>
              {!username && (
                <p className="text-xs text-amber-500 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Defina um nome de usuário para ativar seu link público.
                </p>
              )}
            </section>

            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Ensaios prontos (templates reutilizáveis) */}
                <CollectionsPanel userId={user?.id} username={username} prompts={userPrompts} />

                {/* Steps 1 & 2 side by side: gallery + live preview */}
                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] gap-6 mb-10 items-start">
                  <section>
                    <h2 className="font-display text-2xl tracking-wider mb-1">1. ESCOLHA AS IMAGENS</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      Selecione até 40 imagens aprovadas do acervo. {selectedIds.length}/40 selecionadas.
                    </p>
                    <PortfolioImageGrid
                      prompts={userPrompts}
                      selectedIds={selectedIds}
                      onToggle={handleToggleSelect}
                    />
                  </section>

                  <section className="lg:sticky lg:top-24 rounded-xl border border-border bg-card p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h2 className="font-display text-2xl tracking-wider">2. PREVIEW</h2>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleClearSelection}
                        disabled={selectedIds.length === 0}
                        className="gap-1 h-8 text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Limpar tudo
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {selectedIds.length} imagem(ns) no portfólio. Arraste para reordenar, estrela define a capa, X remove.
                    </p>
                    <div className="max-h-[70vh] overflow-y-auto pr-1">
                      <PortfolioSortableList
                        prompts={userPrompts}
                        orderedIds={selectedIds}
                        coverPromptId={coverId}
                        onReorder={setSelectedIds}
                        onRemove={handleRemove}
                        onSetCover={(id) => {
                          setCoverId(id);
                          setCoverImageUrl(null);
                        }}
                      />
                    </div>
                  </section>
                </div>


                {/* Step 3: Meta */}
                <section className="mb-10 space-y-4">
                  <h2 className="font-display text-2xl tracking-wider mb-1">3. APRESENTAÇÃO</h2>

                  {/* Cover image upload */}
                  <div className="rounded-lg border border-border p-3 space-y-2">
                    <Label className="text-sm">Capa do portfólio</Label>
                    <p className="text-xs text-muted-foreground">
                      Envie uma imagem própria ou use a estrela acima para escolher uma das imagens da galeria.
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted border border-border flex-shrink-0">
                        {coverImageUrl ? (
                          <img src={coverImageUrl} alt="Capa" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground text-center px-1">
                            Sem capa customizada
                          </div>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col gap-2">
                        <label className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg border border-input bg-background hover:bg-accent cursor-pointer text-sm">
                          {uploadingCover ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          {uploadingCover ? 'Enviando...' : coverImageUrl ? 'Trocar capa' : 'Enviar capa'}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleCoverUpload}
                            disabled={uploadingCover}
                            className="hidden"
                          />
                        </label>
                        {coverImageUrl && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              setCoverImageUrl(null);
                              await savePortfolio(selectedIds, {
                                title: title || null,
                                about: about || null,
                                cover_prompt_id: coverId,
                                cover_image_url: null,
                                is_published: isPublished,
                              });
                            }}
                            className="h-8 text-xs text-muted-foreground"
                          >
                            Remover capa customizada
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="pf-title">Título do portfólio</Label>
                    <Input
                      id="pf-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ex.: Retratos & Editorial 2026"
                      maxLength={80}
                      className="h-11 mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pf-about">Sobre este portfólio</Label>
                    <Textarea
                      id="pf-about"
                      value={about}
                      onChange={(e) => setAbout(e.target.value)}
                      placeholder="Conte rapidamente o que esse portfólio mostra…"
                      maxLength={600}
                      rows={4}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                    <Switch checked={isPublished} onCheckedChange={setIsPublished} id="published" />
                    <Label htmlFor="published" className="cursor-pointer">
                      Portfólio público (acessível pelo link)
                    </Label>
                  </div>

                  <div className="rounded-lg border border-border p-3 space-y-3">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={profile?.show_social_links !== false}
                        onCheckedChange={handleSocialVisibility}
                        id="portfolio-socials"
                      />
                      <Label htmlFor="portfolio-socials" className="cursor-pointer flex-1">
                        Mostrar redes sociais do meu perfil no portfólio
                      </Label>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {profile?.instagram && <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1"><Instagram className="w-3 h-3" />{profile.instagram}</span>}
                      {profile?.whatsapp && <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1"><MessageCircle className="w-3 h-3" />{profile.whatsapp}</span>}
                      {profile?.twitter && <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1"><Twitter className="w-3 h-3" />{profile.twitter}</span>}
                      {profile?.youtube && <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1"><Youtube className="w-3 h-3" />{profile.youtube}</span>}
                      {profile?.website && <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1"><Globe className="w-3 h-3" />{profile.website}</span>}
                      {!profile?.instagram && !profile?.whatsapp && !profile?.twitter && !profile?.youtube && !profile?.website && (
                        <button type="button" onClick={() => setShowProfileModal(true)} className="text-primary hover:underline">
                          Adicionar redes sociais no perfil
                        </button>
                      )}
                    </div>
                  </div>
                </section>

                {/* Actions */}
                <section className="flex flex-col sm:flex-row gap-3 sticky bottom-4 bg-background/80 backdrop-blur p-3 -mx-3 rounded-xl border border-border">
                  <Button onClick={handleSave} disabled={saving} className="flex-1 h-12 gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Salvar portfólio
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCopyLink}
                    disabled={!publicUrl || !portfolio}
                    className="flex-1 h-12 gap-2"
                  >
                    <Copy className="w-4 h-4" /> Copiar link
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => username && navigate(`/portfolio/${username}`)}
                    disabled={!username || !portfolio}
                    className="flex-1 h-12 gap-2"
                  >
                    <Eye className="w-4 h-4" /> Ver como cliente
                  </Button>
                </section>
              </>
            )}
          </main>

          <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} profile={profile} onSave={updateProfile} />
          <PortfolioShopModal isOpen={showShopModal} onClose={() => setShowShopModal(false)} userId={user?.id} />
          {(isAdmin || isModerator) && (
            <SubmitPromptModal isOpen={showSubmitModal} onClose={() => setShowSubmitModal(false)} onSubmit={handleSubmitPrompt} />
          )}
        </>
      )}
    </div>
  );
}
