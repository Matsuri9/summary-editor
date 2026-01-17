import { PDF_EXTENSION, MARKDOWN_EXTENSION } from "../constants";

/**
 * ファイルパスからファイル名を抽出する
 * Windows（\）とUnix（/）の両方のパス区切りに対応
 */
export function getFileName(path: string | null): string | null {
    if (!path) return null;
    return path.split(/[/\\]/).pop() || null;
}

/**
 * ファイルがPDFかどうかを判定する
 */
export function isPdfFile(fileName: string): boolean {
    return fileName.toLowerCase().endsWith(PDF_EXTENSION);
}

/**
 * ファイルがMarkdownかどうかを判定する
 */
export function isMarkdownFile(fileName: string): boolean {
    return fileName.toLowerCase().endsWith(MARKDOWN_EXTENSION);
}

/**
 * ファイルの拡張子を取得する
 */
export function getFileExtension(fileName: string): string {
    const dotIndex = fileName.lastIndexOf(".");
    return dotIndex > 0 ? fileName.slice(dotIndex) : "";
}

/**
 * ファイル名から拡張子を除いた部分を取得する
 */
export function getFileBaseName(fileName: string): string {
    const dotIndex = fileName.lastIndexOf(".");
    return dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName;
}
