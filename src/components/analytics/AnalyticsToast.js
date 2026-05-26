"use client";
import { useState, useEffect } from 'react';
import Toast from '../ui/Toast';

export default function AnalyticsToast({ error }) {
  const [isOpen, setIsOpen] = useState(false);

  // If the server passes down an error string, open the toast.
  useEffect(() => {
    if (error) {
      setIsOpen(true);
    }
  }, [error]);

  return (
    <Toast
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="Error"
      description={error || ""}
      type="error"
    />
  );
}