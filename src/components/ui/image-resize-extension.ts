import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export interface ImageResizeOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageResize: {
      setImageSize: (width: number, height: number) => ReturnType;
    };
  }
}

export const ImageResize = Extension.create<ImageResizeOptions>({
  name: 'imageResize',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addCommands() {
    return {
      setImageSize:
        (width: number, height: number) =>
        ({ commands }) => {
          return commands.updateAttributes('image', { width, height });
        },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('imageResize'),
        props: {
          handleDOMEvents: {
            mousedown: (view, event) => {
              const target = event.target as HTMLElement;
              if (target.tagName === 'IMG') {
                const img = target as HTMLImageElement;
                const startX = event.clientX;
                const startY = event.clientY;
                const startWidth = img.offsetWidth;
                const startHeight = img.offsetHeight;
                const aspectRatio = startWidth / startHeight;

                const handleMouseMove = (e: MouseEvent) => {
                  const deltaX = e.clientX - startX;
                  const deltaY = e.clientY - startY;
                  
                  // Resize based on horizontal movement while maintaining aspect ratio
                  const newWidth = Math.max(50, startWidth + deltaX);
                  const newHeight = newWidth / aspectRatio;
                  
                  img.style.width = `${newWidth}px`;
                  img.style.height = `${newHeight}px`;
                };

                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                  
                  // Update the image attributes in the editor
                  const { state, dispatch } = view;
                  const { tr } = state;
                  const pos = view.posAtDOM(img, 0);
                  
                  tr.setNodeAttribute(pos, 'width', img.style.width);
                  tr.setNodeAttribute(pos, 'height', img.style.height);
                  dispatch(tr);
                };

                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
                
                return true;
              }
              return false;
            },
          },
        },
      }),
    ];
  },
});
