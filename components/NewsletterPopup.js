"use client";

import { useState, useEffect } from "react";
import NewsletterSubscription from "./NewsletterSubscription";

export default function NewsletterPopup() {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Local storage'dan popup'ın daha önce gösterilip gösterilmediğini kontrol et
    const hasShownPopup = localStorage.getItem("hasShownNewsletterPopup");
    if (hasShownPopup) return;

    // 45 saniye sonra popup'ı göster
    const timer = setTimeout(() => {
      setShowPopup(true);
      localStorage.setItem("hasShownNewsletterPopup", "true");
    }, 3000); // 45 saniye

    return () => clearTimeout(timer);
  }, []);

  if (!showPopup) return null;

  return (
    <div className="fixed bottom-4 right-0 md:right-4 lg:right-8 z-50 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-3xl">
      <button
        onClick={() => setShowPopup(false)}
        className="cursor-pointer absolute top-2 right-4 text-gray-900 hover:text-gray-950 dark:text-gray-200 dark:hover:text-gray-200 text-xl"
      >
        ✕
      </button>
      <h3 className="text-lg font-semibold mb-2 dark:text-white">
        So, do you like what you&apos;re reading?
      </h3>
      <NewsletterSubscription />
    </div>
  );
}
