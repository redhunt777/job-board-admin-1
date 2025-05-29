import { useCallback, useEffect } from "react";
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
} from "lexical";
import { ListNode, ListItemNode } from "@lexical/list";
import { LinkNode } from "@lexical/link";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

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

export default function LexicalEditor({ value, onChange }: LexicalEditorProps) {
  const initialConfig = {
    namespace: "JobDescriptionEditor",
    theme,
    onError(error: Error) {
      throw error;
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

  const handleChange = useCallback(
    (editorState: EditorState) => {
      editorState.read(() => {
        const root = $getRoot();
        const text = root.getTextContent();
        onChange(text);
      });
    },
    [onChange]
  );

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="bg-neutral-50 rounded-lg border border-neutral-200">
        <ToolbarPlugin />
        <RichTextPlugin
          contentEditable={
            <ContentEditable className="min-h-60 px-3 py-2 outline-none bg-neutral-50 text-neutral-500" />
          }
          ErrorBoundary={({ children }) => <div>{children}</div>}
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
    </LexicalComposer>
  );
}
