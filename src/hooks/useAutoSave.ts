import { useRef, useCallback, useEffect, useState } from "react";
import { AUTO_SAVE_DELAY_MS, SAVE_INDICATOR_DURATION_MS } from "../constants";

interface UseAutoSaveOptions {
    onSave?: (content: string) => void;
    filePath: string | null;
}

interface UseAutoSaveReturn {
    isSaving: boolean;
    lastSaved: Date | null;
    triggerAutoSave: (content: string) => void;
    manualSave: (content: string) => void;
}

/**
 * 自動保存機能を提供するカスタムフック
 */
export function useAutoSave({
    onSave,
    filePath,
}: UseAutoSaveOptions): UseAutoSaveReturn {
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // 自動保存のトリガー
    const triggerAutoSave = useCallback(
        (newContent: string) => {
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }

            autoSaveTimeoutRef.current = setTimeout(() => {
                if (onSave && filePath) {
                    setIsSaving(true);
                    onSave(newContent);
                    setLastSaved(new Date());
                    setTimeout(() => setIsSaving(false), SAVE_INDICATOR_DURATION_MS);
                }
            }, AUTO_SAVE_DELAY_MS);
        },
        [onSave, filePath]
    );

    // 手動保存
    const manualSave = useCallback(
        (content: string) => {
            if (onSave && filePath) {
                setIsSaving(true);
                onSave(content);
                setLastSaved(new Date());
                setTimeout(() => setIsSaving(false), SAVE_INDICATOR_DURATION_MS);
            }
        },
        [onSave, filePath]
    );

    // クリーンアップ
    useEffect(() => {
        return () => {
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }
        };
    }, []);

    return {
        isSaving,
        lastSaved,
        triggerAutoSave,
        manualSave,
    };
}
