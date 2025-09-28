'use client';

import { useState, useEffect } from 'react';
import { RestaurantHours } from '../../lib/database';

export default function HoursManagement() {
  const [hours, setHours] = useState<RestaurantHours[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

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

  const updateHours = async (dayId: string, updates: Partial<RestaurantHours>) => {
    setSaving(dayId);
    try {
      const response = await fetch('/api/restaurant/hours', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dayId, ...updates }),
      });

      if (response.ok) {
        await fetchHours();
      } else {
        alert('Failed to update hours');
      }
    } catch (error) {
      console.error('Error updating hours:', error);
      alert('Error updating hours');
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-white/60">Loading restaurant hours...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-3xl font-light mb-4">Restaurant Hours</h2>
        <p className="text-white/60 text-sm">
          Configure your restaurant&apos;s operating hours for each service. Enable services and set specific times for breakfast, lunch, and dinner.
        </p>
      </div>

      <div className="space-y-4">
        {hours.map((day) => (
          <HourRow
            key={day.id}
            day={day}
            onUpdate={(updates) => updateHours(day.id, updates)}
            isSaving={saving === day.id}
          />
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 p-6">
        <h3 className="text-lg font-light mb-4 text-white/80">Hours Display Preview</h3>
        <div className="space-y-2 text-sm text-white/60">
          {hours.map((day) => (
            <div key={day.id} className="flex justify-between items-start">
              <span className="font-medium">{day.dayOfWeek}:</span>
              <div className="text-right">
                {day.isClosed ? (
                  <div>Closed</div>
                ) : (
                  <div className="space-y-1">
                    {day.isBreakfastService && day.breakfastOpenTime && day.breakfastCloseTime && (
                      <div>Breakfast: {formatTime(day.breakfastOpenTime)} - {formatTime(day.breakfastCloseTime)}</div>
                    )}
                    {day.isLunchService && day.lunchOpenTime && day.lunchCloseTime && (
                      <div>Lunch: {formatTime(day.lunchOpenTime)} - {formatTime(day.lunchCloseTime)}</div>
                    )}
                    {day.isDinnerService && day.dinnerOpenTime && day.dinnerCloseTime && (
                      <div>Dinner: {formatTime(day.dinnerOpenTime)} - {formatTime(day.dinnerCloseTime)}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface HourRowProps {
  day: RestaurantHours;
  onUpdate: (updates: Partial<RestaurantHours>) => void;
  isSaving: boolean;
}

function HourRow({ day, onUpdate, isSaving }: HourRowProps) {
  const [localState, setLocalState] = useState({
    isClosed: day.isClosed,
    isBreakfastService: day.isBreakfastService,
    breakfastOpenTime: day.breakfastOpenTime || '08:00',
    breakfastCloseTime: day.breakfastCloseTime || '11:00',
    isLunchService: day.isLunchService,
    lunchOpenTime: day.lunchOpenTime || '11:00',
    lunchCloseTime: day.lunchCloseTime || '15:00',
    isDinnerService: day.isDinnerService,
    dinnerOpenTime: day.dinnerOpenTime || '17:00',
    dinnerCloseTime: day.dinnerCloseTime || '21:00',
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const changed = 
      localState.isClosed !== day.isClosed ||
      localState.isBreakfastService !== day.isBreakfastService ||
      localState.breakfastOpenTime !== day.breakfastOpenTime ||
      localState.breakfastCloseTime !== day.breakfastCloseTime ||
      localState.isLunchService !== day.isLunchService ||
      localState.lunchOpenTime !== day.lunchOpenTime ||
      localState.lunchCloseTime !== day.lunchCloseTime ||
      localState.isDinnerService !== day.isDinnerService ||
      localState.dinnerOpenTime !== day.dinnerOpenTime ||
      localState.dinnerCloseTime !== day.dinnerCloseTime;
    
    setHasChanges(changed);
  }, [localState, day]);

  const handleSave = () => {
    // Update legacy open/close time fields based on enabled services
    const updates = {
      ...localState,
      openTime: getEarliestOpenTime(),
      closeTime: getLatestCloseTime(),
    };
    onUpdate(updates);
    setHasChanges(false);
  };

  const getEarliestOpenTime = () => {
    const times = [];
    if (localState.isBreakfastService) times.push(localState.breakfastOpenTime);
    if (localState.isLunchService) times.push(localState.lunchOpenTime);
    if (localState.isDinnerService) times.push(localState.dinnerOpenTime);
    return times.sort()[0] || '09:00';
  };

  const getLatestCloseTime = () => {
    const times = [];
    if (localState.isBreakfastService) times.push(localState.breakfastCloseTime);
    if (localState.isLunchService) times.push(localState.lunchCloseTime);
    if (localState.isDinnerService) times.push(localState.dinnerCloseTime);
    return times.sort().reverse()[0] || '17:00';
  };

  const handleReset = () => {
    setLocalState({
      isClosed: day.isClosed,
      isBreakfastService: day.isBreakfastService,
      breakfastOpenTime: day.breakfastOpenTime || '08:00',
      breakfastCloseTime: day.breakfastCloseTime || '11:00',
      isLunchService: day.isLunchService,
      lunchOpenTime: day.lunchOpenTime || '11:00',
      lunchCloseTime: day.lunchCloseTime || '15:00',
      isDinnerService: day.isDinnerService,
      dinnerOpenTime: day.dinnerOpenTime || '17:00',
      dinnerCloseTime: day.dinnerCloseTime || '21:00',
    });
    setHasChanges(false);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-light text-white">{day.dayOfWeek}</h3>
        {hasChanges && (
          <div className="flex space-x-2">
            <button
              onClick={handleReset}
              className="px-3 py-1 text-xs border border-zinc-700 text-white/60 hover:text-white hover:border-zinc-600 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-3 py-1 text-xs bg-white text-black hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Closed Toggle */}
        <div className="flex items-center space-x-3">
          <input
            id={`closed-${day.id}`}
            type="checkbox"
            checked={localState.isClosed}
            onChange={(e) => setLocalState({ ...localState, isClosed: e.target.checked })}
            className="w-4 h-4 bg-zinc-800 border-zinc-600 rounded focus:ring-white/20"
          />
          <label htmlFor={`closed-${day.id}`} className="text-sm text-white/80">
            Closed all day
          </label>
        </div>

        {!localState.isClosed && (
          <div className="space-y-6">
            {/* Breakfast Service */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  id={`breakfast-${day.id}`}
                  type="checkbox"
                  checked={localState.isBreakfastService}
                  onChange={(e) => setLocalState({ ...localState, isBreakfastService: e.target.checked })}
                  className="w-4 h-4 bg-zinc-800 border-zinc-600 rounded focus:ring-white/20"
                />
                <label htmlFor={`breakfast-${day.id}`} className="text-sm font-medium text-white/90">
                  Breakfast Service
                </label>
              </div>
              {localState.isBreakfastService && (
                <div className="grid grid-cols-2 gap-4 ml-7">
                  <div>
                    <label className="block text-xs tracking-wider uppercase text-white/60 mb-2">
                      Open
                    </label>
                    <input
                      type="time"
                      value={localState.breakfastOpenTime}
                      onChange={(e) => setLocalState({ ...localState, breakfastOpenTime: e.target.value })}
                      className="w-full px-3 py-2 bg-black border border-zinc-700 focus:border-white/30 focus:outline-none text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs tracking-wider uppercase text-white/60 mb-2">
                      Close
                    </label>
                    <input
                      type="time"
                      value={localState.breakfastCloseTime}
                      onChange={(e) => setLocalState({ ...localState, breakfastCloseTime: e.target.value })}
                      className="w-full px-3 py-2 bg-black border border-zinc-700 focus:border-white/30 focus:outline-none text-white text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Lunch Service */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  id={`lunch-${day.id}`}
                  type="checkbox"
                  checked={localState.isLunchService}
                  onChange={(e) => setLocalState({ ...localState, isLunchService: e.target.checked })}
                  className="w-4 h-4 bg-zinc-800 border-zinc-600 rounded focus:ring-white/20"
                />
                <label htmlFor={`lunch-${day.id}`} className="text-sm font-medium text-white/90">
                  Lunch Service
                </label>
              </div>
              {localState.isLunchService && (
                <div className="grid grid-cols-2 gap-4 ml-7">
                  <div>
                    <label className="block text-xs tracking-wider uppercase text-white/60 mb-2">
                      Open
                    </label>
                    <input
                      type="time"
                      value={localState.lunchOpenTime}
                      onChange={(e) => setLocalState({ ...localState, lunchOpenTime: e.target.value })}
                      className="w-full px-3 py-2 bg-black border border-zinc-700 focus:border-white/30 focus:outline-none text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs tracking-wider uppercase text-white/60 mb-2">
                      Close
                    </label>
                    <input
                      type="time"
                      value={localState.lunchCloseTime}
                      onChange={(e) => setLocalState({ ...localState, lunchCloseTime: e.target.value })}
                      className="w-full px-3 py-2 bg-black border border-zinc-700 focus:border-white/30 focus:outline-none text-white text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Dinner Service */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  id={`dinner-${day.id}`}
                  type="checkbox"
                  checked={localState.isDinnerService}
                  onChange={(e) => setLocalState({ ...localState, isDinnerService: e.target.checked })}
                  className="w-4 h-4 bg-zinc-800 border-zinc-600 rounded focus:ring-white/20"
                />
                <label htmlFor={`dinner-${day.id}`} className="text-sm font-medium text-white/90">
                  Dinner Service
                </label>
              </div>
              {localState.isDinnerService && (
                <div className="grid grid-cols-2 gap-4 ml-7">
                  <div>
                    <label className="block text-xs tracking-wider uppercase text-white/60 mb-2">
                      Open
                    </label>
                    <input
                      type="time"
                      value={localState.dinnerOpenTime}
                      onChange={(e) => setLocalState({ ...localState, dinnerOpenTime: e.target.value })}
                      className="w-full px-3 py-2 bg-black border border-zinc-700 focus:border-white/30 focus:outline-none text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs tracking-wider uppercase text-white/60 mb-2">
                      Close
                    </label>
                    <input
                      type="time"
                      value={localState.dinnerCloseTime}
                      onChange={(e) => setLocalState({ ...localState, dinnerCloseTime: e.target.value })}
                      className="w-full px-3 py-2 bg-black border border-zinc-700 focus:border-white/30 focus:outline-none text-white text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatTime(time: string): string {
  if (!time) return '';
  
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  
  return `${displayHour}:${minutes} ${ampm}`;
}