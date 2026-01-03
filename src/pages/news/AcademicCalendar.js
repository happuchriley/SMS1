import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';

const AcademicCalendar = () => {
  const [events, setEvents] = useState([
    { id: 1, title: 'School Reopening', date: '2024-02-01', type: 'Holiday', description: 'First term begins' },
    { id: 2, title: 'Mid-Term Break', date: '2024-03-15', type: 'Holiday', description: 'One week mid-term break' },
    { id: 3, title: 'End of Term Exams', date: '2024-04-20', type: 'Exam', description: 'Term 1 examinations' },
    { id: 4, title: 'Term 1 Ends', date: '2024-05-10', type: 'Holiday', description: 'Term 1 closes' },
    { id: 5, title: 'Term 2 Begins', date: '2024-05-20', type: 'Holiday', description: 'Second term begins' },
    { id: 6, title: 'Sports Day', date: '2024-06-15', type: 'Event', description: 'Annual sports competition' },
    { id: 7, title: 'Mid-Term Break', date: '2024-07-20', type: 'Holiday', description: 'One week mid-term break' },
    { id: 8, title: 'End of Term Exams', date: '2024-09-15', type: 'Exam', description: 'Term 2 examinations' },
    { id: 9, title: 'Term 2 Ends', date: '2024-09-30', type: 'Holiday', description: 'Term 2 closes' },
    { id: 10, title: 'Term 3 Begins', date: '2024-10-10', type: 'Holiday', description: 'Third term begins' },
    { id: 11, title: 'End of Year Exams', date: '2024-11-25', type: 'Exam', description: 'Final examinations' },
    { id: 12, title: 'Graduation Ceremony', date: '2024-12-15', type: 'Event', description: 'Annual graduation' },
    { id: 13, title: 'School Closes', date: '2024-12-20', type: 'Holiday', description: 'End of academic year' },
  ]);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const years = [2023, 2024, 2025, 2026];

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'Holiday': return 'bg-blue-100 text-blue-800';
      case 'Exam': return 'bg-red-100 text-red-800';
      case 'Event': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate.getMonth() === selectedMonth && eventDate.getFullYear() === selectedYear;
  });

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Academic Calendar</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/news" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">News/Notice</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Academic Calendar</span>
            </div>
          </div>
        </div>
      </div>

      {/* Month/Year Selector */}
      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200 mb-4 sm:mb-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex gap-4">
            <div>
              <label className="block mb-1.5 text-sm font-medium text-gray-700">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              >
                {months.map((month, index) => (
                  <option key={month} value={index}>{month}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1.5 text-sm font-medium text-gray-700">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <i className="fas fa-info-circle mr-2"></i>
            Showing events for {months[selectedMonth]} {selectedYear}
          </div>
        </div>
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-lg p-8 shadow-md border border-gray-200 text-center">
          <i className="fas fa-calendar-alt text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 mb-4">No events scheduled for {months[selectedMonth]} {selectedYear}.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary-500">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Event</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEvents.map(event => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(event.date).getFullYear()}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-semibold text-gray-900">{event.title}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEventTypeColor(event.type)}`}>
                        {event.type}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">{event.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AcademicCalendar;
