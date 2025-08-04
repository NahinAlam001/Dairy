// src/components/ui/password-prompt.tsx
"use client";

import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface PasswordPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const CORRECT_PASSWORD = "123nahin";

export function PasswordPrompt({
  isOpen,
  onClose,
  onConfirm,
}: PasswordPromptProps) {
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleConfirm = () => {
    if (password === CORRECT_PASSWORD) {
      onConfirm();
      onClose();
      setPassword("");
    } else {
      toast({
        variant: "destructive",
        title: "Incorrect Password",
        description: "The password you entered is incorrect.",
      });
      setPassword("");
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setPassword("");
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Enter Password</AlertDialogTitle>
          <AlertDialogDescription>
            This action requires a password to proceed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2">
          <Label htmlFor="password-prompt">Password</Label>
          <Input
            id="password-prompt"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleConfirm();
              }
            }}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
