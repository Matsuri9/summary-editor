// Check if we're running in Tauri environment
export const isTauri = (): boolean => {
    // Tauri v2 uses __TAURI_INTERNALS__ or we can check for the existence of Tauri metadata
    return typeof window !== "undefined" && (
        "__TAURI__" in window ||
        "__TAURI_INTERNALS__" in window ||
        // Additional check for Tauri v2
        (window as any).__TAURI_INTERNALS__ !== undefined
    );
};

// Mock implementations for browser development
export const mockDialog = {
    open: async (_options?: unknown): Promise<string | null> => {
        console.log("[Mock] Dialog open called - not available in browser");
        return null;
    },
};

export const mockFs = {
    readDir: async (_path: string): Promise<{ name: string; isDirectory: boolean }[]> => {
        console.log("[Mock] readDir called - not available in browser");
        return [];
    },
    readTextFile: async (_path: string): Promise<string> => {
        console.log("[Mock] readTextFile called - not available in browser");
        return "";
    },
    writeTextFile: async (_path: string, _content: string): Promise<void> => {
        console.log("[Mock] writeTextFile called - not available in browser");
    },
    exists: async (_path: string): Promise<boolean> => {
        console.log("[Mock] exists called - not available in browser");
        return false;
    },
    remove: async (_path: string): Promise<void> => {
        console.log("[Mock] remove called - not available in browser");
    },
    rename: async (_oldPath: string, _newPath: string): Promise<void> => {
        console.log("[Mock] rename called - not available in browser");
    },
    copyFile: async (_src: string, _dest: string): Promise<void> => {
        console.log("[Mock] copyFile called - not available in browser");
    },
    mkdir: async (_path: string): Promise<void> => {
        console.log("[Mock] mkdir called - not available in browser");
    },
};

export const mockPath = {
    join: async (...paths: string[]): Promise<string> => {
        return paths.join("/");
    },
    dirname: async (path: string): Promise<string> => {
        const parts = path.split("/");
        parts.pop();
        return parts.join("/");
    },
    basename: async (path: string): Promise<string> => {
        return path.split("/").pop() || "";
    },
};

export const mockOpener = {
    revealItemInDir: async (_path: string): Promise<void> => {
        console.log("[Mock] revealItemInDir called - not available in browser");
    },
};
