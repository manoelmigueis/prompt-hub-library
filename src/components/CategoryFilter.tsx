import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
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
}: CategoryFilterProps) {
  return (
    <section className="py-6 px-4 bg-muted/50 border-y border-border">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display text-3xl tracking-wider">
              ENSAIOS RECENTES
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              {totalPrompts} {totalPrompts === 1 ? 'resultado' : 'resultados'}
            </p>
          </div>
        </div>
        
        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              onClick={() => onCategoryChange(cat.id)}
              size="sm"
              className={`rounded-full ${
                selectedCategory === cat.id 
                  ? 'btn-gradient border-0' 
                  : 'hover:border-primary/50'
              }`}
            >
              {cat.labelPt}
            </Button>
          ))}
          
          <Button variant="ghost" size="sm" className="gap-2 rounded-full">
            <Filter className="w-3 h-3" />
            Mais Filtros
          </Button>
        </div>
      </div>
    </section>
  );
}