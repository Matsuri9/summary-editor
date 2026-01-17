import { useCallback } from "react";
import type { TauriModules } from "./useTauriModules";
import type { FileItem } from "../types";
import { mockFs, mockPath, mockOpener } from "../lib/tauri";
import { getNewNoteContent } from "../constants";

interface UseFileOperationsOptions {
    tauriModules: TauriModules;
    workspacePath: string | null;
    onRefresh: () => Promise<void>;
}

/**
 * ファイル操作（作成、削除、コピー、名前変更など）を提供するカスタムフック
 */
export function useFileOperations({
    tauriModules,
    workspacePath,
    onRefresh,
}: UseFileOperationsOptions) {
    // 新規ノート作成
    const createNewNote = useCallback(async (): Promise<{
        path: string;
        content: string;
    } | null> => {
        if (!workspacePath || !tauriModules.fs || !tauriModules.path) {
            return null;
        }

        try {
            const join = tauriModules.path.join;
            const exists = tauriModules.fs.exists;
            const writeTextFile = tauriModules.fs.writeTextFile;

            const timestamp = new Date().toISOString().slice(0, 10);
            let fileName = `note_${timestamp}.md`;
            let filePath = await join(workspacePath, fileName);

            let counter = 1;
            while (await exists(filePath)) {
                fileName = `note_${timestamp}_${counter}.md`;
                filePath = await join(workspacePath, fileName);
                counter++;
            }

            const initialContent = getNewNoteContent(
                new Date().toLocaleDateString("ja-JP")
            );
            await writeTextFile(filePath, initialContent);
            await onRefresh();

            return { path: filePath, content: initialContent };
        } catch (error) {
            console.error("Failed to create new note:", error);
            return null;
        }
    }, [workspacePath, tauriModules, onRefresh]);

    // フォルダ作成
    const createNewFolder = useCallback(
        async (folderName: string): Promise<boolean> => {
            if (!workspacePath || !tauriModules.fs || !tauriModules.path) {
                return false;
            }

            try {
                const join = tauriModules.path.join;
                const mkdir = tauriModules.fs.mkdir;

                const folderPath = await join(workspacePath, folderName);
                await mkdir(folderPath);
                await onRefresh();
                return true;
            } catch (error) {
                console.error("Failed to create folder:", error);
                return false;
            }
        },
        [workspacePath, tauriModules, onRefresh]
    );

    // ファイル名変更
    const renameFile = useCallback(
        async (item: FileItem, newName: string): Promise<boolean> => {
            try {
                const dirname = tauriModules.path?.dirname ?? mockPath.dirname;
                const join = tauriModules.path?.join ?? mockPath.join;
                const rename = tauriModules.fs?.rename ?? mockFs.rename;

                const dir = await dirname(item.path);
                const newPath = await join(dir, newName);
                await rename(item.path, newPath);
                await onRefresh();
                return true;
            } catch (error) {
                console.error("Failed to rename:", error);
                return false;
            }
        },
        [tauriModules, onRefresh]
    );

    // ファイル削除
    const deleteFile = useCallback(
        async (item: FileItem): Promise<boolean> => {
            try {
                const remove = tauriModules.fs?.remove ?? mockFs.remove;
                await remove(item.path);
                await onRefresh();
                return true;
            } catch (error) {
                console.error("Failed to delete:", error);
                return false;
            }
        },
        [tauriModules, onRefresh]
    );

    // ファイルコピー
    const copyFile = useCallback(
        async (item: FileItem): Promise<boolean> => {
            try {
                const dirname = tauriModules.path?.dirname ?? mockPath.dirname;
                const join = tauriModules.path?.join ?? mockPath.join;
                const copyFileFn = tauriModules.fs?.copyFile ?? mockFs.copyFile;
                const exists = tauriModules.fs?.exists ?? mockFs.exists;

                const dir = await dirname(item.path);
                const ext = item.name.includes(".")
                    ? "." + item.name.split(".").pop()
                    : "";
                const baseName = item.name.replace(ext, "");

                let newName = `${baseName}_copy${ext}`;
                let newPath = await join(dir, newName);

                let counter = 2;
                while (await exists(newPath)) {
                    newName = `${baseName}_copy${counter}${ext}`;
                    newPath = await join(dir, newName);
                    counter++;
                }

                await copyFileFn(item.path, newPath);
                await onRefresh();
                return true;
            } catch (error) {
                console.error("Failed to copy:", error);
                return false;
            }
        },
        [tauriModules, onRefresh]
    );

    // エクスプローラーで表示
    const revealInExplorer = useCallback(
        async (item: FileItem): Promise<boolean> => {
            try {
                const revealItemInDir =
                    tauriModules.opener?.revealItemInDir ?? mockOpener.revealItemInDir;
                await revealItemInDir(item.path);
                return true;
            } catch (error) {
                console.error("Failed to reveal in explorer:", error);
                return false;
            }
        },
        [tauriModules]
    );

    return {
        createNewNote,
        createNewFolder,
        renameFile,
        deleteFile,
        copyFile,
        revealInExplorer,
    };
}
