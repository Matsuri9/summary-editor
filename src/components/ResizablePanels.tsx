import { useState, useRef, useCallback, useEffect } from "react";

interface ResizablePanelsProps {
    leftPanel: React.ReactNode;
    rightPanel: React.ReactNode;
    leftMinWidth?: number;
    rightMinWidth?: number;
    defaultLeftWidth?: number;
}

export function ResizablePanels({
    leftPanel,
    rightPanel,
    leftMinWidth = 300,
    rightMinWidth = 300,
    defaultLeftWidth = 50, // percentage
}: ResizablePanelsProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [leftWidth, setLeftWidth] = useState(defaultLeftWidth);
    const [isDragging, setIsDragging] = useState(false);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isDragging || !containerRef.current) return;

            const containerRect = containerRef.current.getBoundingClientRect();
            const containerWidth = containerRect.width;
            const mouseX = e.clientX - containerRect.left;

            // Calculate percentage
            let newLeftWidth = (mouseX / containerWidth) * 100;

            // Apply min width constraints
            const minLeftPercent = (leftMinWidth / containerWidth) * 100;
            const minRightPercent = (rightMinWidth / containerWidth) * 100;
            const maxLeftPercent = 100 - minRightPercent;

            newLeftWidth = Math.max(minLeftPercent, Math.min(maxLeftPercent, newLeftWidth));

            setLeftWidth(newLeftWidth);
        },
        [isDragging, leftMinWidth, rightMinWidth]
    );

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (isDragging) {
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
            document.body.style.cursor = "col-resize";
            document.body.style.userSelect = "none";
        }

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    return (
        <div ref={containerRef} className="flex-1 flex overflow-hidden">
            {/* Left Panel */}
            <div
                className="flex flex-col bg-white overflow-hidden"
                style={{ width: `${leftWidth}%` }}
            >
                {leftPanel}
            </div>

            {/* Resizer */}
            <div
                onMouseDown={handleMouseDown}
                className={`w-1 bg-gray-200 hover:bg-gray-400 cursor-col-resize transition-colors flex-shrink-0 relative group ${isDragging ? "bg-gray-400" : ""
                    }`}
            >
                {/* Drag handle indicator */}
                <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center pointer-events-none">
                    <div
                        className={`w-1 h-8 rounded-full transition-colors ${isDragging ? "bg-gray-500" : "bg-gray-300 group-hover:bg-gray-500"
                            }`}
                    />
                </div>
            </div>

            {/* Right Panel */}
            <div
                className="flex flex-col bg-white overflow-hidden"
                style={{ width: `${100 - leftWidth}%` }}
            >
                {rightPanel}
            </div>
        </div>
    );
}
