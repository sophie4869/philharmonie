import { Concert } from "../lib/types";

export function generateICS(concerts: Concert[]): string {
    const now = new Date();
    const icsHeader = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Philharmonie de Paris//Concerts//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'X-WR-CALNAME:Philharmonie de Paris Concerts',
        'X-WR-TIMEZONE:Europe/Paris',
    ].join('\r\n');

    const icsEvents = concerts.map(concert => {
        // Parse the date and time robustly
        const startDate = new Date(concert.date);
        if (concert.time) {
            // Handles times like "4:00 pm" or "11:30 am" or "20:00"
            const timeMatch = concert.time.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
            if (timeMatch) {
                let hours = parseInt(timeMatch[1], 10);
                const minutes = parseInt(timeMatch[2], 10);
                const ampm = timeMatch[3]?.toLowerCase();
                if (ampm === 'pm' && hours < 12) hours += 12;
                if (ampm === 'am' && hours === 12) hours = 0;
                startDate.setHours(hours, minutes, 0, 0);
            } else {
                // fallback: set to 8pm if time is invalid
                startDate.setHours(20, 0, 0, 0);
            }
        } else {
            // fallback: set to 8pm if no time
            startDate.setHours(20, 0, 0, 0);
        }
        const endDate = new Date(startDate);
        endDate.setHours(endDate.getHours() + 2); // Assuming concerts are 2 hours long

        const musiciansText = concert.musicians && concert.musicians.length > 0
            ? '\nMusicians: ' + concert.musicians.map(m => m.name + (m.role ? ` (${m.role})` : '')).join(', ')
            : '';
        const programText = concert.program && concert.program.length > 0
            ? '\nProgram: ' + concert.program.map(p => (p.composer ? p.composer + ': ' : '') + p.title + (p.details ? ` (${p.details})` : '')).join(' | ')
            : '';
        const fullDescription = escapeText(concert.description + musiciansText + programText);

        const event = [
            'BEGIN:VEVENT',
            `DTSTAMP:${formatDate(now)}`,
            `DTSTART:${formatDate(startDate)}`,
            `DTEND:${formatDate(endDate)}`,
            `SUMMARY:${escapeText(concert.title)}`,
            `DESCRIPTION:${fullDescription}`,
            `LOCATION:${escapeText(concert.location)}`,
            `URL:${concert.booking_url}`,
            'END:VEVENT'
        ].join('\r\n');

        return event;
    }).join('\r\n');

    const icsFooter = 'END:VCALENDAR';

    return [icsHeader, icsEvents, icsFooter].join('\r\n');
}

function formatDate(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function escapeText(text: string): string {
    return text
        .replace(/[,;\\]/g, '\\$&')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r');
}

interface CalendarDay {
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
    concerts: Concert[];
}

export function getCalendarDays(concerts: Concert[], targetMonth: Date = new Date()): CalendarDay[] {
    const today = new Date();
    const currentMonth = targetMonth.getMonth();
    const currentYear = targetMonth.getFullYear();

    // Get the first day of the current month
    const firstDay = new Date(currentYear, currentMonth, 1);
    // Get the last day of the current month
    const lastDay = new Date(currentYear, currentMonth + 1, 0);

    // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDay.getDay();
    // Get the day of the week for the last day
    const lastDayOfWeek = lastDay.getDay();

    // Calculate the number of days to show before the first day of the month
    const daysBefore = firstDayOfWeek;
    // Calculate the number of days to show after the last day of the month
    const daysAfter = 6 - lastDayOfWeek;

    // Create an array of all days to display
    const days: CalendarDay[] = [];

    // Add days from previous month
    for (let i = daysBefore - 1; i >= 0; i--) {
        const date = new Date(currentYear, currentMonth, -i);
        days.push({
            date,
            isCurrentMonth: false,
            isToday: isSameDay(date, today),
            concerts: getConcertsForDate(concerts, date)
        });
    }

    // Add days from current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
        const date = new Date(currentYear, currentMonth, i);
        days.push({
            date,
            isCurrentMonth: true,
            isToday: isSameDay(date, today),
            concerts: getConcertsForDate(concerts, date)
        });
    }

    // Add days from next month
    for (let i = 1; i <= daysAfter; i++) {
        const date = new Date(currentYear, currentMonth + 1, i);
        days.push({
            date,
            isCurrentMonth: false,
            isToday: isSameDay(date, today),
            concerts: getConcertsForDate(concerts, date)
        });
    }

    return days;
}

function isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate();
}

function getConcertsForDate(concerts: Concert[], date: Date): Concert[] {
    return concerts.filter(concert => {
        const concertDate = new Date(concert.date);
        return isSameDay(concertDate, date);
    });
} 