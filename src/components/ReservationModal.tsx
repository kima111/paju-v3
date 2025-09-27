'use client';

import { useState } from 'react';

export default function ReservationModal({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    guests: '2',
    specialRequests: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the reservation data to your backend
    console.log('Reservation submitted:', formData);
    alert('Thank you! Your reservation request has been submitted. We will contact you shortly to confirm.');
    onClose();
    setFormData({
      name: '',
      email: '',
      phone: '',
      date: '',
      time: '',
      guests: '2',
      specialRequests: ''
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display text-2xl font-bold text-[#2d1810]">Make a Reservation</h2>
            <button
              onClick={onClose}
              className="text-[#8b7d6b] hover:text-[#2d1810] text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#2d1810] mb-1">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[#c8a882] rounded-md focus:outline-none focus:ring-2 focus:ring-[#c8102e] focus:border-[#c8102e]"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#2d1810] mb-1">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[#c8a882] rounded-md focus:outline-none focus:ring-2 focus:ring-[#c8102e] focus:border-[#c8102e]"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-[#2d1810] mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[#c8a882] rounded-md focus:outline-none focus:ring-2 focus:ring-[#c8102e] focus:border-[#c8102e]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-[#2d1810] mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-[#c8a882] rounded-md focus:outline-none focus:ring-2 focus:ring-[#c8102e] focus:border-[#c8102e]"
                />
              </div>

              <div>
                <label htmlFor="time" className="block text-sm font-medium text-[#2d1810] mb-1">
                  Time *
                </label>
                <select
                  id="time"
                  name="time"
                  required
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[#c8a882] rounded-md focus:outline-none focus:ring-2 focus:ring-[#c8102e] focus:border-[#c8102e]"
                >
                  <option value="">Select Time</option>
                  <option value="5:00 PM">5:00 PM</option>
                  <option value="5:30 PM">5:30 PM</option>
                  <option value="6:00 PM">6:00 PM</option>
                  <option value="6:30 PM">6:30 PM</option>
                  <option value="7:00 PM">7:00 PM</option>
                  <option value="7:30 PM">7:30 PM</option>
                  <option value="8:00 PM">8:00 PM</option>
                  <option value="8:30 PM">8:30 PM</option>
                  <option value="9:00 PM">9:00 PM</option>
                  <option value="9:30 PM">9:30 PM</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="guests" className="block text-sm font-medium text-[#2d1810] mb-1">
                Number of Guests *
              </label>
              <select
                id="guests"
                name="guests"
                required
                value={formData.guests}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[#c8a882] rounded-md focus:outline-none focus:ring-2 focus:ring-[#c8102e] focus:border-[#c8102e]"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num.toString()}>
                    {num} {num === 1 ? 'Guest' : 'Guests'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="specialRequests" className="block text-sm font-medium text-[#2d1810] mb-1">
                Special Requests
              </label>
              <textarea
                id="specialRequests"
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleChange}
                rows={3}
                placeholder="Allergies, dietary restrictions, special occasions, etc."
                className="w-full px-3 py-2 border border-[#c8a882] rounded-md focus:outline-none focus:ring-2 focus:ring-[#c8102e] focus:border-[#c8102e] resize-none"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-[#c8a882] text-[#2d1810] rounded-md hover:bg-[#f5f2ed] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-[#c8102e] text-white rounded-md hover:bg-[#8b4513] transition-colors font-medium"
              >
                Submit Reservation
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}