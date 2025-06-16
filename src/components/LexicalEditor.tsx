import { useCallback, useEffect, useRef, useState, memo } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import ToolbarPlugin from "@/components/LexicalToolbarPlugin";
import {
  $getRoot,
  EditorState,
  createCommand,
  COMMAND_PRIORITY_EDITOR,
  $createParagraphNode,
  $createTextNode,
} from "lexical";
import { ListNode, ListItemNode } from "@lexical/list";
import { LinkNode } from "@lexical/link";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { LexicalEditor as LexicalEditorType } from "lexical";

const FONT_SIZE_COMMAND = createCommand("FONT_SIZE_COMMAND");

function FontSizePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      FONT_SIZE_COMMAND,
      (size) => {
        editor.update(() => {
          const selection = editor.getEditorState()._selection;
          if (selection) {
            const nodes = selection.getNodes();
            nodes.forEach((node) => {
              if (node.getType() === "paragraph") {
                const element = editor.getElementByKey(node.getKey());
                if (element) {
                  // Remove any existing font size classes
                  element.classList.remove(
                    "text-sm",
                    "text-base",
                    "text-lg",
                    "text-xl"
                  );
                  // Add the new font size class
                  switch (size) {
                    case "small":
                      element.classList.add("text-sm");
                      break;
                    case "normal":
                      element.classList.add("text-base");
                      break;
                    case "large":
                      element.classList.add("text-lg");
                      break;
                    case "xlarge":
                      element.classList.add("text-xl");
                      break;
                  }
                }
              }
            });
          }
        });
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);

  return null;
}

interface LexicalEditorProps {
  value: string;
  onChange: (value: string) => void;
}

interface EditorRefPluginProps {
  editorRef: React.MutableRefObject<LexicalEditorType | null>;
  setIsReady?: React.Dispatch<React.SetStateAction<boolean>>;
}

const theme = {
  text: {
    base: "text-neutral-800",
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
    strikethrough: "line-through",
  },
  paragraph: "mb-2",
  list: {
    ul: "list-disc ml-4",
    ol: "list-decimal ml-4",
    listitem: "mb-1",
  },
  link: "text-blue-600 underline cursor-pointer",
  heading: {
    h1: "text-3xl font-bold mb-4",
    h2: "text-2xl font-bold mb-3",
    h3: "text-xl font-bold mb-2",
  },
  quote: "border-l-4 border-neutral-300 pl-4 italic my-4",
  code: "bg-neutral-100 rounded px-1 font-mono text-sm",
  textFormatting: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
    strikethrough: "line-through",
    underlineStrikethrough: "underline line-through",
  },
};

// Memoize the editor content component
const EditorContent = memo(({
  isLoadingContent,
  isEditorReady
}: {
  isLoadingContent: boolean;
  isEditorReady: boolean;
}) => (
  <div className="space-y-2">
    {isLoadingContent && (
      <div className="text-sm text-blue-600 flex items-center gap-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        Loading existing content...
      </div>
    )}
    
    <div className="bg-neutral-50 rounded-lg border border-neutral-200">
      <ToolbarPlugin />
      <RichTextPlugin
        contentEditable={
          <ContentEditable 
            className="min-h-60 px-3 py-2 outline-none bg-neutral-50 text-neutral-500 focus:bg-white focus:text-neutral-900 transition-colors" 
          />
        }
        placeholder={
          <div className="absolute top-2 left-3 text-neutral-400 pointer-events-none">
            Enter job description here...
          </div>
        }
        ErrorBoundary={({ children }) => <div className="text-red-500 p-4">{children}</div>}
      />
      <HistoryPlugin />
      <ListPlugin />
      <LinkPlugin />
      <AutoFocusPlugin />
      <ClearEditorPlugin />
      <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
      <FontSizePlugin />
      <OnChangePlugin onChange={handleChange} />
    </div>
    
    {/* Help text */}
    <div className="text-xs text-gray-500 mt-2">
      💡 <strong>Tip:</strong> Select text and use the toolbar above to format it. Try making text <strong>bold</strong>, <em>italic</em>, or creating lists!
    </div>
  </div>
));

EditorContent.displayName = "EditorContent";

export default function LexicalEditor({ value, onChange }: LexicalEditorProps) {
  const editorRef = useRef<LexicalEditorType | null>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [initialValue] = useState(value); // Capture initial value
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  const initialConfig = {
    namespace: "JobDescriptionEditor",
    theme,
    onError(error: Error) {
      throw error;
    },
    editorState: () => {
      const root = $getRoot();
      
      if (initialValue && initialValue.trim()) {
        try {
          // Check if the content is HTML or plain text
          const isHTML = initialValue.includes('<') && initialValue.includes('>');
          
          if (isHTML) {
            // For HTML content, we'll set it after editor is ready
            // Just create an empty paragraph for now
            const paragraph = $createParagraphNode();
            root.clear();
            root.append(paragraph);
          } else {
            // Handle plain text - convert to proper paragraph structure
            root.clear();
            
            // Split by double newlines to create paragraphs
            const paragraphs = initialValue.split('\n\n').filter(p => p.trim());
            
            if (paragraphs.length === 0) {
              // Empty content, add a single empty paragraph
              const paragraph = $createParagraphNode();
              root.append(paragraph);
            } else {
              paragraphs.forEach(paragraphText => {
                const paragraph = $createParagraphNode();
                
                // Handle single newlines within paragraphs
                const lines = paragraphText.split('\n').filter(line => line.trim());
                
                lines.forEach((line, index) => {
                  if (index > 0) {
                    // Add line break for subsequent lines
                    paragraph.append($createTextNode('\n'));
                  }
                  paragraph.append($createTextNode(line.trim()));
                });
                
                root.append(paragraph);
              });
            }
          }
        } catch (error) {
          console.error("Error setting up editor state:", error);
          // Fallback: create a single paragraph with the raw text
          const paragraph = $createParagraphNode();
          paragraph.append($createTextNode(initialValue || ""));
          root.clear();
          root.append(paragraph);
        }
      } else {
        // No initial value, create empty paragraph
        const paragraph = $createParagraphNode();
        root.clear();
        root.append(paragraph);
      }
    },
    nodes: [
      ListNode,
      ListItemNode,
      LinkNode,
      HeadingNode,
      QuoteNode,
      CodeNode,
      CodeHighlightNode,
    ],
  };

  // Effect to load HTML content after editor is ready
  useEffect(() => {
    if (isEditorReady && editorRef.current && initialValue && initialValue.trim()) {
      const isHTML = initialValue.includes('<') && initialValue.includes('>');
      
      if (isHTML) {
        setIsLoadingContent(true);
        editorRef.current.update(() => {
          try {
            const root = $getRoot();
            const parser = new DOMParser();
            const dom = parser.parseFromString(initialValue, "text/html");
            const nodes = $generateNodesFromDOM(editorRef.current!, dom);
            root.clear();
            root.append(...nodes);
          } catch (error) {
            console.error("Error loading HTML content:", error);
            // Fallback: create a single paragraph with the raw text
            const root = $getRoot();
            const paragraph = $createParagraphNode();
            paragraph.append($createTextNode(initialValue));
            root.clear();
            root.append(paragraph);
          } finally {
            setIsLoadingContent(false);
          }
        });
      }
    }
  }, [isEditorReady, initialValue]);

  const handleChange = useCallback(
    (editorState: EditorState) => {
      editorState.read(() => {
        const root = $getRoot();
        
        // Convert the editor content to HTML
        if (editorRef.current) {
          try {
            const html = $generateHtmlFromNodes(editorRef.current);
            const plainText = root.getTextContent();
            
            // Debug logging (development only)
            if (process.env.NODE_ENV === 'development') {
              console.log("Lexical Editor Output:", {
                htmlLength: html.length,
                plainTextLength: plainText.length,
                isHTML: html.includes('<')
              });
            }
            
            // Always use HTML output
            onChange(html);
          } catch (error) {
            console.error("Error generating HTML from Lexical:", error);
            // Fallback to plain text if HTML generation fails
            const plainText = root.getTextContent();
            onChange(plainText);
          }
        }
      });
    },
    [onChange]
  );

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <EditorRefPlugin editorRef={editorRef} setIsReady={setIsEditorReady} />
      <EditorContent
        isLoadingContent={isLoadingContent}
        isEditorReady={isEditorReady}
      />
    </LexicalComposer>
  );
}

function EditorRefPlugin({ editorRef, setIsReady }: EditorRefPluginProps) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editorRef.current = editor;
    if (setIsReady) {
      setIsReady(true);
    }
  }, [editor, editorRef, setIsReady]);

  return null;
}
