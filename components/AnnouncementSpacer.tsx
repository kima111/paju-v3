'use client';

import { useState, useEffect } from 'react';

export default function AnnouncementSpacer() {
  const [hasAnnouncements, setHasAnnouncements] = useState(false);

  useEffect(() => {
    const checkAnnouncements = async () => {
      try {
        const response = await fetch('/api/announcements?active=true');
        if (response.ok) {
          const announcements = await response.json();
          setHasAnnouncements(announcements.length > 0);
        }
      } catch (error) {
        console.error('Error checking announcements:', error);
      }
    };

    checkAnnouncements();
  }, []);

  if (!hasAnnouncements) {
    return null;
  }

  return <div className="h-12"></div>;
}