'use client';

import { useState, useEffect } from 'react';

interface Announcement {
  id: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  startDate?: Date;
  endDate?: Date;
}

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has dismissed announcements recently
    const dismissed = localStorage.getItem('announcementsDismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const hoursSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60);
    
    // Show announcements again after 24 hours
    if (hoursSinceDismissed < 24) {
      setIsVisible(false);
    }
    
    fetchActiveAnnouncements();
  }, []);

  useEffect(() => {
    if (announcements.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % announcements.length);
      }, 5000); // Change every 5 seconds

      return () => clearInterval(interval);
    }
  }, [announcements.length]);

  const fetchActiveAnnouncements = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/announcements?active=true');
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data);
      } else {
        console.error('Failed to fetch announcements:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityStyles = () => {
    // Subtle cream/beige color for all announcements
    return 'bg-amber-50 border-amber-100 text-amber-900';
  };

  if (isLoading) {
    return null; // Don't show anything while loading
  }

  if (!isVisible || announcements.length === 0) {
    return null;
  }

  const currentAnnouncement = announcements[currentIndex];

  return (
    <div className={`fixed top-16 left-0 right-0 z-40 w-full ${getPriorityStyles()} border-b py-2`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center space-x-3">
              <span className="text-sm opacity-90">{currentAnnouncement.message}</span>
            </div>
          </div>
          
          {announcements.length > 1 && (
            <div className="flex items-center space-x-1 mr-4">
              {announcements.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-1.5 h-1.5 rounded-full transition-opacity ${
                    index === currentIndex ? 'bg-amber-700' : 'bg-amber-400'
                  }`}
                />
              ))}
            </div>
          )}
          
          <button
            onClick={() => {
              setIsVisible(false);
              localStorage.setItem('announcementsDismissed', Date.now().toString());
            }}
            className="text-amber-700 hover:text-amber-900 transition-colors p-1 opacity-60 hover:opacity-100"
            aria-label="Close announcement"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}