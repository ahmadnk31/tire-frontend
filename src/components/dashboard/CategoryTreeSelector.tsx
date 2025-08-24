import React, { useState } from "react";
import { Folder, FolderOpen } from "lucide-react";

interface CategoryTreeSelectorProps {
  categories: any[];
  selected: number[];
  onChange: (ids: number[]) => void;
}

export function CategoryTreeSelector({ categories, selected, onChange }: CategoryTreeSelectorProps) {
  const [openFolders, setOpenFolders] = useState<number[]>([]);

  // Build tree structure from flat categories
  const buildTree = (cats: any[], parentId: number | null = null) =>
    cats.filter(cat => cat.parentId === parentId).map(cat => ({
      ...cat,
      children: buildTree(cats, cat.id)
    }));

  const tree = buildTree(categories);

  const toggleFolder = (id: number) => {
    setOpenFolders(folders => folders.includes(id) ? folders.filter(fid => fid !== id) : [...folders, id]);
  };

  const renderNode = (cat: any, depth = 0) => (
    <div key={cat.id} style={{ marginLeft: depth * 18 }} className="flex flex-col">
      <div className="flex items-center gap-2 py-1">
        {cat.children.length > 0 && (
          <button
            type="button"
            className="rounded bg-gray-100 hover:bg-gray-200 p-1 flex items-center justify-center"
            onClick={() => toggleFolder(cat.id)}
            aria-label={openFolders.includes(cat.id) ? 'Close folder' : 'Open folder'}
          >
            {openFolders.includes(cat.id)
              ? <FolderOpen className="w-4 h-4 text-yellow-500" />
              : <Folder className="w-4 h-4 text-yellow-500" />}
          </button>
        )}
        <input
          type="checkbox"
          checked={selected.includes(cat.id)}
          onChange={e => {
            if (e.target.checked) {
              onChange([...selected, cat.id]);
            } else {
              onChange(selected.filter(id => id !== cat.id));
            }
          }}
          className="form-checkbox h-4 w-4 text-primary rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
        />
        <span className="ml-1 text-sm font-medium text-gray-800">{cat.name}</span>
      </div>
      {cat.children.length > 0 && openFolders.includes(cat.id) && (
        <div className="ml-4">
          {cat.children.map((child: any) => renderNode(child, depth + 1))}
        </div>
      )}
    </div>
  );

  return <div>{tree.map((cat: any) => renderNode(cat))}</div>;
}
