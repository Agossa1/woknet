"use client";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useEffect, useState, useCallback } from "react";
import {
    $getSelection,
    $isRangeSelection,
    FORMAT_TEXT_COMMAND,
    SELECTION_CHANGE_COMMAND,
    UNDO_COMMAND,
    REDO_COMMAND,
    CAN_UNDO_COMMAND,
    CAN_REDO_COMMAND,
    $createParagraphNode,
    $createTextNode,
    $getRoot,
    FORMAT_ELEMENT_COMMAND,
    type ElementFormatType,
} from "lexical";
import {
    INSERT_ORDERED_LIST_COMMAND,
    INSERT_UNORDERED_LIST_COMMAND,
    REMOVE_LIST_COMMAND,
    ListNode,
    ListItemNode,
} from "@lexical/list";
import {
    $createHeadingNode,
    $createQuoteNode,
    HeadingNode,
    QuoteNode,
} from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import {
    $isLinkNode,
    TOGGLE_LINK_COMMAND,
    LinkNode,
    AutoLinkNode,
} from "@lexical/link";
import { mergeRegister } from "@lexical/utils";
import {
    Bold, Italic, Underline, Strikethrough,
    List, ListOrdered, Quote, Heading1, Heading2,
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Link, Undo, Redo, X, HelpCircle, ThumbsUp, ThumbsDown,
    Type, Trash2
} from "lucide-react";

// --- Theme ---
const theme = {
    ltr: "ltr",
    rtl: "rtl",
    placeholder: "editor-placeholder",
    paragraph: "editor-paragraph mb-2 text-neutral-800 dark:text-neutral-200",
    quote: "border-l-4 border-neutral-300 dark:border-neutral-700 pl-4 italic my-4 text-neutral-600 dark:text-neutral-400",
    heading: {
        h1: "text-3xl font-bold mt-6 mb-4 text-black dark:text-white",
        h2: "text-2xl font-bold mt-5 mb-3 text-black dark:text-white",
        h3: "text-xl font-bold mt-4 mb-2 text-black dark:text-white",
    },
    list: {
        nested: {
            listitem: "editor-nested-listitem",
        },
        ol: "list-decimal ml-6 mb-2",
        ul: "list-disc ml-6 mb-2",
        listitem: "editor-listitem py-1",
        checklist: "list-none ml-1",
    },
    link: "text-blue-600 dark:text-blue-400 underline hover:no-underline cursor-pointer",
    text: {
        bold: "font-bold",
        italic: "italic",
        underline: "underline",
        strikethrough: "line-through",
        underlineStrikethrough: "underline line-through",
    },
};

// --- Helper Functions ---

function Divider() {
    return <div className="w-[1px] h-6 bg-neutral-200 dark:bg-neutral-800 mx-1" />;
}

// --- Toolbar Plugin ---

function ToolbarPlugin({ onClear }: { onClear: () => void }) {
    const [editor] = useLexicalComposerContext();
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [isStrikethrough, setIsStrikethrough] = useState(false);
    const [isLink, setIsLink] = useState(false);

    const updateToolbar = useCallback(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            setIsBold(selection.hasFormat("bold"));
            setIsItalic(selection.hasFormat("italic"));
            setIsUnderline(selection.hasFormat("underline"));
            setIsStrikethrough(selection.hasFormat("strikethrough"));

            // Check link
            const node = selection.getNodes()[0];
            const parent = node?.getParent();
            if ($isLinkNode(parent) || $isLinkNode(node)) {
                setIsLink(true);
            } else {
                setIsLink(false);
            }
        }
    }, [editor]);

    useEffect(() => {
        return mergeRegister(
            editor.registerUpdateListener(({ editorState }) => {
                editorState.read(() => {
                    updateToolbar();
                });
            }),
            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                () => {
                    updateToolbar();
                    return false;
                },
                1
            ),
            editor.registerCommand(
                CAN_UNDO_COMMAND,
                (payload) => {
                    setCanUndo(payload);
                    return false;
                },
                1
            ),
            editor.registerCommand(
                CAN_REDO_COMMAND,
                (payload) => {
                    setCanRedo(payload);
                    return false;
                },
                1
            )
        );
    }, [editor, updateToolbar]);

    const insertLink = useCallback(() => {
        if (!isLink) {
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, "https://");
        } else {
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
        }
    }, [editor, isLink]);

    const formatHeading = (headingSize: 'h1' | 'h2') => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createHeadingNode(headingSize));
            }
        });
    };

    const formatParagraph = () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createParagraphNode());
            }
        });
    };

    const formatQuote = () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createQuoteNode());
            }
        });
    };

    const handleClear = () => {
        if (window.confirm("Voulez-vous vraiment effacer tout le contenu ?")) {
            editor.update(() => {
                const root = $getRoot();
                root.clear();
                const paragraph = $createParagraphNode();
                root.append(paragraph);
            });
            onClear();
        }
    };

    return (
        <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 rounded-t-lg sticky top-0 z-10 backdrop-blur-sm">
            <button
                disabled={!canUndo}
                onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
                className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 disabled:opacity-30 text-neutral-600 dark:text-neutral-400 transition-colors"
                title="Annuler (Ctrl+Z)"
            >
                <Undo size={16} />
            </button>
            <button
                disabled={!canRedo}
                onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
                className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 disabled:opacity-30 text-neutral-600 dark:text-neutral-400 transition-colors"
                title="Rétablir (Ctrl+Y)"
            >
                <Redo size={16} />
            </button>

            <Divider />

            <button
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
                className={`p-1.5 rounded transition-colors ${isBold ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600" : "hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"}`}
                title="Gras"
            >
                <Bold size={16} />
            </button>
            <button
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
                className={`p-1.5 rounded transition-colors ${isItalic ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600" : "hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"}`}
                title="Italique"
            >
                <Italic size={16} />
            </button>
            <button
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
                className={`p-1.5 rounded transition-colors ${isUnderline ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600" : "hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"}`}
                title="Souligné"
            >
                <Underline size={16} />
            </button>
            <button
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")}
                className={`p-1.5 rounded transition-colors ${isStrikethrough ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600" : "hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"}`}
                title="Barré"
            >
                <Strikethrough size={16} />
            </button>

            <Divider />

            <button
                onClick={insertLink}
                className={`p-1.5 rounded transition-colors ${isLink ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600" : "hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"}`}
                title="Lien"
            >
                <Link size={16} />
            </button>

            <Divider />

            <button
                onClick={() => formatHeading('h1')}
                className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
                title="Titre 1"
            >
                <Heading1 size={16} />
            </button>
            <button
                onClick={() => formatHeading('h2')}
                className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
                title="Titre 2"
            >
                <Heading2 size={16} />
            </button>
            <button
                onClick={formatParagraph}
                className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
                title="Texte normal"
            >
                <Type size={16} />
            </button>
            <button
                onClick={formatQuote}
                className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
                title="Citation"
            >
                <Quote size={16} />
            </button>

            <Divider />

            <button
                onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
                className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
                title="Liste à puces"
            >
                <List size={16} />
            </button>
            <button
                onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
                className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
                title="Liste numérotée"
            >
                <ListOrdered size={16} />
            </button>

            <Divider />

            <div className="flex items-center">
                <button
                    onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")}
                    className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
                    title="Aligner à gauche"
                >
                    <AlignLeft size={16} />
                </button>
                <button
                    onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")}
                    className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
                    title="Centrer"
                >
                    <AlignCenter size={16} />
                </button>
                <button
                    onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")}
                    className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
                    title="Aligner à droite"
                >
                    <AlignRight size={16} />
                </button>
            </div>

            <Divider />

            <button
                onClick={handleClear}
                className="ml-auto flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                title="Tout effacer"
            >
                <Trash2 size={12} />
                Effacer
            </button>
        </div>
    );
}

// --- Plugins ---

function OnChangePlugin({ onChange }: { onChange: (text: string) => void }) {
    const [editor] = useLexicalComposerContext();
    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                const root = $getRoot();
                onChange(root.getTextContent());
            });
        });
    }, [editor, onChange]);
    return null;
}

function ContentUpdatePlugin({ value, isManual }: { value: string; isManual: boolean }) {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (!value) return;

        editor.update(() => {
            const root = $getRoot();
            const currentContent = root.getTextContent();

            if (currentContent === "" || !isManual) {
                root.clear();
                const lines = value.split('\n');
                lines.forEach(line => {
                    if (!line.trim()) return;
                    const paragraph = $createParagraphNode();

                    const headers = ["Description de l'entreprise", "Description du poste", "Qualifications", "Localisations"];
                    let matchedHeader = headers.find(h => line.startsWith(h));

                    if (matchedHeader) {
                        const boldText = $createTextNode(matchedHeader).toggleFormat("bold");
                        paragraph.append(boldText);
                        const remainingText = line.substring(matchedHeader.length);
                        if (remainingText) paragraph.append($createTextNode(remainingText));
                    } else {
                        paragraph.append($createTextNode(line));
                    }
                    root.append(paragraph);
                });
            }
        });
    }, [value, editor, isManual]);

    return null;
}

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
}

export default function RichTextEditor({ value, onChange, label }: RichTextEditorProps) {
    const initialConfig = {
        namespace: "FullWorkerEditor",
        theme,
        onError: (error: Error) => console.error(error),
        nodes: [
            HeadingNode,
            ListNode,
            ListItemNode,
            QuoteNode,
            LinkNode,
            AutoLinkNode,
        ],
    };

    const [isManual, setIsManual] = useState(false);

    return (
        <div className="space-y-3">
            {label && (
                <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-neutral-950 dark:text-neutral-50 block">
                        {label} <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                        Éditeur riche
                    </span>
                </div>
            )}


            {/* Responsibility & Action Required Card */}
            <div className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-900/30 rounded-xl p-4 flex items-start gap-4 animate-in fade-in slide-in-from-top-2 duration-500 mb-2">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                    <HelpCircle size={20} className="text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm text-neutral-800 dark:text-neutral-200 font-bold">
                            Action requise & Responsabilité
                        </p>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-full">
                            Important
                        </span>
                    </div>
                    <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                        L'IA a généré une base. <strong className="text-black dark:text-white underline decoration-amber-500">Vous devez impérativement ajouter la description de votre entreprise</strong>.
                        Vous êtes l'unique responsable du contenu final. Relisez et adaptez le texte à votre convenance pour garantir sa conformité.
                    </p>
                </div>
                <button className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors p-1.5 rounded-lg">
                    <X size={18} />
                </button>
            </div>

            <div className="group border border-neutral-300 dark:border-neutral-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-600/20 focus-within:border-blue-600 transition-all shadow-sm flex flex-col min-h-[450px]">
                <LexicalComposer initialConfig={initialConfig}>
                    <ToolbarPlugin onClear={() => onChange("")} />

                    <div className="relative flex-1 bg-white dark:bg-neutral-900 overflow-auto cursor-text">
                        <RichTextPlugin
                            contentEditable={
                                <ContentEditable className="outline-none p-4 md:p-6 min-h-[380px] prose dark:prose-invert max-w-none text-neutral-900 dark:text-neutral-100 selection:bg-blue-100 dark:selection:bg-blue-900/50" />
                            }
                            placeholder={
                                <div className="absolute top-4 md:top-6 left-4 md:left-6 text-neutral-400 pointer-events-none italic select-none">
                                    Détaillez le poste, les missions et l'environnement...
                                </div>
                            }
                            ErrorBoundary={LexicalErrorBoundary}
                        />
                        <HistoryPlugin />
                        <ListPlugin />
                        <LinkPlugin />
                        <CheckListPlugin />
                        <OnChangePlugin onChange={(newVal) => {
                            setIsManual(true);
                            onChange(newVal);
                        }} />
                        <ContentUpdatePlugin value={value} isManual={isManual} />
                    </div>

                    <div className="px-4 py-2 bg-neutral-50/50 dark:bg-neutral-900/50 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500">
                        <div className="flex items-center gap-2">
                            Conseil : Utilisez le **gras** pour les titres clés.
                        </div>
                        <div className="flex items-center gap-1.5">
                            Ce contenu vous aide ?
                            <div className="flex -space-x-px">
                                <button className="hover:bg-blue-50 dark:hover:bg-neutral-800 p-1 rounded-l border border-neutral-200 dark:border-neutral-800 transition-colors"><ThumbsUp size={10} /></button>
                                <button className="hover:bg-red-50 dark:hover:bg-neutral-800 p-1 rounded-r border border-neutral-200 dark:border-neutral-800 transition-colors"><ThumbsDown size={10} /></button>
                            </div>
                        </div>
                    </div>
                </LexicalComposer>
            </div>
        </div>
    );
}
