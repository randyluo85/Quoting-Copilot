"use client";

import * as React from "react";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  type ImperativePanelHandle,
} from "react-resizable-panels";
import { X } from "lucide-react";
import { cn } from "./utils";
import { Button } from "./button";

interface ResizableSidePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  className?: string;
}

export function ResizableSidePanel({
  open,
  onOpenChange,
  children,
  title,
  description,
  defaultSize = 30,
  minSize = 20,
  maxSize = 50,
  className,
}: ResizableSidePanelProps) {
  const panelRef = React.useRef<ImperativePanelHandle>(null);

  // 当面板关闭时，将其折叠到 0%
  React.useEffect(() => {
    if (panelRef.current) {
      if (open) {
        panelRef.current.expand();
      } else {
        panelRef.current.collapse();
      }
    }
  }, [open]);

  return (
    <div className={cn("flex h-full", className)}>
      <PanelGroup direction="horizontal" autoSaveId="resizable-side-panel">
        {/* 主内容区域 */}
        <Panel defaultSize={open ? 70 : 100} minSize={30}>
          {/* 主内容由父组件提供 */}
        </Panel>

        {/* 调整手柄 */}
        {open && (
          <PanelResizeHandle className="w-1 bg-border hover:bg-primary/50 cursor-col-resize transition-colors" />
        )}

        {/* 右侧面板 */}
        <Panel
          ref={panelRef}
          defaultSize={open ? defaultSize : 0}
          minSize={open ? minSize : 0}
          maxSize={open ? maxSize : 0}
          collapsible
          className={cn(
            "bg-background border-l overflow-hidden transition-opacity",
            !open && "opacity-0 pointer-events-none"
          )}
        >
          <div className="flex flex-col h-full">
            {/* 面板头部 */}
            {(title || description) && (
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b">
                <div className="flex flex-col gap-0.5">
                  {title && <h2 className="text-2xl font-semibold">{title}</h2>}
                  {description && <p className="text-zinc-500 text-sm">{description}</p>}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* 面板内容 */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {children}
            </div>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}

// 简化版：用于直接嵌入到现有布局中
// 不带遮罩层，主内容可以继续点击
// 默认打开且不可关闭的持久化侧边栏
interface SidePanelProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  width?: number;
  className?: string;
}

export function SidePanel({
  open = true,
  onOpenChange,
  children,
  title,
  description,
  width = 600,
  className
}: SidePanelProps) {
  return (
    <aside
      className={cn(
        "fixed top-0 right-0 h-full bg-background border-l shadow-lg z-50 flex flex-col",
        !open && "-translate-x-full",
        className
      )}
      style={{ width: `${width}px` }}
    >
      {/* 面板头部 */}
      {(title || description) && (
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b shrink-0">
          <div className="flex flex-col gap-0.5">
            {title && <h2 className="text-2xl font-semibold">{title}</h2>}
            {description && <p className="text-zinc-500 text-sm">{description}</p>}
          </div>
          {/* 移除关闭按钮，或设置为仅用于视觉（不可点击） */}
        </div>
      )}

      {/* 面板内容 */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </aside>
  );
}

export { Panel, PanelGroup, PanelResizeHandle };
