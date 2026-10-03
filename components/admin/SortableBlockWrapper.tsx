"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2, Edit, GripVertical } from "lucide-react";

interface WrapperProps {
  id: string;
  children: React.ReactNode;
  onSelect: () => void;
  isActive: boolean;
  onDelete?: () => void;
  onEdit?: () => void;
}

export function SortableBlockWrapper({ id, children, onSelect, isActive, onDelete, onEdit }: WrapperProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative mb-4 rounded-xl border-2 bg-white p-4 transition-all shadow-sm ${
        isActive 
          ? "border-indigo-600 ring-2 ring-indigo-100" 
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      {/* Action Bar */}
      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors"
          title="Drag to reorder"
        >
          <GripVertical className="w-4 h-4 text-gray-500" />
        </div>

        {/* Edit Button */}
        {onEdit && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
            title="Edit block"
          >
            <Edit className="w-4 h-4 text-blue-600" />
          </button>
        )}
        
        {/* Delete Button */}
        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer"
            title="Delete block"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        )}
      </div>

      {/* Content Area */}
      <div 
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        className="pointer-events-none opacity-85 scale-[0.99]"
      >
        {children}
      </div>
    </div>
  );
}
