'use client';

import { useState, useEffect } from 'react';
import { RestaurantHours } from '../lib/database';

export default function RestaurantHoursDisplay() {
  const [hours, setHours] = useState<RestaurantHours[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHours();
  }, []);

  const fetchHours = async () => {
    try {
      const response = await fetch('/api/restaurant/hours');
      if (response.ok) {
        const data = await response.json();
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
    
    // Compare service types and times
    return (
      day1.isBreakfastService === day2.isBreakfastService &&
      day1.breakfastOpenTime === day2.breakfastOpenTime &&
      day1.breakfastCloseTime === day2.breakfastCloseTime &&
      day1.isLunchService === day2.isLunchService &&
      day1.lunchOpenTime === day2.lunchOpenTime &&
      day1.lunchCloseTime === day2.lunchCloseTime &&
      day1.isDinnerService === day2.isDinnerService &&
      day1.dinnerOpenTime === day2.dinnerOpenTime &&
      day1.dinnerCloseTime === day2.dinnerCloseTime
    );
  };

  const groupConsecutiveDays = () => {
    const groups = [];
    let currentGroup = [hours[0]];
    
    for (let i = 1; i < hours.length; i++) {
      if (areHoursEqual(hours[i - 1], hours[i])) {
        currentGroup.push(hours[i]);
      } else {
        groups.push(currentGroup);
        currentGroup = [hours[i]];
      }
    }
    groups.push(currentGroup);
    
    return groups;
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

  const dayGroups = groupConsecutiveDays();

  return (
    <div className="space-y-4">
      <div className="text-xs tracking-[0.3em] uppercase text-white/60">Hours</div>
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