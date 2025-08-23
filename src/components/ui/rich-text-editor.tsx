import React, { useState, useCallback, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { useDropzone } from 'react-dropzone';
import { ImageResize } from './image-resize-extension';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Image as ImageIcon,
  Link as LinkIcon,
  Upload,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Quote,
  Code,
  Strikethrough,
  Table as TableIcon,
  Plus,
  Minus
} from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  uploadImage?: (file: File) => Promise<string>;
  readOnly?: boolean;
}

const MenuBar = ({ editor, uploadImage }: { editor: any; uploadImage?: (file: File) => Promise<string> }) => {
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [isUploading, setIsUploading] = useState(false);

  const addImage = async () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('');
      setShowImageDialog(false);
    }
  };

  const addLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setShowLinkDialog(false);
    }
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: tableRows, cols: tableCols, withHeaderRow: true }).run();
    setShowTableDialog(false);
  };

  const addColumnBefore = () => editor.chain().focus().addColumnBefore().run();
  const addColumnAfter = () => editor.chain().focus().addColumnAfter().run();
  const deleteColumn = () => editor.chain().focus().deleteColumn().run();
  const addRowBefore = () => editor.chain().focus().addRowBefore().run();
  const addRowAfter = () => editor.chain().focus().addRowAfter().run();
  const deleteRow = () => editor.chain().focus().deleteRow().run();
  const deleteTable = () => editor.chain().focus().deleteTable().run();

  const handleImageUpload = useCallback(async (file: File) => {
    if (uploadImage && editor) {
      try {
        setIsUploading(true);
        const uploadedUrl = await uploadImage(file);
        editor.chain().focus().setImage({ src: uploadedUrl }).run();
        setShowImageDialog(false); // Close dialog after successful upload
      } catch (error) {
        console.error('Image upload failed:', error);
      } finally {
        setIsUploading(false);
      }
    }
  }, [uploadImage, editor]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      handleImageUpload(acceptedFiles[0]);
    }
  }, [handleImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: false
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="border-b border-gray-200 p-2 bg-gray-50">
      <div className="flex flex-wrap gap-1">
        {/* Text Formatting */}
        <Button
          variant={editor.isActive('bold') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive('italic') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive('underline') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive('strike') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Headings */}
        <Button
          variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Lists */}
        <Button
          variant={editor.isActive('bulletList') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive('orderedList') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Alignment */}
        <Button
          variant={editor.isActive({ textAlign: 'left' }) ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive({ textAlign: 'center' }) ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive({ textAlign: 'right' }) ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive({ textAlign: 'justify' }) ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        >
          <AlignJustify className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Block Elements */}
        <Button
          variant={editor.isActive('blockquote') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive('codeBlock') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <Code className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Media */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowImageDialog(true)}
          title="Upload image or add from URL"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowLinkDialog(true)}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowTableDialog(true)}
        >
          <TableIcon className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* History */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Image Upload Dialog */}
      {showImageDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add Image</h3>
            <div className="space-y-4">
              {uploadImage && (
                <div>
                  <Label>Upload Image (Recommended)</Label>
                  <div 
                    {...getRootProps()} 
                    className={cn(
                      "border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer transition-colors",
                      isDragActive && "border-blue-500 bg-blue-50"
                    )}
                  >
                    <input {...getInputProps()} />
                    {isUploading ? (
                      <div className="space-y-2">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent mx-auto"></div>
                        <p className="text-sm text-gray-600">Uploading image...</p>
                      </div>
                    ) : isDragActive ? (
                      <div className="space-y-2">
                        <Upload className="h-8 w-8 text-blue-500 mx-auto" />
                        <p className="text-sm text-blue-600 font-medium">Drop the image here</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                        <p className="text-sm text-gray-600">
                          <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or</span>
                </div>
              </div>

              <div>
                <Label htmlFor="image-url">Image URL (Optional)</Label>
                <Input
                  id="image-url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Enter image URL"
                />
                <p className="text-sm text-gray-500 mt-1">Paste a direct link to an image</p>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={addImage} disabled={!imageUrl}>
                  Add from URL
                </Button>
                <Button variant="outline" onClick={() => setShowImageDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add Link</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="link-url">URL</Label>
                <Input
                  id="link-url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="Enter URL"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={addLink} disabled={!linkUrl}>
                  Add Link
                </Button>
                <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table Dialog */}
      {showTableDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Insert Table</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="table-rows">Rows</Label>
                  <Input
                    id="table-rows"
                    type="number"
                    min="1"
                    max="10"
                    value={tableRows}
                    onChange={(e) => setTableRows(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div>
                  <Label htmlFor="table-cols">Columns</Label>
                  <Input
                    id="table-cols"
                    type="number"
                    min="1"
                    max="10"
                    value={tableCols}
                    onChange={(e) => setTableCols(parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={insertTable}>
                  Insert Table
                </Button>
                <Button variant="outline" onClick={() => setShowTableDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder,
  className,
  uploadImage,
  readOnly = false
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer'
        }
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      Underline,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 px-3 py-2',
        },
      }),
      ImageResize,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      if (!readOnly) {
        onChange(editor.getHTML());
      }
    },
    editable: !readOnly,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4'
      }
    },
    onCreate: ({ editor }) => {
      // Add custom CSS for images and tables
      const style = document.createElement('style');
      style.textContent = `
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
          display: block;
          border: 1px solid #e5e7eb;
          cursor: nw-resize;
          transition: all 0.2s ease;
          position: relative;
        }
        .ProseMirror img:hover {
          opacity: 0.9;
          transform: scale(1.02);
          border-color: #3b82f6;
        }
        .ProseMirror img.selected {
          outline: 2px solid #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }
        .ProseMirror img.resizing {
          user-select: none;
          pointer-events: none;
        }
        .ProseMirror img::after {
          content: '';
          position: absolute;
          bottom: 0;
          right: 0;
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 0 0 12px 12px;
          border-color: transparent transparent #3b82f6 transparent;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .ProseMirror img:hover::after {
          opacity: 1;
        }
        .ProseMirror img[data-resize-handle] {
          cursor: nw-resize;
        }
        .ProseMirror {
          min-height: 200px;
        }
        .ProseMirror table {
          border-collapse: collapse;
          margin: 1rem 0;
          width: 100%;
          table-layout: fixed;
        }
        .ProseMirror table td,
        .ProseMirror table th {
          border: 1px solid #d1d5db;
          padding: 0.5rem;
          position: relative;
          min-width: 1em;
        }
        .ProseMirror table th {
          background-color: #f9fafb;
          font-weight: 600;
        }
        .ProseMirror table .selectedCell:after {
          background: rgba(200, 200, 255, 0.4);
          content: "";
          left: 0; right: 0; top: 0; bottom: 0;
          pointer-events: none;
          position: absolute;
          z-index: 2;
        }
        .ProseMirror table .column-resize-handle {
          background-color: #3b82f6;
          bottom: -2px;
          position: absolute;
          right: -2px;
          pointer-events: none;
          top: 0;
          width: 4px;
        }
        .ProseMirror table p {
          margin: 0;
        }
        .ProseMirror .resize-cursor {
          cursor: ew-resize;
          cursor: col-resize;
        }
      `;
      document.head.appendChild(style);
    }
  });

  // Update editor content when value prop changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  // Table functions
  const addColumnBefore = () => editor?.chain().focus().addColumnBefore().run();
  const addColumnAfter = () => editor?.chain().focus().addColumnAfter().run();
  const deleteColumn = () => editor?.chain().focus().deleteColumn().run();
  const addRowBefore = () => editor?.chain().focus().addRowBefore().run();
  const addRowAfter = () => editor?.chain().focus().addRowAfter().run();
  const deleteRow = () => editor?.chain().focus().deleteRow().run();
  const deleteTable = () => editor?.chain().focus().deleteTable().run();

  return (
    <div className={cn('border border-gray-300 rounded-lg overflow-hidden relative', className)}>
      {!readOnly && <MenuBar editor={editor} uploadImage={uploadImage} />}
      <EditorContent editor={editor} />
      
      {/* Floating Table Toolbar */}
      {!readOnly && editor && editor.isActive('table') && (
        <div className="absolute top-2 right-2 bg-white border border-gray-300 rounded-lg shadow-lg p-2 flex gap-1 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={addColumnBefore}
            title="Add column before"
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={addColumnAfter}
            title="Add column after"
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={deleteColumn}
            title="Delete column"
          >
            <Minus className="h-3 w-3" />
          </Button>
          <div className="w-px bg-gray-300 mx-1" />
          <Button
            variant="outline"
            size="sm"
            onClick={addRowBefore}
            title="Add row before"
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={addRowAfter}
            title="Add row after"
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={deleteRow}
            title="Delete row"
          >
            <Minus className="h-3 w-3" />
          </Button>
          <div className="w-px bg-gray-300 mx-1" />
          <Button
            variant="outline"
            size="sm"
            onClick={deleteTable}
            title="Delete table"
          >
            <Minus className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Floating Image Resize Toolbar */}
      {!readOnly && editor && editor.isActive('image') && (
        <div className="absolute top-2 right-2 bg-white border border-gray-300 rounded-lg shadow-lg p-2 flex gap-1 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const { state } = editor;
              const { selection } = state;
              const node = state.doc.nodeAt(selection.from);
              if (node && node.type.name === 'image') {
                const currentWidth = node.attrs.width || 'auto';
                const newWidth = currentWidth === 'auto' ? '50%' : 'auto';
                editor.chain().focus().updateAttributes('image', { width: newWidth }).run();
              }
            }}
            title="Toggle image size"
          >
            <ImageIcon className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              editor.chain().focus().updateAttributes('image', { width: '25%' }).run();
            }}
            title="Small size"
          >
            S
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              editor.chain().focus().updateAttributes('image', { width: '50%' }).run();
            }}
            title="Medium size"
          >
            M
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              editor.chain().focus().updateAttributes('image', { width: '100%' }).run();
            }}
            title="Large size"
          >
            L
          </Button>
        </div>
      )}
    </div>
  );
};

