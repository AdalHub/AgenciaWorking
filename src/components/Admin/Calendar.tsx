// src/components/Admin/Calendar.tsx
import { useEffect, useState, useMemo } from 'react';

type Service = {
  id: number;
  title: string;
  hourly_rate: number;
};

type Booking = {
  id: number;
  service_id: number;
  start_utc: string;
  end_utc: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  note: string | null;
};

// Color palette for different services
const SERVICE_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
  '#6366f1', // indigo
];

export default function Calendar() {
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get current month and year
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Load all services and bookings
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load all services
        const servicesRes = await fetch('/api/services.php?action=list&include_inactive=1', {
          credentials: 'include',
        });
        const servicesData = await servicesRes.json();
        setServices(Array.isArray(servicesData) ? servicesData : []);

        // Load bookings for all services
        const allBookings: Booking[] = [];
        if (Array.isArray(servicesData)) {
          for (const service of servicesData) {
            try {
              const bookingsRes = await fetch(
                `/api/bookings.php?action=list_for_admin&service_id=${service.id}`,
                { credentials: 'include' }
              );
              if (bookingsRes.ok) {
                const bookingsData = await bookingsRes.json();
                if (Array.isArray(bookingsData)) {
                  allBookings.push(
                    ...bookingsData.map((b: any) => ({
                      ...b,
                      service_id: service.id,
                    }))
                  );
                }
              }
            } catch (err) {
              console.error(`Failed to load bookings for service ${service.id}`, err);
            }
          }
        }
        setBookings(allBookings);
      } catch (err) {
        console.error('Failed to load calendar data', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Get color for a service
  const getServiceColor = (serviceId: number): string => {
    const index = services.findIndex((s) => s.id === serviceId);
    return SERVICE_COLORS[index % SERVICE_COLORS.length];
  };

  // Get service name by ID
  const getServiceName = (serviceId: number): string => {
    const service = services.find((s) => s.id === serviceId);
    return service?.title || 'Unknown Service';
  };

  // Parse UTC date string to Date object
  const parseUTCDate = (utcString: string): Date => {
    return new Date(utcString);
  };

  // Get all days in the current month
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(currentYear, currentMonth, day));
    }

    return days;
  }, [currentMonth, currentYear]);

  // Get bookings for a specific date
  const getBookingsForDate = (date: Date | null): Booking[] => {
    if (!date) return [];

    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD

    return bookings.filter((booking) => {
      const startDate = parseUTCDate(booking.start_utc);
      const endDate = parseUTCDate(booking.end_utc);

      // Check if the date falls within the booking range
      const bookingStartStr = startDate.toISOString().split('T')[0];
      const bookingEndStr = endDate.toISOString().split('T')[0];

      return dateStr >= bookingStartStr && dateStr <= bookingEndStr;
    });
  };

  // Navigate months
  const changeMonth = (delta: number) => {
    setCurrentDate(new Date(currentYear, currentMonth + delta, 1));
    setSelectedBooking(null);
  };

  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Format time for display
  const formatTime = (utcString: string): string => {
    const date = parseUTCDate(utcString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading calendar...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '0 0 2rem' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>Calendar View</h2>

      {/* Month/Year Selector */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => changeMonth(-1)}
            style={{
              padding: '0.5rem 1rem',
              background: '#111',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            ← Prev
          </button>
          <h3 style={{ margin: 0, minWidth: '200px', textAlign: 'center' }}>
            {formatDate(currentDate)}
          </h3>
          <button
            onClick={() => changeMonth(1)}
            style={{
              padding: '0.5rem 1rem',
              background: '#111',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Next →
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <select
            value={currentMonth}
            onChange={(e) => {
              setCurrentDate(new Date(currentYear, parseInt(e.target.value), 1));
              setSelectedBooking(null);
            }}
            style={{
              padding: '0.5rem 1rem',
              border: '2px solid #e5e7eb',
              borderRadius: 6,
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            {monthNames.map((month, index) => (
              <option key={month} value={index}>
                {month}
              </option>
            ))}
          </select>
          <select
            value={currentYear}
            onChange={(e) => {
              setCurrentDate(new Date(parseInt(e.target.value), currentMonth, 1));
              setSelectedBooking(null);
            }}
            style={{
              padding: '0.5rem 1rem',
              border: '2px solid #e5e7eb',
              borderRadius: 6,
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            {Array.from({ length: 10 }, (_, i) => currentYear - 5 + i).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Calendar Grid */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 800px', minWidth: 0 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '8px',
              background: '#f9fafb',
              padding: '1rem',
              borderRadius: 12,
              border: '1px solid #e5e7eb',
            }}
          >
            {/* Day headers */}
            {dayNames.map((day) => (
              <div
                key={day}
                style={{
                  padding: '0.75rem',
                  textAlign: 'center',
                  fontWeight: 600,
                  color: '#374151',
                  fontSize: '0.875rem',
                }}
              >
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {calendarDays.map((date, index) => {
              const dayBookings = getBookingsForDate(date);
              const isToday =
                date &&
                date.toDateString() === new Date().toDateString() &&
                date.getMonth() === new Date().getMonth() &&
                date.getFullYear() === new Date().getFullYear();

              return (
                <div
                  key={index}
                  style={{
                    minHeight: '100px',
                    padding: '8px',
                    background: '#fff',
                    border: isToday ? '2px solid #063591' : '1px solid #e5e7eb',
                    borderRadius: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    cursor: dayBookings.length > 0 ? 'pointer' : 'default',
                    transition: 'all 0.2s',
                    opacity: date ? 1 : 0,
                  }}
                  onMouseEnter={(e) => {
                    if (dayBookings.length > 0) {
                      e.currentTarget.style.transform = 'scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {date && (
                    <>
                      <div
                        style={{
                          fontWeight: isToday ? 700 : 500,
                          color: isToday ? '#063591' : '#111827',
                          fontSize: '0.875rem',
                          marginBottom: '4px',
                        }}
                      >
                        {date.getDate()}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                        {dayBookings.slice(0, 3).map((booking) => (
                          <div
                            key={booking.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBooking(booking);
                            }}
                            style={{
                              background: getServiceColor(booking.service_id),
                              color: '#fff',
                              padding: '4px 6px',
                              borderRadius: 4,
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              animation: 'fadeIn 0.3s ease',
                            }}
                            title={getServiceName(booking.service_id)}
                          >
                            {getServiceName(booking.service_id)}
                          </div>
                        ))}
                        {dayBookings.length > 3 && (
                          <div
                            style={{
                              background: '#6b7280',
                              color: '#fff',
                              padding: '4px 6px',
                              borderRadius: 4,
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              textAlign: 'center',
                            }}
                          >
                            +{dayBookings.length - 3} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Booking Details Panel */}
        {selectedBooking && (
          <div
            style={{
              flex: '0 0 320px',
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 12,
              padding: '1.5rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              animation: 'fadeIn 0.3s ease',
              maxHeight: '600px',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Booking Details</h3>
              <button
                onClick={() => setSelectedBooking(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: 0,
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div
                  style={{
                    background: getServiceColor(selectedBooking.service_id),
                    color: '#fff',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 6,
                    fontWeight: 600,
                    marginBottom: '0.75rem',
                    display: 'inline-block',
                  }}
                >
                  {getServiceName(selectedBooking.service_id)}
                </div>
              </div>

              <div>
                <strong style={{ color: '#374151', fontSize: '0.875rem' }}>Start:</strong>
                <div style={{ color: '#6b7280', marginTop: '0.25rem' }}>
                  {formatTime(selectedBooking.start_utc)}
                </div>
                <div style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.125rem' }}>
                  {parseUTCDate(selectedBooking.start_utc).toLocaleDateString()}
                </div>
              </div>

              <div>
                <strong style={{ color: '#374151', fontSize: '0.875rem' }}>End:</strong>
                <div style={{ color: '#6b7280', marginTop: '0.25rem' }}>
                  {formatTime(selectedBooking.end_utc)}
                </div>
                <div style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.125rem' }}>
                  {parseUTCDate(selectedBooking.end_utc).toLocaleDateString()}
                </div>
              </div>

              {selectedBooking.customer_name && (
                <div>
                  <strong style={{ color: '#374151', fontSize: '0.875rem' }}>Name:</strong>
                  <div style={{ color: '#6b7280', marginTop: '0.25rem' }}>
                    {selectedBooking.customer_name}
                  </div>
                </div>
              )}

              {selectedBooking.customer_email && (
                <div>
                  <strong style={{ color: '#374151', fontSize: '0.875rem' }}>Email:</strong>
                  <div style={{ color: '#6b7280', marginTop: '0.25rem', wordBreak: 'break-word' }}>
                    {selectedBooking.customer_email}
                  </div>
                </div>
              )}

              {selectedBooking.customer_phone && (
                <div>
                  <strong style={{ color: '#374151', fontSize: '0.875rem' }}>Phone:</strong>
                  <div style={{ color: '#6b7280', marginTop: '0.25rem' }}>
                    {selectedBooking.customer_phone}
                  </div>
                </div>
              )}

              {selectedBooking.note && (
                <div>
                  <strong style={{ color: '#374151', fontSize: '0.875rem' }}>Note:</strong>
                  <div
                    style={{
                      color: '#6b7280',
                      marginTop: '0.25rem',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {selectedBooking.note}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-8px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
}

