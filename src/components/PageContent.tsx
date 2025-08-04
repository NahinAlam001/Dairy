// src/components/PageContent.tsx
"use client";

import React, { useRef, useState } from "react";
import type { User } from "firebase/auth";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "@/lib/firebase";
import { DraggableImage } from "./DraggableImage";
import { TagSuggestions } from "./TagSuggestions";
import type { DiaryEntry, DiaryImage } from "@/types";
import { Button } from "./ui/button";
import { Trash2, ImagePlus } from "lucide-react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { useToast } from "@/hooks/use-toast";
import { PasswordPrompt } from "./ui/password-prompt";

interface PageContentProps {
  entry: DiaryEntry | undefined;
  onUpdate: (entry: DiaryEntry) => void;
  onSave: (entry: DiaryEntry) => void;
  isSaving: boolean;
  onDeleteRequest: () => void;
  user: User | null;
}

export const PageContent = ({
  entry,
  onUpdate,
  onSave,
  isSaving,
  onDeleteRequest,
  user,
}: PageContentProps) => {
  const pageRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [isPasswordPromptOpen, setIsPasswordPromptOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const withPasswordProtection = (action: () => void) => {
    setPendingAction(() => action);
    setIsPasswordPromptOpen(true);
  };

  const handleConfirmPassword = () => {
    if (pendingAction) {
      pendingAction();
    }
    setPendingAction(null);
  };

  const handleFileUpload = async (file: File) => {
    if (!user || !entry || !file || !file.type.startsWith("image/")) return;

    const action = async () => {
      console.log("Starting image upload...");

      const x = 50;
      const y = 50;

      const storageRef = ref(
        storage,
        `images/${user.uid}/${entry.id}/${Date.now()}_${file.name}`,
      );

      try {
        const snapshot = await uploadBytes(storageRef, file);
        console.log("Image uploaded successfully!", snapshot);

        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log("Got download URL:", downloadURL);

        const newImage: DiaryImage = {
          id: crypto.randomUUID(),
          src: downloadURL,
          x: x,
          y: y,
          width: 200,
          height: 150,
        };

        const updatedImages = [...(entry.images || []), newImage];
        const updatedEntry = { ...entry, images: updatedImages };

        console.log("Updating entry with new image:", updatedEntry);

        onUpdate(updatedEntry);
        onSave(updatedEntry);
      } catch (error) {
        console.error("Error uploading image:", error);
        toast({
          variant: "destructive",
          title: "Upload Failed",
          description: "There was an error uploading your image.",
        });
      }
    };

    withPasswordProtection(action);
  };

  const handleImageUpdate = (updatedImage: DiaryImage) => {
    if (!entry) return;
    const updatedImages = (entry.images || []).map((img) =>
      img.id === updatedImage.id ? updatedImage : img,
    );
    onUpdate({ ...entry, images: updatedImages });
  };

  const handleImageDelete = async (imageToDelete: DiaryImage) => {
    if (!entry) return;

    const action = async () => {
      const imageStorageRef = ref(storage, imageToDelete.src);
      try {
        await deleteObject(imageStorageRef);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Image Deletion Failed",
          description: "The image may have already been deleted.",
        });
      }
      const updatedImages = (entry.images || []).filter(
        (img) => img.id !== imageToDelete.id,
      );
      const updatedEntry = { ...entry, images: updatedImages };
      onUpdate(updatedEntry);
      onSave(updatedEntry);
    };

    withPasswordProtection(action);
  };

  const handleTagsUpdate = (newTags: string[]) => {
    if (!entry) return;
    const updatedEntry = { ...entry, tags: newTags };
    onUpdate(updatedEntry);
    withPasswordProtection(() => onSave(updatedEntry));
  };

  if (!entry) {
    return <div className="page-content w-full h-full"></div>;
  }

  return (
    <div
      ref={pageRef}
      className="page-content w-full h-full p-4 md:p-12 flex flex-col relative"
    >
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 border-b-2 border-primary/20 pb-2 mb-4 z-10">
        <Input
          type="text"
          value={entry.title}
          onChange={(e) => onUpdate({ ...entry, title: e.target.value })}
          onBlur={() => onSave(entry)}
          className="font-headline text-2xl md:text-4xl bg-transparent w-full focus:outline-none border-0 shadow-none px-0 h-auto"
          placeholder="A New Chapter"
        />
        <div className="flex space-x-2 flex-shrink-0">
          <Button onClick={() => onSave(entry)} size="sm" disabled={isSaving}>
            {isSaving ? "Saved!" : "Save"}
          </Button>
          <Button onClick={onDeleteRequest} size="sm" variant="ghost">
            <Trash2 className="w-4 h-4 text-destructive/70" />
          </Button>
        </div>
      </div>
      <Textarea
        value={entry.content}
        onChange={(e) => onUpdate({ ...entry, content: e.target.value })}
        onBlur={() => onSave(entry)}
        className="font-body text-base md:text-lg flex-grow bg-transparent w-full focus:outline-none resize-none border-0 shadow-none px-0 leading-relaxed z-0"
        placeholder="Your story starts here... Add images using the button below."
      />
      <div className="mt-4 z-10 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <Button
            onClick={() => fileInputRef.current?.click()}
            size="sm"
            variant="outline"
            className="w-full md:w-auto"
          >
            <ImagePlus className="mr-2 h-4 w-4" />
            Add Image
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) =>
              e.target.files && handleFileUpload(e.target.files[0])
            }
          />
          <TagSuggestions
            content={entry.content}
            currentTags={entry.tags || []}
            onTagsUpdate={handleTagsUpdate}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(entry.tags || []).map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {(entry.images || []).map((img) => (
          <DraggableImage
            key={img.id}
            imageData={img}
            onUpdate={handleImageUpdate}
            onSave={() => onSave({ ...entry, images: entry.images })}
            onDelete={handleImageDelete}
            pageRef={pageRef}
          />
        ))}
      </div>
      <PasswordPrompt
        isOpen={isPasswordPromptOpen}
        onClose={() => setIsPasswordPromptOpen(false)}
        onConfirm={handleConfirmPassword}
      />
    </div>
  );
};
