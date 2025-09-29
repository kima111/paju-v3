'use client';

import { useState, useEffect } from 'react';
import { RestaurantHours } from '../lib/database';

export default function RestaurantHoursDisplay() {
  const [hours, setHours] = useState<RestaurantHours[]>([]);
  const [loading, setLoading] = useState(true);
  const [dayGroups, setDayGroups] = useState<RestaurantHours[][]>([]);

  useEffect(() => {
    fetchHours();
    
    // Set up periodic refresh every 5 seconds to catch CMS changes quickly (for testing)
    const interval = setInterval(fetchHours, 5000);
    
    // Also refresh when the page becomes visible (user switches back to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchHours();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Re-group whenever hours data changes
  useEffect(() => {
    if (hours.length > 0) {
      console.log('Hours data changed, re-grouping...');
      const groupConsecutiveDays = () => {
        console.log('Grouping consecutive days with same hours');
        
        if (hours.length === 0) {
          console.log('No hours data to group');
          return [];
        }

        const groups: RestaurantHours[][] = [];
        let currentGroup: RestaurantHours[] = [hours[0]];
        
        for (let i = 1; i < hours.length; i++) {
          const currentHour = hours[i];
          const lastInGroup = currentGroup[currentGroup.length - 1];
          
          if (areHoursEqual(currentHour, lastInGroup)) {
            currentGroup.push(currentHour);
          } else {
            groups.push(currentGroup);
            currentGroup = [currentHour];
          }
        }
        
        groups.push(currentGroup);
        
        console.log('Groups created:', groups.map(group => ({
          days: group.map(h => h.dayOfWeek),
          sample: group[0]
        })));
        
        return groups;
      };
      
      const groups = groupConsecutiveDays();
      setDayGroups(groups);
    }
  }, [hours]);

  const fetchHours = async () => {
    try {
      console.log('Fetching restaurant hours...');
      // Add cache-busting parameter to ensure fresh data
      const response = await fetch(`/api/restaurant/hours?t=${Date.now()}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Raw fetched hours data:', JSON.stringify(data, null, 2));
        setHours(data);
      }
    } catch (error) {
      console.error('Error fetching hours:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string): string => {
    if (!time) return '';
    
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    
    return `${displayHour}:${minutes}${ampm}`;
  };

  const getServiceHours = (day: RestaurantHours) => {
    if (day.isClosed) {
      return null;
    }
    
    const services = [];
    
    if (day.isBreakfastService && day.breakfastOpenTime && day.breakfastCloseTime) {
      services.push(`Breakfast: ${formatTime(day.breakfastOpenTime)} - ${formatTime(day.breakfastCloseTime)}`);
    }
    
    if (day.isLunchService && day.lunchOpenTime && day.lunchCloseTime) {
      services.push(`Lunch: ${formatTime(day.lunchOpenTime)} - ${formatTime(day.lunchCloseTime)}`);
    }
    
    if (day.isDinnerService && day.dinnerOpenTime && day.dinnerCloseTime) {
      services.push(`Dinner: ${formatTime(day.dinnerOpenTime)} - ${formatTime(day.dinnerCloseTime)}`);
    }
    
    return services.length > 0 ? services : null;
  };

  const areHoursEqual = (day1: RestaurantHours, day2: RestaurantHours) => {
    // If both are closed
    if (day1.isClosed && day2.isClosed) return true;
    
    // If one is closed and the other isn't
    if (day1.isClosed !== day2.isClosed) return false;
    
    // Helper function to normalize time values and trim whitespace
    const normalizeTime = (time: string | undefined | null) => {
      if (!time || time.trim() === '') return null;
      return time.trim();
    };
    
    // Helper function to normalize boolean values
    const normalizeBool = (value: boolean | undefined | null) => !!value;
    
    // Detailed field-by-field comparison
    const comparisons = {
      isBreakfastService: normalizeBool(day1.isBreakfastService) === normalizeBool(day2.isBreakfastService),
      breakfastOpenTime: normalizeTime(day1.breakfastOpenTime) === normalizeTime(day2.breakfastOpenTime),
      breakfastCloseTime: normalizeTime(day1.breakfastCloseTime) === normalizeTime(day2.breakfastCloseTime),
      isLunchService: normalizeBool(day1.isLunchService) === normalizeBool(day2.isLunchService),
      lunchOpenTime: normalizeTime(day1.lunchOpenTime) === normalizeTime(day2.lunchOpenTime),
      lunchCloseTime: normalizeTime(day1.lunchCloseTime) === normalizeTime(day2.lunchCloseTime),
      isDinnerService: normalizeBool(day1.isDinnerService) === normalizeBool(day2.isDinnerService),
      dinnerOpenTime: normalizeTime(day1.dinnerOpenTime) === normalizeTime(day2.dinnerOpenTime),
      dinnerCloseTime: normalizeTime(day1.dinnerCloseTime) === normalizeTime(day2.dinnerCloseTime)
    };
    
    const isEqual = Object.values(comparisons).every(match => match);
    
    if (!isEqual) {
      console.log(`❌ ${day1.dayOfWeek} ≠ ${day2.dayOfWeek}: Different hours detected`);
      console.log('Field-by-field comparison:', comparisons);
      console.log('Detailed values:', {
        day1: {
          dayOfWeek: day1.dayOfWeek,
          isClosed: day1.isClosed,
          breakfast: { 
            service: normalizeBool(day1.isBreakfastService), 
            open: normalizeTime(day1.breakfastOpenTime), 
            close: normalizeTime(day1.breakfastCloseTime) 
          },
          lunch: { 
            service: normalizeBool(day1.isLunchService), 
            open: normalizeTime(day1.lunchOpenTime), 
            close: normalizeTime(day1.lunchCloseTime) 
          },
          dinner: { 
            service: normalizeBool(day1.isDinnerService), 
            open: normalizeTime(day1.dinnerOpenTime), 
            close: normalizeTime(day1.dinnerCloseTime) 
          },
          updatedAt: day1.updatedAt
        },
        day2: {
          dayOfWeek: day2.dayOfWeek,
          isClosed: day2.isClosed,
          breakfast: { 
            service: normalizeBool(day2.isBreakfastService), 
            open: normalizeTime(day2.breakfastOpenTime), 
            close: normalizeTime(day2.breakfastCloseTime) 
          },
          lunch: { 
            service: normalizeBool(day2.isLunchService), 
            open: normalizeTime(day2.lunchOpenTime), 
            close: normalizeTime(day2.lunchCloseTime) 
          },
          dinner: { 
            service: normalizeBool(day2.isDinnerService), 
            open: normalizeTime(day2.dinnerOpenTime), 
            close: normalizeTime(day2.dinnerCloseTime) 
          },
          updatedAt: day2.updatedAt
        }
      });
    } else {
      console.log(`✅ ${day1.dayOfWeek} = ${day2.dayOfWeek}: Hours match!`);
    }
    
    return isEqual;
  };

  const formatGroupName = (group: RestaurantHours[]) => {
    if (group.length === 1) {
      return group[0].dayOfWeek;
    }
    
    const firstDay = group[0].dayOfWeek;
    const lastDay = group[group.length - 1].dayOfWeek;
    
    return `${firstDay} - ${lastDay}`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-xs tracking-[0.3em] uppercase text-white/60">Hours</div>
        <div className="text-white/80 leading-relaxed">
          <p>Loading hours...</p>
        </div>
      </div>
    );
  }

  if (hours.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-xs tracking-[0.3em] uppercase text-white/60">Hours</div>
        <div className="text-white/80 leading-relaxed">
          <p>Hours not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center">
        <div className="text-xs tracking-[0.3em] uppercase text-white/60">Hours</div>
      </div>
      <div className="text-white/80 leading-relaxed text-sm space-y-3">
        {dayGroups.map((group, index) => {
          const services = getServiceHours(group[0]);
          
          return (
            <div key={index} className="space-y-1">
              <div className="font-medium">{formatGroupName(group)}</div>
              <div className="text-xs text-white/60 leading-relaxed">
                {services === null || services.length === 0 ? (
                  <div>Closed</div>
                ) : (
                  <div className="space-y-1">
                    {services.map((service, serviceIndex) => (
                      <div key={serviceIndex}>{service}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}