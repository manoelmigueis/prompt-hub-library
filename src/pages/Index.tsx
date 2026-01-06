import { useState, useMemo, useEffect } from 'react';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { CategoryFilter } from '@/components/CategoryFilter';
import { PromptGrid } from '@/components/PromptGrid';
import { PromptModal } from '@/components/PromptModal';
import { SubmitPromptModal, SubmitPromptData } from '@/components/SubmitPromptModal';
import { AdminPanel } from '@/components/AdminPanel';
import { InviteModal } from '@/components/InviteModal';
import { Category, Prompt, PromptStatus } from '@/types/prompt';
import { mockPrompts } from '@/data/mockPrompts';
import { toast } from 'sonner';

// Simulated valid invite codes
const VALID_CODES = ['BANANA2025', 'PROMPT-VIP', 'CREATOR01'];

export default function Index() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(true);
  
  // Data state
  const [prompts, setPrompts] = useState<Prompt[]>(mockPrompts);
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  
  // Modal state
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  
  // Admin settings
  const [autoApprove, setAutoApprove] = useState(false);
  const [inviteCodes, setInviteCodes] = useState<string[]>([...VALID_CODES]);
  
  // Check for invite code in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const inviteCode = params.get('invite');
    if (inviteCode && VALID_CODES.includes(inviteCode.toUpperCase())) {
      handleInviteSubmit(inviteCode.toUpperCase());
    }
  }, []);
  
  // Filter prompts
  const filteredPrompts = useMemo(() => {
    return prompts
      .filter(p => p.status === 'approved')
      .filter(p => selectedCategory === 'all' || p.category === selectedCategory)
      .filter(p => 
        searchQuery === '' ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [prompts, selectedCategory, searchQuery]);
  
  // Handlers
  const handleInviteSubmit = (code: string) => {
    if (VALID_CODES.includes(code) || inviteCodes.includes(code)) {
      setIsAuthenticated(true);
      setIsAdmin(code === 'BANANA2025'); // First code is admin
      setShowInviteModal(false);
      toast.success('Bem-vindo ao PromptHub! 🍌');
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    } else {
      toast.error('Código de convite inválido');
    }
  };
  
  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
    setShowInviteModal(true);
    toast.info('Você saiu da plataforma');
  };
  
  const handlePromptClick = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setShowPromptModal(true);
  };
  
  const handleSubmitPrompt = (data: SubmitPromptData) => {
    const newPrompt: Prompt = {
      id: Date.now().toString(),
      ...data,
      author: 'Você',
      authorHandle: '@voce',
      status: autoApprove ? 'approved' : 'pending',
      isFeatured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setPrompts(prev => [newPrompt, ...prev]);
    toast.success(
      autoApprove 
        ? 'Prompt publicado com sucesso!' 
        : 'Prompt enviado para revisão!'
    );
  };
  
  const handleUpdateStatus = (id: string, status: PromptStatus) => {
    setPrompts(prev => prev.map(p => 
      p.id === id ? { ...p, status, updatedAt: new Date() } : p
    ));
    toast.success(status === 'approved' ? 'Prompt aprovado!' : 'Prompt rejeitado');
  };
  
  const handleToggleFeatured = (id: string) => {
    setPrompts(prev => prev.map(p =>
      p.id === id ? { ...p, isFeatured: !p.isFeatured } : p
    ));
  };
  
  const handleGenerateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    code += '-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setInviteCodes(prev => [...prev, code]);
    toast.success('Novo código gerado!');
  };
  
  const handleDeleteCode = (code: string) => {
    setInviteCodes(prev => prev.filter(c => c !== code));
    toast.success('Código removido');
  };
  
  return (
    <div className="min-h-screen">
      {/* Invite Modal */}
      <InviteModal 
        isOpen={showInviteModal}
        onSubmit={handleInviteSubmit}
      />
      
      {/* Main Content */}
      {isAuthenticated && (
        <>
          <Header 
            isAdmin={isAdmin}
            isAuthenticated={isAuthenticated}
            onAdminClick={() => setShowAdminPanel(true)}
            onSubmitClick={() => setShowSubmitModal(true)}
            onLogout={handleLogout}
          />
          
          <main>
            <HeroSection 
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              totalPrompts={filteredPrompts.length}
            />
            
            <CategoryFilter 
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              totalPrompts={filteredPrompts.length}
              onSearchClick={() => {}}
              onAddClick={() => setShowSubmitModal(true)}
            />
            
            <PromptGrid 
              prompts={filteredPrompts}
              onPromptClick={handlePromptClick}
            />
          </main>
          
          {/* Modals */}
          <PromptModal 
            prompt={selectedPrompt}
            isOpen={showPromptModal}
            onClose={() => setShowPromptModal(false)}
          />
          
          <SubmitPromptModal 
            isOpen={showSubmitModal}
            onClose={() => setShowSubmitModal(false)}
            onSubmit={handleSubmitPrompt}
          />
          
          <AdminPanel 
            isOpen={showAdminPanel}
            onClose={() => setShowAdminPanel(false)}
            prompts={prompts}
            onUpdateStatus={handleUpdateStatus}
            onToggleFeatured={handleToggleFeatured}
            autoApprove={autoApprove}
            onToggleAutoApprove={setAutoApprove}
            inviteCodes={inviteCodes}
            onGenerateCode={handleGenerateCode}
            onDeleteCode={handleDeleteCode}
          />
        </>
      )}
    </div>
  );
}
