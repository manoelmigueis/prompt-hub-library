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
}: CategoryFilterProps) {
  return (
    <section id="categorias" className="py-4 px-4 border-b border-border">
      <div className="container mx-auto">
        <div className="flex flex-wrap gap-2 justify-center">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`shrink-0 px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
                selectedCategory === cat.id 
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
