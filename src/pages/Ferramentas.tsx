import { useState, useMemo } from 'react';
import { Search, Plus, Sparkles, Wrench, ExternalLink, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AddToolModal } from '@/components/AddToolModal';
import { useTools, Tool, ToolCategory, TOOL_CATEGORIES } from '@/hooks/useTools';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { AdminPanel } from '@/components/AdminPanel';
import { ProfileModal } from '@/components/ProfileModal';
import { SubmitPromptModal, SubmitPromptData } from '@/components/SubmitPromptModal';
import { InviteModal } from '@/components/InviteModal';
import { usePrompts } from '@/hooks/usePrompts';
import { useInviteCodes } from '@/hooks/useInviteCodes';
import { toast } from 'sonner';

export default function Ferramentas() {
  const { tools, loading, createTool, deleteTool } = useTools();
  const { isAuthenticated, isAdmin, isModerator, hasAccess, profile, user, loading: authLoading, signIn, signUp, signOut, updateProfile, fetchUserData } = useAuth();
  const { prompts, updatePromptStatus, toggleFeatured, deletePrompt, createPrompt, getAutoApprove, setAutoApprove } = usePrompts(user?.id, isAdmin);
  const { inviteCodes, generateCode, deleteCode } = useInviteCodes();
  
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'todas'>('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const filteredTools = useMemo(() => {
    return tools
      .filter(t => selectedCategory === 'todas' || t.category === selectedCategory)
      .filter(t => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return t.name.toLowerCase().includes(q) || (t.description?.toLowerCase().includes(q));
      });
  }, [tools, selectedCategory, searchQuery]);

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
        <div className="animate-pulse text-primary font-display text-2xl">Carregando...</div>
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
            onAdminClick={() => setShowAdminPanel(true)}
            onSubmitClick={() => setShowSubmitModal(true)}
            onProfileClick={() => setShowProfileModal(true)}
            onLogout={signOut}
          />

          <main className="pt-20 pb-16">
            {/* Hero */}
            <section className="text-center py-12 px-4">
              <Sparkles className="w-10 h-10 text-primary mx-auto mb-4" />
              <h1 className="font-display text-4xl md:text-5xl tracking-wider mb-3">Ferramentas & Recursos</h1>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Descubra ferramentas de IA, editores, tutoriais e recursos para criar suas imagens
              </p>

              {/* Search */}
              <div className="max-w-md mx-auto mt-6 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar ferramentas..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 rounded-xl"
                />
              </div>
            </section>

            {/* Categories */}
            <div className="px-4 pb-8">
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => setSelectedCategory('todas')}
                  className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
                    selectedCategory === 'todas'
                      ? 'btn-gradient text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
                  }`}
                >
                  Todas
                </button>
                {TOOL_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
                      selectedCategory === cat.id
                        ? 'btn-gradient text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Add button for admins */}
            {(isAdmin || isModerator) && (
              <div className="flex justify-end px-4 max-w-6xl mx-auto mb-6">
                <Button onClick={() => setShowAddModal(true)} className="btn-gradient gap-2 rounded-full">
                  <Plus className="w-4 h-4" />
                  Adicionar Ferramenta
                </Button>
              </div>
            )}

            {/* Grid */}
            <div className="px-4 max-w-6xl mx-auto">
              {loading ? (
                <div className="text-center py-20 text-muted-foreground">Carregando...</div>
              ) : filteredTools.length === 0 ? (
                <div className="text-center py-20">
                  <Wrench className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhuma ferramenta encontrada</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredTools.map(tool => (
                    <a
                      key={tool.id}
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="prompt-card group flex flex-col overflow-hidden"
                    >
                      {tool.imageUrl ? (
                        <div className="aspect-video overflow-hidden">
                          <img src={tool.imageUrl} alt={tool.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        </div>
                      ) : (
                        <div className="aspect-video bg-muted flex items-center justify-center">
                          <Wrench className="w-10 h-10 text-muted-foreground/30" />
                        </div>
                      )}
                      <div className="p-4 flex flex-col flex-1">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-display text-lg tracking-wide group-hover:text-primary transition-colors">{tool.name}</h3>
                          {tool.isFeatured && <Star className="w-4 h-4 text-primary fill-primary shrink-0" />}
                        </div>
                        {tool.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">{tool.description}</p>
                        )}
                        <div className="flex items-center justify-between mt-auto">
                          <Badge variant="secondary" className="text-[10px]">
                            {TOOL_CATEGORIES.find(c => c.id === tool.category)?.label || tool.category}
                          </Badge>
                          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                      {(isAdmin || isModerator) && (
                        <div className="px-4 pb-3">
                          <Button
                            size="sm"
                            variant="destructive"
                            className="w-full text-xs h-7"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              deleteTool(tool.id);
                            }}
                          >
                            Excluir
                          </Button>
                        </div>
                      )}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </main>

          <AddToolModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSubmit={createTool} />
          <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} profile={profile} onSave={updateProfile} />
          <SubmitPromptModal isOpen={showSubmitModal} onClose={() => setShowSubmitModal(false)} onSubmit={async (data: SubmitPromptData) => { await createPrompt(data, profile); setShowSubmitModal(false); }} />
          <AdminPanel
            isOpen={showAdminPanel}
            onClose={() => setShowAdminPanel(false)}
            prompts={prompts}
            onUpdateStatus={async (id, status) => { await updatePromptStatus(id, status); }}
            onToggleFeatured={async (id) => { await toggleFeatured(id); }}
            onDeletePrompt={async (id) => { await deletePrompt(id); }}
            autoApprove={false}
            onToggleAutoApprove={async () => {}}
            inviteCodes={inviteCodes.map(c => c.code)}
            onGenerateCode={async () => { if (user?.id) await generateCode(user.id); }}
            onDeleteCode={async (code) => { const c = inviteCodes.find(ic => ic.code === code); if (c) await deleteCode(c.id); }}
          />
        </>
      )}
    </div>
  );
}