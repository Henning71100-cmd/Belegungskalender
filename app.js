const WORKER_URL = "https://hafenglueck-belegungskalender.henning71100.workers.dev/";

async function loadCalendar() {
  const root = document.getElementById("calendar");
  const status = document.getElementById("status");

  try {
    const res = await fetch(WORKER_URL);
    const data = await res.json();

    if (!data.ok) throw new Error("Kalenderdaten konnten nicht geladen werden.");

    status.textContent = "Aktualisiert: " + new Date(data.updatedAt).toLocaleString("de-DE");

    const events = data.events || [];
    root.innerHTML = "";

    for (let i = 0; i < 12; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      root.appendChild(renderMonth(date, events));
    }
  } catch (err) {
    root.innerHTML = "<p>Der Kalender konnte nicht geladen werden.</p>";
    status.textContent = err.message;
  }
}

function renderMonth(date, events) {
  const year = date.getFullYear();
  const month = date.getMonth();

  const box = document.createElement("section");
  box.className = "month";

  const title = document.createElement("h2");
  title.textContent = date.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
  box.appendChild(title);

  const grid = document.createElement("div");
  grid.className = "grid";

  ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].forEach(d => {
    const el = document.createElement("div");
    el.className = "weekday";
    el.textContent = d;
    grid.appendChild(el);
  });

  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  for (let i = 0; i < offset; i++) grid.appendChild(document.createElement("div"));

  const days = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  today.setHours(0,0,0,0);

  for (let day = 1; day <= days; day++) {
    const d = new Date(year, month, day);
    const iso = toISO(d);

    const cell = document.createElement("div");
    cell.className = "day";
    cell.textContent = day;

    if (d < today) {
      cell.classList.add("past");
    } else if (isCheckoutDay(iso, events)) {
      cell.classList.add("changeover");
    } else if (isBookedNight(iso, events)) {
      cell.classList.add("booked");
    } else {
      cell.classList.add("free");
    }

    grid.appendChild(cell);
  }

  box.appendChild(grid);
  return box;
}

function isBookedNight(date, events) {
  return events.some(e => date >= e.start && date < e.end);
}

function isCheckoutDay(date, events) {
  return events.some(e => date === e.end) && !isBookedNight(date, events);
}

function toISO(d) {
  return d.toISOString().slice(0, 10);
}

loadCalendar();
