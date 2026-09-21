import { PROGRAMME_DAYS } from "@/lib/site";

export function ProgrammeOutline() {
  return (
    <div className="days-grid">
      {PROGRAMME_DAYS.map((day) => (
        <article key={day.id} className="day-col">
          <p className="site-kicker is-blue">{day.kicker}</p>
          <p className="date">{day.date}</p>
          <h3>{day.title}</h3>
          <p className="lead">{day.intro}</p>
          <ul>
            {day.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}
