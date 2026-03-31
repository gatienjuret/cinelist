export function downloadICS(film, cinema, showDate, showTime) {
  // Format showDate (YYYY-MM-DD) and showTime (HH:MM)
  const dateParts = showDate.split('-');
  const timeParts = showTime.split(':');
  
  const startDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], timeParts[0], timeParts[1]);
  // Default duration: 2 hours
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

  const formatICSDate = (date) => {
    return date.getFullYear().toString() +
           (date.getMonth() + 1).toString().padStart(2, '0') +
           date.getDate().toString().padStart(2, '0') + 'T' +
           date.getHours().toString().padStart(2, '0') +
           date.getMinutes().toString().padStart(2, '0') +
           date.getSeconds().toString().padStart(2, '0');
  };

  const dtStart = formatICSDate(startDate);
  const dtEnd = formatICSDate(endDate);
  
  const stamp = formatICSDate(new Date()) + 'Z';
  const uid = `${new Date().getTime()}@cinelist.film`;
  
  const title = `Séance Cinéma : ${film.title}`;
  const location = `${cinema.name}, ${cinema.address}`;
  const description = `Vous avez prévu d'aller voir le film "${film.title}" au cinéma ${cinema.name}.\\n\\nSynopsis:\\n${film.synopsis || "Non disponible."}`;

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CinéList//FR
CALSCALE:GREGORIAN
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${stamp}
DTSTART:${dtStart}
DTEND:${dtEnd}
SUMMARY:${title}
LOCATION:${location}
DESCRIPTION:${description}
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  
  const safeTitle = film.title.replace(/[^a-zA-Z0-9_-]/g, '_');
  link.setAttribute('download', `cinelist_${safeTitle}_${showDate}.ics`);
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
