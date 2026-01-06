import { Button } from '@/components/ui/button';
import { Filter, Search, Plus } from 'lucide-react';
import { Category, CATEGORIES } from '@/types/prompt';

interface CategoryFilterProps {
  selectedCategory: Category;
  onCategoryChange: (category: Category) => void;
  totalPrompts: number;
  onSearchClick: () => void;
  onAddClick: () => void;
}

export function CategoryFilter({ 
  selectedCategory, 
  onCategoryChange, 
  totalPrompts,
  onSearchClick,
  onAddClick
}: CategoryFilterProps) {
  return (
    <section className="py-8 px-4 bg-primary/5 border-y-4 border-primary">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h2 className="font-display text-3xl font-bold uppercase tracking-tight">
            Prompts Recentes
          </h2>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={onSearchClick}>
              <Search className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={onAddClick}>
              <Plus className="w-4 h-4" />
            </Button>
            <div className="bg-card border-2 border-primary px-4 py-2 font-display font-bold">
              TOTAL: <span className="text-coral-dark">{totalPrompts}</span>
            </div>
          </div>
        </div>
        
        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'categoryActive' : 'category'}
              onClick={() => onCategoryChange(cat.id)}
              size="sm"
            >
              {cat.labelPt}
            </Button>
          ))}
          
          <Button variant="category" size="sm" className="gap-2">
            <Filter className="w-3 h-3" />
            Filtrar
          </Button>
        </div>
      </div>
    </section>
  );
}
