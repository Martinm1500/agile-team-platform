import React, { useState, useMemo, useCallback, useEffect } from "react";
import "./CalendarView.css";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "../Icons";

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  color: string;
  description?: string;
}

const CalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showEventForm, setShowEventForm] = useState<boolean>(false);
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    title: "",
    date: new Date(),
    color: "#3b82f6",
    description: "",
  });

  useEffect(() => {
    const loadEvents = () => {
      setIsLoading(true);
      setTimeout(() => {
        setEvents([
          {
            id: "1",
            title: "Reunión de equipo",
            date: new Date(new Date().setDate(new Date().getDate() + 1)),
            color: "#3b82f6",
            description: "Revisión del progreso del proyecto trimestral",
          },
          {
            id: "2",
            title: "Entrega de proyecto",
            date: new Date(new Date().setDate(new Date().getDate() + 3)),
            color: "#10b981",
            description: "Presentación final al cliente",
          },
          {
            id: "3",
            title: "Revisión de código",
            date: new Date(new Date().setDate(new Date().getDate() - 2)),
            color: "#f59e0b",
            description: "Revisión de PRs pendientes",
          },
        ]);
        setIsLoading(false);
      }, 500);
    };

    loadEvents();
  }, []);

  const navigateMonth = useCallback((direction: "prev" | "next") => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(
        direction === "prev" ? prevDate.getMonth() - 1 : prevDate.getMonth() + 1
      );
      return newDate;
    });
  }, []);

  const navigateToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const handleDayClick = useCallback(
    (date: Date, isCurrentMonth: boolean) => {
      if (!isCurrentMonth) return;

      const eventsForDay = events.filter(
        (event) => event.date.toDateString() === date.toDateString()
      );

      if (eventsForDay.length > 0) {
        setSelectedEvent(eventsForDay[0]);
      } else {
        setNewEvent((prev) => ({
          ...prev,
          date: new Date(date.setHours(12, 0, 0, 0)),
        }));
        setShowEventForm(true);
      }
    },
    [events]
  );

  const handleAddEventClick = useCallback((date: Date, e: React.MouseEvent) => {
    e.stopPropagation();
    setNewEvent((prev) => ({
      ...prev,
      date: new Date(date.setHours(12, 0, 0, 0)),
    }));
    setShowEventForm(true);
  }, []);

  const handleCreateEvent = useCallback(() => {
    if (!newEvent.title) return;

    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title || "Nuevo evento",
      date: newEvent.date || new Date(),
      color: newEvent.color || "#3b82f6",
      description: newEvent.description,
    };

    setEvents((prev) => [...prev, event]);
    setShowEventForm(false);
    setNewEvent({
      title: "",
      date: new Date(),
      color: "#3b82f6",
      description: "",
    });
  }, [newEvent]);

  const monthYearString = useMemo(() => {
    return currentDate.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
    });
  }, [currentDate]);

  const dayNames = useMemo(
    () => ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
    []
  );

  const renderHeader = () => (
    <div className="calendar-header">
      <div className="calendar-header-controls">
        <button
          className="calendar-nav-button"
          onClick={() => navigateMonth("prev")}
          aria-label="Mes anterior"
        >
          <ChevronLeftIcon />
        </button>
        <button
          className="calendar-nav-button"
          onClick={() => navigateMonth("next")}
          aria-label="Mes siguiente"
        >
          <ChevronRightIcon />
        </button>
        <button className="calendar-today-button" onClick={navigateToToday}>
          Hoy
        </button>
      </div>
      <h2>{monthYearString}</h2>
      <div className="calendar-header-placeholder">
        <button
          className="calendar-add-button"
          onClick={() => {
            setNewEvent({
              title: "",
              date: new Date(),
              color: "#3b82f6",
              description: "",
            });
            setShowEventForm(true);
          }}
        >
          <PlusIcon className="mr-1" />
          Evento
        </button>
      </div>
    </div>
  );

  const renderDays = useCallback(() => {
    if (isLoading) {
      return <div className="calendar-loading">Cargando eventos...</div>;
    }

    const days = [];
    const date = new Date(currentDate);
    date.setDate(1);

    dayNames.forEach((dayName, i) => {
      days.push(
        <div key={`day-${i}`} className="calendar-day-name">
          {dayName}
        </div>
      );
    });

    const firstDay = date.getDay();
    const prevMonth = new Date(date.getFullYear(), date.getMonth(), 0);
    const daysInPrevMonth = prevMonth.getDate();

    for (let i = firstDay - 1; i >= 0; i--) {
      const dayDate = new Date(
        prevMonth.getFullYear(),
        prevMonth.getMonth(),
        daysInPrevMonth - i
      );
      days.push(
        <div
          key={`prev-${i}`}
          className="calendar-day-container other-month"
          onClick={() => handleDayClick(dayDate, false)}
        >
          <div className="calendar-day-circle">
            <div className="calendar-day-number">{daysInPrevMonth - i}</div>
          </div>
        </div>
      );
    }

    const daysInMonth = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0
    ).getDate();

    const today = new Date();

    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(date.getFullYear(), date.getMonth(), i);
      const isToday = dayDate.toDateString() === today.toDateString();

      const dayEvents = events.filter(
        (event) => event.date.toDateString() === dayDate.toDateString()
      );

      const eventColor =
        dayEvents.length > 0 ? dayEvents[0].color : "transparent";

      days.push(
        <div
          key={`day-${i}`}
          className={`calendar-day-container ${isToday ? "today" : ""}`}
          onClick={() => handleDayClick(dayDate, true)}
        >
          <div
            className="calendar-day-circle"
            style={{
              border: dayEvents.length > 0 ? `2px solid ${eventColor}` : "none",
            }}
          >
            <div className="calendar-day-number">{i}</div>
            {dayEvents.length > 0 && (
              <button
                className="calendar-day-add-event"
                onClick={(e) => handleAddEventClick(dayDate, e)}
              >
                <PlusIcon />
              </button>
            )}
          </div>
        </div>
      );
    }

    const lastDay = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0
    ).getDay();
    const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);

    for (let i = 1; i < 7 - lastDay; i++) {
      const dayDate = new Date(
        nextMonth.getFullYear(),
        nextMonth.getMonth(),
        i
      );
      days.push(
        <div
          key={`next-${i}`}
          className="calendar-day-container other-month"
          onClick={() => handleDayClick(dayDate, false)}
        >
          <div className="calendar-day-circle">
            <div className="calendar-day-number">{i}</div>
          </div>
        </div>
      );
    }

    return days;
  }, [
    currentDate,
    events,
    dayNames,
    isLoading,
    handleDayClick,
    handleAddEventClick,
  ]);

  return (
    <div className="calendar-view">
      {renderHeader()}
      <div className="calendar-grid">{renderDays()}</div>

      {selectedEvent && (
        <div className="event-modal" onClick={() => setSelectedEvent(null)}>
          <div
            className="event-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="event-color-bar"
              style={{ backgroundColor: selectedEvent.color }}
            ></div>
            <h3>{selectedEvent.title}</h3>
            <div className="event-date">
              {selectedEvent.date.toLocaleDateString("es-ES", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
              <br />
              {selectedEvent.date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
            {selectedEvent.description && (
              <div className="event-description">
                <p>{selectedEvent.description}</p>
              </div>
            )}
            <button
              className="event-close-button"
              onClick={() => setSelectedEvent(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {showEventForm && (
        <div className="event-modal" onClick={() => setShowEventForm(false)}>
          <div
            className="event-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="event-color-bar"
              style={{ backgroundColor: newEvent.color }}
            ></div>
            <h3>Nuevo Evento</h3>

            <div className="event-form-group">
              <label>Título</label>
              <input
                type="text"
                value={newEvent.title}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, title: e.target.value })
                }
                placeholder="Nombre del evento"
              />
            </div>

            <div className="event-form-group">
              <label>Fecha</label>
              <input
                type="date"
                value={
                  newEvent.date ? newEvent.date.toISOString().split("T")[0] : ""
                }
                onChange={(e) => {
                  const date = e.target.value
                    ? new Date(e.target.value)
                    : new Date();
                  setNewEvent({ ...newEvent, date });
                }}
              />
            </div>

            <div className="event-form-group">
              <label>Hora</label>
              <input
                type="time"
                value={
                  newEvent.date
                    ? newEvent.date.toTimeString().substring(0, 5)
                    : ""
                }
                onChange={(e) => {
                  if (!newEvent.date) return;
                  const [hours, minutes] = e.target.value
                    .split(":")
                    .map(Number);
                  const newDate = new Date(newEvent.date);
                  newDate.setHours(hours, minutes);
                  setNewEvent({ ...newEvent, date: newDate });
                }}
              />
            </div>

            <div className="event-form-group">
              <label>Color</label>
              <div className="color-options">
                {["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"].map(
                  (color) => (
                    <div
                      key={color}
                      className={`color-option ${
                        newEvent.color === color ? "selected" : ""
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewEvent({ ...newEvent, color })}
                    />
                  )
                )}
              </div>
            </div>

            <div className="event-form-group">
              <label>Descripción</label>
              <textarea
                value={newEvent.description}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, description: e.target.value })
                }
                placeholder="Detalles del evento"
                rows={3}
              />
            </div>

            <div className="event-form-buttons">
              <button
                className="event-cancel-button"
                onClick={() => setShowEventForm(false)}
              >
                Cancelar
              </button>
              <button
                className="event-save-button"
                onClick={handleCreateEvent}
                disabled={!newEvent.title}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
