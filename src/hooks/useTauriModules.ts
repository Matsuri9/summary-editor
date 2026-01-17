import { useState, useEffect } from "react";
import { isTauri } from "../lib/tauri";

export interface TauriModules {
    dialog: typeof import("@tauri-apps/plugin-dialog") | null;
    fs: typeof import("@tauri-apps/plugin-fs") | null;
    path: typeof import("@tauri-apps/api/path") | null;
    opener: typeof import("@tauri-apps/plugin-opener") | null;
}

/**
 * Tauriモジュールを動的にロードするカスタムフック
 * ブラウザ環境では全てnullを返す
 */
export function useTauriModules(): TauriModules {
    const [modules, setModules] = useState<TauriModules>({
        dialog: null,
        fs: null,
        path: null,
        opener: null,
    });

    useEffect(() => {
        if (isTauri()) {
            Promise.all([
                import("@tauri-apps/plugin-dialog"),
                import("@tauri-apps/plugin-fs"),
                import("@tauri-apps/api/path"),
                import("@tauri-apps/plugin-opener"),
            ]).then(([dialog, fs, path, opener]) => {
                setModules({ dialog, fs, path, opener });
            });
        }
    }, []);

    return modules;
}
