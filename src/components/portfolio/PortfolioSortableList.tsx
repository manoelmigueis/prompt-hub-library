import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Star, X } from 'lucide-react';
import type { UserPromptOption } from '@/hooks/usePortfolio';
import { cn } from '@/lib/utils';

const thumb = (url: string | null, width = 300) => {
  if (!url) return url;
  if (!url.includes('/storage/v1/object/public/')) return url;
  const rendered = url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');
  const sep = rendered.includes('?') ? '&' : '?';
  return `${rendered}${sep}width=${width}&quality=70&resize=contain`;
};

interface Props {
  prompts: UserPromptOption[];
  orderedIds: string[];
  coverPromptId: string | null;
  onReorder: (ids: string[]) => void;
  onRemove: (id: string) => void;
  onSetCover: (id: string) => void;
}

export function PortfolioSortableList({ prompts, orderedIds, coverPromptId, onReorder, onRemove, onSetCover }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const promptMap = new Map(prompts.map((p) => [p.id, p]));
  const orderedPrompts = orderedIds.map((id) => promptMap.get(id)).filter(Boolean) as UserPromptOption[];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = orderedIds.indexOf(active.id as string);
    const newIndex = orderedIds.indexOf(over.id as string);
    onReorder(arrayMove(orderedIds, oldIndex, newIndex));
  };

  if (orderedPrompts.length === 0) {
    return (
      <div className="text-center py-10 text-sm text-muted-foreground border border-dashed border-border rounded-xl">
        Nenhuma imagem selecionada. Escolha acima para começar.
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={orderedIds} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-3 gap-2">
          {orderedPrompts.map((p) => (
            <SortableTile
              key={p.id}
              prompt={p}
              isCover={coverPromptId === p.id}
              onRemove={() => onRemove(p.id)}
              onSetCover={() => onSetCover(p.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableTile({
  prompt,
  isCover,
  onRemove,
  onSetCover,
}: {
  prompt: UserPromptOption;
  isCover: boolean;
  onRemove: () => void;
  onSetCover: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: prompt.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative aspect-square rounded-lg overflow-hidden border-2 bg-muted',
        isCover ? 'border-primary ring-2 ring-primary/30' : 'border-border',
        isDragging && 'opacity-70'
      )}
    >
      {prompt.image_url ? (
        <img src={thumb(prompt.image_url) || undefined} alt={prompt.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">{prompt.title}</div>
      )}

      <div className="absolute top-1 left-1 right-1 flex justify-between gap-1">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="bg-background/80 backdrop-blur rounded p-1 cursor-grab active:cursor-grabbing"
          aria-label="Arrastar"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={onSetCover}
            title={isCover ? 'Capa atual' : 'Definir como capa'}
            className={cn(
              'bg-background/80 backdrop-blur rounded p-1',
              isCover && 'bg-primary text-primary-foreground'
            )}
          >
            <Star className={cn('w-3.5 h-3.5', isCover && 'fill-current')} />
          </button>
          <button
            type="button"
            onClick={onRemove}
            title="Remover"
            className="bg-background/80 backdrop-blur rounded p-1 hover:bg-destructive hover:text-destructive-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
        <p className="text-xs text-white truncate">{prompt.title}</p>
      </div>
    </div>
  );
}
