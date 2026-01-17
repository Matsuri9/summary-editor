import type { VersionInfo } from "../types";

// 自動保存の遅延時間（ミリ秒）
export const AUTO_SAVE_DELAY_MS = 1000;

// 保存中表示の維持時間（ミリ秒）  
export const SAVE_INDICATOR_DURATION_MS = 500;

// PDF ズームプリセット
export const ZOOM_PRESETS = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0] as const;

// PDF ズーム範囲
export const ZOOM_MIN = 0.1;
export const ZOOM_MAX = 2.0;
export const ZOOM_STEP = 0.1;

// パネルの最小幅（ピクセル）
export const PANEL_LEFT_MIN_WIDTH = 300;
export const PANEL_RIGHT_MIN_WIDTH = 300;
export const PANEL_DEFAULT_LEFT_WIDTH_PERCENT = 50;

// ファイル拡張子
export const PDF_EXTENSION = ".pdf";
export const MARKDOWN_EXTENSION = ".md";

// デフォルトのノートテンプレート
export const getDefaultNoteContent = () => `
> ここを編集してノートを記述できます。
> マークダウン記法を使えます。
`;

// 新規ノートのテンプレート
export const getNewNoteContent = (date: string) => `# 新しいノート

作成日: ${date}

## メモ

`;

// バージョン履歴
export const VERSION_HISTORY: VersionInfo[] = [
    {
        version: "v1.0.2",
        date: "2026-01-17",
        changes: [
            "リリースビルドの修正",
        ],
    },
    {
        version: "v1.0.0",
        date: "2026-01-17",
        changes: [
            "Initial Commit"
        ],
    }
];
