"use client";

import { useState, useCallback, useRef } from 'react';

export function useMentions() {
    const [mentionQuery, setMentionQuery] = useState<string | null>(null);
    const [dropdownRect, setDropdownRect] = useState<DOMRect | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleTextChange = useCallback((text: string, selectionStart: number) => {
        const textBeforeCursor = text.slice(0, selectionStart);
        const lastAt = textBeforeCursor.lastIndexOf('@');

        if (lastAt !== -1) {
            const textAfterAt = textBeforeCursor.slice(lastAt + 1);
            // Si l'arobase est précédé par un espace ou s'il est au début du texte
            const isAtStart = lastAt === 0 || /\s/.test(textBeforeCursor[lastAt - 1]);

            // Si on n'a pas d'espace entre @ et le curseur
            if (isAtStart && !/\s/.test(textAfterAt)) {
                setMentionQuery(textAfterAt);

                if (textareaRef.current) {
                    const rect = textareaRef.current.getBoundingClientRect();
                    // On pourrait affiner la position ici mais pour l'instant on se base sur le textarea
                    setDropdownRect(rect);
                }
                return;
            }
        }
        setMentionQuery(null);
    }, []);

    const insertMention = useCallback((username: string, text: string, selectionStart: number) => {
        const textBeforeCursor = text.slice(0, selectionStart);
        const lastAt = textBeforeCursor.lastIndexOf('@');

        const start = text.slice(0, lastAt);
        const end = text.slice(selectionStart);
        const newText = `${start}@${username} ${end}`;

        setMentionQuery(null);
        return newText;
    }, []);

    return {
        mentionQuery,
        dropdownRect,
        handleTextChange,
        insertMention,
        textareaRef
    };
}
