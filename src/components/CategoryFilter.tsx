import { Category, CATEGORIES } from '@/types/prompt';
import { Heart } from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory: Category;
  onCategoryChange: (category: Category) => void;
  totalPrompts: number;
  onSearchClick: () => void;
  onAddClick: () => void;
  showFavoritesOnly?: boolean;
  onToggleFavorites?: () => void;
}

export function CategoryFilter({ 
  selectedCategory, 
  onCategoryChange,
  showFavoritesOnly,
  onToggleFavorites,
}: CategoryFilterProps) {
  return (
    <section id="categorias" className="py-4 px-4 border-b border-border">
      <div className="container mx-auto">
        <div className="flex flex-wrap gap-2 justify-center">
          {onToggleFavorites && (
            <button
              onClick={onToggleFavorites}
              className={`shrink-0 px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                showFavoritesOnly
                  ? 'btn-gradient text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
              }`}
            >
              <Heart className={`w-3 h-3 ${showFavoritesOnly ? 'fill-current' : ''}`} />
              Favoritos
            </button>
          )}
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`shrink-0 px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
                selectedCategory === cat.id && !showFavoritesOnly
                  ? 'btn-gradient text-primary-foreground' 
                  : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
              }`}
            >
              {cat.labelPt}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
