import { Trip } from "@/lib/api/trips";

/**
 * Formats a Date object or date/time strings into an iCalendar UTC / local date-time string.
 * Example: 20260905T090000
 */
function toIcsDateTime(dateStr?: string, timeStr?: string, fallbackDayOffset = 0): string {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth() + 1;
  let day = now.getDate() + 1 + fallbackDayOffset; // default to starting tomorrow

  if (dateStr) {
    const parts = dateStr.split("-").map(Number);
    if (parts.length === 3) {
      year = parts[0];
      month = parts[1];
      day = parts[2];
    }
  }

  let hours = 9;
  let minutes = 0;

  if (timeStr) {
    const tParts = timeStr.split(":").map(Number);
    if (tParts.length >= 2) {
      hours = tParts[0];
      minutes = tParts[1];
    }
  }

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${year}${pad(month)}${pad(day)}T${pad(hours)}${pad(minutes)}00`;
}

/**
 * Escapes special characters for iCalendar format according to RFC 5545.
 */
function escapeIcsText(str?: string | null): string {
  if (!str) return "";
  return str
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/**
 * Generates an RFC 5545 compliant .ics calendar file and triggers a browser download.
 * Compatible with Apple Calendar, Google Calendar, and Microsoft Outlook.
 */
export function exportTripToIcs(trip: Trip): void {
  if (!trip) return;

  const events: string[] = [];
  const nowIcs = toIcsDateTime();

  if (trip.days && trip.days.length > 0) {
    trip.days.forEach((day, dayIndex) => {
      const dayDate = day.date || trip.start_date;

      if (day.items && day.items.length > 0) {
        day.items.forEach((item, itemIndex) => {
          const dtStart = toIcsDateTime(dayDate, item.start_time || "09:00", dayIndex);
          const dtEnd = toIcsDateTime(dayDate, item.end_time || "12:00", dayIndex);
          const uid = `slt-${trip.id || "preview"}-d${day.day_number || dayIndex}-i${itemIndex}@srilankatourism.com`;

          const notes = [
            item.notes,
            item.estimated_cost ? `Est. Cost: ${item.currency || "USD"} ${item.estimated_cost}` : null,
            `Organized via Sri Lanka Tourism AI Assistant`,
          ]
            .filter(Boolean)
            .join("\n\n");

          events.push(
            [
              "BEGIN:VEVENT",
              `UID:${uid}`,
              `DTSTAMP:${nowIcs}`,
              `DTSTART:${dtStart}`,
              `DTEND:${dtEnd}`,
              `SUMMARY:${escapeIcsText(`${item.title} (${day.title || `Day ${day.day_number}`})`)}`,
              `DESCRIPTION:${escapeIcsText(notes)}`,
              `LOCATION:${escapeIcsText(trip.destination || "Sri Lanka")}`,
              "STATUS:CONFIRMED",
              "END:VEVENT",
            ].join("\r\n")
          );
        });
      } else {
        // Fallback: Day-level all-day event
        const dtStart = toIcsDateTime(dayDate, "09:00", dayIndex);
        const dtEnd = toIcsDateTime(dayDate, "18:00", dayIndex);
        const uid = `slt-${trip.id || "preview"}-d${day.day_number || dayIndex}@srilankatourism.com`;

        events.push(
          [
            "BEGIN:VEVENT",
            `UID:${uid}`,
            `DTSTAMP:${nowIcs}`,
            `DTSTART:${dtStart}`,
            `DTEND:${dtEnd}`,
            `SUMMARY:${escapeIcsText(`${trip.title} - ${day.title || `Day ${day.day_number}`}`)}`,
            `DESCRIPTION:${escapeIcsText(trip.description || "Sri Lanka Itinerary Schedule")}`,
            `LOCATION:${escapeIcsText(trip.destination || "Sri Lanka")}`,
            "STATUS:CONFIRMED",
            "END:VEVENT",
          ].join("\r\n")
        );
      }
    });
  }

  // Assemble full VCALENDAR
  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Sri Lanka Tourism Platform//Travel Itinerary//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeIcsText(trip.title)}`,
    "X-WR-TIMEZONE:Asia/Colombo",
    events.join("\r\n"),
    "END:VCALENDAR",
  ].join("\r\n");

  // Trigger download via Blob
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const cleanTitle = (trip.title || "Sri_Lanka_Trip").replace(/[^a-zA-Z0-9_-]/g, "_");

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.setAttribute("download", `${cleanTitle}_Itinerary.ics`);
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Creates a 1-click Google Calendar web creation URL for the overall trip.
 */
export function getGoogleCalendarUrl(trip: Trip): string {
  const title = encodeURIComponent(trip.title);
  const details = encodeURIComponent(
    `${trip.description || "Sri Lanka Planned Itinerary"}\n\nManaged by Sri Lanka Tourism Platform`
  );
  const location = encodeURIComponent(trip.destination || "Sri Lanka");

  const startIcs = toIcsDateTime(trip.start_date, "09:00", 0);
  const endIcs = toIcsDateTime(trip.end_date, "18:00", (trip.days?.length || 1) - 1);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${startIcs}/${endIcs}`;
}
