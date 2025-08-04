"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import type { DiaryImage } from "@/types";
import { Button } from "./ui/button";
import { X } from "lucide-react";

interface DraggableImageProps {
  imageData: DiaryImage;
  onUpdate: (data: DiaryImage) => void;
  onSave: () => void;
  onDelete: (data: DiaryImage) => void;
  pageRef: React.RefObject<HTMLDivElement>;
}

export const DraggableImage = ({
  imageData,
  onUpdate,
  onSave,
  onDelete,
  pageRef,
}: DraggableImageProps) => {
  console.log("Rendering DraggableImage with data:", imageData);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (
    e: React.MouseEvent<HTMLDivElement>,
    action: "drag" | "resize",
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (action === "drag") {
      setIsDragging(true);
      dragStartPos.current = {
        x: e.clientX - imageData.x,
        y: e.clientY - imageData.y,
      };
    }
    if (action === "resize") setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging && !isResizing) return;
      if (!pageRef.current) return;

      e.stopPropagation();

      const parentRect = pageRef.current.getBoundingClientRect();

      if (isDragging) {
        const newX = e.clientX - dragStartPos.current.x;
        const newY = e.clientY - dragStartPos.current.y;
        onUpdate({ ...imageData, x: newX, y: newY });
      }

      if (isResizing) {
        const newWidth = e.clientX - parentRect.left - imageData.x;
        const newHeight = e.clientY - parentRect.top - imageData.y;
        onUpdate({
          ...imageData,
          width: Math.max(50, newWidth),
          height: Math.max(50, newHeight),
        });
      }
    };

    const handleMouseUp = () => {
      if (isDragging || isResizing) onSave();
      setIsDragging(false);
      setIsResizing(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing, imageData, onUpdate, onSave, pageRef]);

  return (
    <div
      ref={imageRef}
      className="absolute cursor-move border-2 border-transparent hover:border-accent group draggable-image"
      style={{
        left: imageData.x,
        top: imageData.y,
        width: imageData.width,
        height: imageData.height,
      }}
      onMouseDown={(e) => handleMouseDown(e, "drag")}
    >
      <Image
        src={imageData.src}
        className="w-full h-full object-cover select-none"
        alt="User memory"
        width={imageData.width}
        height={imageData.height}
        draggable="false"
      />
      <div
        className="absolute -bottom-2 -right-2 w-4 h-4 bg-accent rounded-full cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"
        onMouseDown={(e) => handleMouseDown(e, "resize")}
      ></div>
      <Button
        variant="destructive"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(imageData);
        }}
        className="absolute -top-3 -right-3 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
