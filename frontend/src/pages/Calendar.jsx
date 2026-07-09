import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function Calendar() {
  const { theme } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 16)); // Jan 16, 2026
  const [events, setEvents] = useState([
    { date: '2026-01-16', title: 'Dashboard Launch', color: 'red' },
    { date: '2026-01-20', title: 'Client Meeting', color: 'blue' },
    { date: '2026-01-25', title: 'System Maintenance', color: 'orange' },
  ]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventColor, setEventColor] = useState('blue');

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const getEventsForDate = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const addEvent = () => {
    if (!eventTitle.trim()) return;
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
    setEvents([...events, { date: dateStr, title: eventTitle, color: eventColor }]);
    setEventTitle('');
    setEventColor('blue');
    setShowEventModal(false);
  };

  const deleteEvent = (dateStr, title) => {
    setEvents(events.filter(e => !(e.date === dateStr && e.title === title)));
  };

  const colorOptions = [
    { name: 'blue', bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
    { name: 'red', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
    { name: 'green', bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
    { name: 'orange', bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
    { name: 'purple', bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
  ];

  const getColorClasses = (color) => {
    return colorOptions.find(c => c.name === color) || colorOptions[0];
  };

  return (
    <div className={`p-8 ${
      theme === 'dark' ? 'bg-neutral-950 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Calendar</h1>
        <p className={`text-sm ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-600'}`}>
          Manage your events and schedule
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`lg:col-span-2 rounded-2xl overflow-hidden shadow-lg ${
            theme === 'dark'
              ? 'bg-neutral-900 border border-neutral-800'
              : 'bg-white border border-purple-200'
          }`}
        >
          {/* Header */}
          <div className={`p-6 flex items-center justify-between ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-neutral-800 to-neutral-900 border-b border-neutral-800'
              : 'bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200'
          }`}>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              className={`p-2 rounded-lg transition ${
                theme === 'dark'
                  ? 'hover:bg-neutral-700 text-white'
                  : 'hover:bg-white text-gray-900'
              }`}
            >
              <FiChevronLeft size={20} />
            </button>
            <h2 className="text-xl font-bold">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              className={`p-2 rounded-lg transition ${
                theme === 'dark'
                  ? 'hover:bg-neutral-700 text-white'
                  : 'hover:bg-white text-gray-900'
              }`}
            >
              <FiChevronRight size={20} />
            </button>
          </div>

          {/* Days of Week */}
          <div className={`grid grid-cols-7 gap-1 p-4 border-b ${
            theme === 'dark' ? 'border-neutral-800 bg-neutral-800/30' : 'border-purple-200 bg-purple-50/50'
          }`}>
            {dayNames.map(day => (
              <div key={day} className="text-center font-semibold text-sm text-amber-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1 p-4">
            {days.map((day, idx) => (
              <motion.div
                key={idx}
                whileHover={day ? { scale: 1.05 } : {}}
                onClick={() => day && (setSelectedDate(day), setShowEventModal(true))}
                className={`p-2 rounded-lg min-h-24 relative cursor-pointer transition ${
                  !day
                    ? ''
                    : theme === 'dark'
                    ? 'bg-neutral-800 hover:bg-neutral-700 border border-neutral-700'
                    : 'bg-white hover:bg-purple-50 border border-purple-200'
                }`}
              >
                {day && (
                  <>
                    <div className="text-sm font-semibold text-amber-500 mb-1">{day}</div>
                    <div className="space-y-1">
                      {getEventsForDate(day).map((event, i) => {
                        const colors = getColorClasses(event.color);
                        return (
                          <div
                            key={i}
                            className={`text-xs px-2 py-1 rounded truncate ${colors.bg} ${colors.text} cursor-pointer hover:opacity-80 group relative`}
                            title={event.title}
                          >
                            {event.title}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteEvent(event.date, event.title);
                              }}
                              className="absolute top-0 right-0 hidden group-hover:block bg-red-500 text-white rounded-full p-0.5 -mr-1 -mt-1"
                            >
                              <FiX size={10} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl overflow-hidden shadow-lg ${
            theme === 'dark'
              ? 'bg-neutral-900 border border-neutral-800'
              : 'bg-white border border-purple-200'
          }`}
        >
          {/* Header */}
          <div className={`p-6 border-b ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-neutral-800 to-neutral-900 border-neutral-800'
              : 'bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200'
          }`}>
            <h3 className="text-lg font-bold">Upcoming Events</h3>
          </div>

          {/* Events List */}
          <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
            {events
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .slice(0, 10)
              .map((event, i) => {
                const colors = getColorClasses(event.color);
                const eventDate = new Date(event.date);
                return (
                  <motion.div
                    key={i}
                    whileHover={{ x: 4 }}
                    className={`p-3 rounded-lg border-l-4 cursor-pointer transition ${
                      theme === 'dark'
                        ? `bg-neutral-800 ${colors.border}`
                        : `bg-gray-50 ${colors.border}`
                    }`}
                    onClick={() => deleteEvent(event.date, event.title)}
                    title="Click to delete"
                  >
                    <div className={`font-semibold text-sm ${colors.text}`}>{event.title}</div>
                    <div className={`text-xs ${
                      theme === 'dark' ? 'text-neutral-400' : 'text-gray-600'
                    }`}>
                      {eventDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </motion.div>
                );
              })}
            {events.length === 0 && (
              <p className={`text-sm text-center py-8 ${
                theme === 'dark' ? 'text-neutral-500' : 'text-gray-500'
              }`}>
                No events scheduled
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Add Event Modal */}
      {showEventModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowEventModal(false)}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className={`p-6 rounded-2xl shadow-2xl w-full max-w-md ${
              theme === 'dark'
                ? 'bg-neutral-900 border border-neutral-800'
                : 'bg-white border border-purple-200'
            }`}
          >
            <h3 className="text-xl font-bold mb-4">Add Event</h3>
            
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-neutral-300' : 'text-gray-700'
              }`}>
                Date: {monthNames[currentDate.getMonth()]} {selectedDate}, {currentDate.getFullYear()}
              </label>
              <input
                type="text"
                placeholder="Event title"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addEvent()}
                className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 ${
                  theme === 'dark'
                    ? 'bg-neutral-800 border-neutral-700 text-white focus:ring-amber-500'
                    : 'bg-gray-100 border-purple-200 text-gray-900 focus:ring-amber-500'
                }`}
                autoFocus
              />
            </div>

            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-neutral-300' : 'text-gray-700'
              }`}>
                Color
              </label>
              <div className="flex gap-2">
                {colorOptions.map(color => (
                  <button
                    key={color.name}
                    onClick={() => setEventColor(color.name)}
                    className={`w-8 h-8 rounded-full ${color.bg} ${
                      eventColor === color.name ? 'ring-2 ring-offset-2' : ''
                    }`}
                    style={eventColor === color.name ? {
                      ringColor: 'currentColor'
                    } : {}}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowEventModal(false)}
                className={`flex-1 px-4 py-2 rounded-lg transition ${
                  theme === 'dark'
                    ? 'bg-neutral-800 hover:bg-neutral-700 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={addEvent}
                className="flex-1 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-medium transition"
              >
                Add Event
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
