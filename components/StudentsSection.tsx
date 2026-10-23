import Image from "next/image";

const STUDENTS: { name: string; photo?: string; focus: string }[] = [
  { name: "Midhun K S", photo: "midhun-k-s.webp", focus: "center top" },
  { name: "Amisha Pathak Choudhury", photo: "amisha-pathak-choudhury.webp", focus: "center top" },
  { name: "Aditya Kumar Yadav", photo: "aditya-kumar-yadav.webp", focus: "center top" },
  { name: "Lakshita Sheera", photo: "lakshita-sheera.webp", focus: "center top" },
  { name: "Swarna Raut", photo: "swarna-raut.webp", focus: "center top" },
  { name: "Fiza Mansoori", photo: "fiza-mansoori.webp", focus: "center top" },
  { name: "Mallika", photo: "mallika.webp", focus: "center top" },
  { name: "Krishna Tupe", photo: "krishna-tupe.webp", focus: "center 28%" },
];

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0] ?? "")
    .join("")
    .toUpperCase();
}

export function StudentsSection() {
  return (
    <ul className="team-grid" data-testid="students-section">
      {STUDENTS.map((student) => (
        <li key={student.name}>
          <article className="team-card" data-testid="student-card">
            <div className="team-photo">
              {student.photo ? (
                <Image
                  src={`/assets/students/${student.photo}`}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 46vw, (max-width: 900px) 30vw, 18vw"
                  className="team-portrait"
                  style={{ objectPosition: student.focus }}
                />
              ) : (
                <span className="team-initials" aria-hidden="true">
                  {initials(student.name)}
                </span>
              )}
            </div>
            <h3>{student.name}</h3>
            <p>PhD student</p>
          </article>
        </li>
      ))}
    </ul>
  );
}
