"use client";

import React, { useState, useEffect } from "react";
import type { User } from "firebase/auth";
import { signOut } from "firebase/auth"; // Import signOut
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  doc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { DiaryEntry } from "@/types";
import { AntiqueOwlIcon, ClaspIcon } from "@/components/icons";
import { PageContent } from "@/components/PageContent";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, LogOut } from "lucide-react"; // Import LogOut icon

const APP_ID = "default-app-id";

interface DiaryProps {
  user: User;
}

export const Diary = ({ user }: DiaryProps) => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isDiaryOpen, setIsDiaryOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<DiaryEntry | null>(
    null,
  );
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, `diaries/${APP_ID}/users/${user.uid}/entries`),
      orderBy("timestamp", "asc"),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const diaryEntries = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as DiaryEntry,
      );
      setEntries(diaryEntries);
    });
    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // The onAuthStateChanged listener in page.tsx will handle showing the login screen.
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handlePageFlip = (direction: number) => {
    if (isFlipping) return;
    const newIndex = currentIndex + direction * 2;
    if (newIndex >= 0 && newIndex <= entries.length) {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentIndex(newIndex);
        setIsFlipping(false);
      }, 900);
    }
  };

  const handleUpdateEntry = (updatedEntry: DiaryEntry) => {
    setEntries(
      entries.map((e) => (e.id === updatedEntry.id ? updatedEntry : e)),
    );
  };

  const handleSaveEntry = async (entryToSave: DiaryEntry) => {
    if (!user || !entryToSave.id) return;
    setIsSaving(true);
    const { id, ...dataToSave } = entryToSave;
    const docRef = doc(db, `diaries/${APP_ID}/users/${user.uid}/entries`, id);
    await updateDoc(docRef, dataToSave);
    setTimeout(() => setIsSaving(false), 1500);
  };

  const handleNewEntry = async () => {
    if (!user) return;
    await addDoc(
      collection(db, `diaries/${APP_ID}/users/${user.uid}/entries`),
      {
        title: "A New Chapter",
        content: "Once upon a time...",
        images: [],
        tags: [],
        timestamp: serverTimestamp(),
      },
    );
    const newLastPageIndex = Math.floor(entries.length / 2) * 2;
    if (currentIndex !== newLastPageIndex) {
      handlePageFlip(1);
    }
  };

  const handleDelete = async () => {
    if (!user || !showDeleteConfirm) return;
    await deleteDoc(
      doc(
        db,
        `diaries/${APP_ID}/users/${user.uid}/entries`,
        showDeleteConfirm.id,
      ),
    );
    if (currentIndex > 0 && currentIndex >= entries.length - 2) {
      setCurrentIndex((prev) => Math.max(0, prev - 2));
    }
    setShowDeleteConfirm(null);
  };

  const leftEntry = entries[currentIndex];
  const rightEntry = entries[currentIndex + 1];

  return (
    <>
      <main className="min-h-screen flex items-center justify-center p-4 overflow-hidden">
        <div
          className={`book ${isDiaryOpen ? "open" : ""} w-[95vw] h-[90vh] max-w-7xl relative`}
        >
          <div
            className="absolute w-1/2 h-full top-0 left-0 bg-[#6d4c41] rounded-l-2xl shadow-2xl"
            style={{
              backgroundImage:
                "url(https://www.toptal.com/designers/subtlepatterns/uploads/leather.png)",
            }}
          ></div>
          <div
            className="absolute w-full h-full flex items-stretch"
            style={{ transform: "translateZ(-1px)" }}
          >
            <div className="w-1/2 h-full page-texture rounded-l-2xl">
              {isDiaryOpen && (
                <PageContent
                  entry={leftEntry}
                  onUpdate={handleUpdateEntry}
                  onSave={handleSaveEntry}
                  isSaving={isSaving}
                  onDeleteRequest={() => setShowDeleteConfirm(leftEntry)}
                  user={user}
                />
              )}
            </div>
            <div className="w-1/2 h-full page-texture rounded-r-2xl">
              {isDiaryOpen && (
                <PageContent
                  entry={rightEntry}
                  onUpdate={handleUpdateEntry}
                  onSave={handleSaveEntry}
                  isSaving={isSaving}
                  onDeleteRequest={() => setShowDeleteConfirm(rightEntry)}
                  user={user}
                />
              )}
            </div>
          </div>
          {isDiaryOpen && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute bottom-2 left-2 w-16 h-16 rounded-full group z-20"
                onClick={() => handlePageFlip(-1)}
                disabled={currentIndex === 0 || isFlipping}
              >
                <ChevronLeft className="w-8 h-8 opacity-50 group-hover:opacity-100" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute bottom-2 right-2 w-16 h-16 rounded-full group z-20"
                onClick={() => handlePageFlip(1)}
                disabled={currentIndex >= entries.length - 2 || isFlipping}
              >
                <ChevronRight className="w-8 h-8 opacity-50 group-hover:opacity-100" />
              </Button>
              <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                <Button
                  onClick={handleNewEntry}
                  className="font-headline shadow-lg"
                >
                  <Plus className="mr-2 h-4 w-4" /> New Page
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </>
          )}
          <div
            className="book-cover absolute w-1/2 h-full top-0 left-0 bg-[#6d4c41] rounded-l-2xl shadow-2xl flex items-center justify-center z-30"
            style={{
              backgroundImage:
                "url(https://www.toptal.com/designers/subtlepatterns/uploads/leather.png)",
            }}
          >
            <div className="w-full h-full flex items-center justify-center relative p-8">
              <div className="flex flex-col items-center text-center text-primary-foreground/80">
                <h1 className="font-headline text-5xl">Memorable Moments</h1>
                <div className="w-60 h-60 my-4">
                  <AntiqueOwlIcon />
                </div>
                <p className="font-body italic">
                  Your personal diary, unlocked.
                </p>
              </div>
              <ClaspIcon
                onClick={() => setIsDiaryOpen(!isDiaryOpen)}
                isLocked={!isDiaryOpen}
              />
            </div>
          </div>
        </div>
      </main>

      <AlertDialog
        open={!!showDeleteConfirm}
        onOpenChange={(open) => !open && setShowDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline">
              Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-body">
              This action cannot be undone. This will permanently tear the page
              from your diary.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteConfirm(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, delete it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
