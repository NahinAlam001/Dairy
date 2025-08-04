"use client";

import React, { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Login } from "@/components/Login";
import { Diary } from "@/components/Diary";

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-2xl text-primary font-headline">
        Loading Diary...
      </div>
    );
  }

  // If there's no user, show the Login page
  if (!user) {
    return <Login />;
  }

  // If there IS a user, show the Diary and pass the user object to it
  return <Diary user={user} />;
}
