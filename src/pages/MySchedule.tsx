// src/pages/MySchedule.tsx
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/header/header';
import Footer from '../components/Footer/Footer';

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

export default function MySchedule() {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Load user and bookings
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Check if user is logged in
        const meRes = await fetch('/api/user_auth.php?action=me', {
          credentials: 'include',
        });
        const meData = await meRes.json();
        if (!meData.user) {
          navigate('/');
          return;
        }

        // Load all services
        const servicesRes = await fetch('/api/services.php?action=list');
        const servicesData = await servicesRes.json();
        setServices(Array.isArray(servicesData) ? servicesData : []);

        // Load user's bookings using the user-specific endpoint
        try {
          const bookingsRes = await fetch('/api/bookings.php?action=list_for_user', {
            credentials: 'include',
          });
          if (bookingsRes.ok) {
            const bookingsData = await bookingsRes.json();
            if (Array.isArray(bookingsData)) {
              setBookings(bookingsData);
            } else {
              setBookings([]);
            }
          } else {
            console.error('Failed to load user bookings');
            setBookings([]);
          }
        } catch (err) {
          console.error('Failed to load user bookings', err);
          setBookings([]);
        }
      } catch (err) {
        console.error('Failed to load schedule data', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

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

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(currentYear, currentMonth, day));
    }

    return days;
  }, [currentMonth, currentYear]);

  // Get bookings for a specific date
  const getBookingsForDate = (date: Date | null): Booking[] => {
    if (!date) return [];

    const dateStr = date.toISOString().split('T')[0];

    return bookings.filter((booking) => {
      const startDate = parseUTCDate(booking.start_utc);
      const endDate = parseUTCDate(booking.end_utc);

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

  // Sort bookings by start time
  const sortedBookings = useMemo(() => {
    return [...bookings].sort((a, b) => {
      return parseUTCDate(a.start_utc).getTime() - parseUTCDate(b.start_utc).getTime();
    });
  }, [bookings]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <>
        <Header />
        <main style={{ minHeight: '65vh', paddingTop: '80px', textAlign: 'center' }}>
          <p>Loading schedule...</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main
        style={{
          minHeight: '65vh',
          paddingTop: '80px',
          maxWidth: 1400,
          margin: '0 auto',
          padding: '80px 20px 48px',
        }}
      >
        <h1 style={{ marginBottom: '1.5rem', fontSize: '2rem' }}>My Schedule</h1>

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

        {/* Calendar and Bookings List */}
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          {/* Calendar Grid */}
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

          {/* Bookings List */}
          <div
            style={{
              flex: '0 0 320px',
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 12,
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              maxHeight: '600px',
              overflowY: 'auto',
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem' }}>
              All Bookings
            </h3>
            {sortedBookings.length === 0 ? (
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>No bookings yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {sortedBookings.map((booking) => {
                  const startDate = parseUTCDate(booking.start_utc);
                  const isSelected = selectedBooking?.id === booking.id;

                  return (
                    <div
                      key={booking.id}
                      onClick={() => setSelectedBooking(booking)}
                      style={{
                        padding: '0.75rem',
                        background: isSelected ? '#eff6ff' : '#f9fafb',
                        border: isSelected ? '2px solid #063591' : '1px solid #e5e7eb',
                        borderRadius: 8,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        animation: 'fadeIn 0.3s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = '#f3f4f6';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = '#f9fafb';
                        }
                      }}
                    >
                      <div
                        style={{
                          background: getServiceColor(booking.service_id),
                          color: '#fff',
                          padding: '4px 8px',
                          borderRadius: 4,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          display: 'inline-block',
                          marginBottom: '0.5rem',
                        }}
                      >
                        {getServiceName(booking.service_id)}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#374151', fontWeight: 500 }}>
                        {startDate.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                        {formatTime(booking.start_utc)} - {formatTime(booking.end_utc)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Booking Details Panel (shown when clicking calendar or list item) */}
        {selectedBooking && (
          <div
            style={{
              marginTop: '2rem',
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 12,
              padding: '1.5rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              animation: 'fadeIn 0.3s ease',
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
      </main>
      <Footer />
    </>
  );
}

