import Image from "next/image";

const STUDENTS = [
  { name: "Midhun K S", year: "1st Year", photo: "midhun-k-s.webp" },
  { name: "Amisha Pathak Choudhury", year: "1st Year", photo: "amisha-pathak-choudhury.webp" },
  { name: "Aditya Kumar Yadav", year: "1st Year", photo: "aditya-kumar-yadav.webp" },
  { name: "Lakshita Sheera", year: "1st Year", photo: "lakshita-sheera.webp" },
  { name: "Swarna Raut", year: "2nd Year", photo: "swarna-raut.webp" },
  { name: "Fiza Mansoori", year: "1st Year", photo: "fiza-mansoori.webp" },
  { name: "Mallika", year: "2nd Year", photo: "mallika.webp" },
];

export function StudentsSection() {
  return (
    <section aria-labelledby="students-heading" className="mt-12" data-testid="students-section">
      <h3 id="students-heading" className="mb-6 text-3xl font-semibold">Our PhD Students</h3>
      <div className="grid grid-cols-1 gap-x-6 gap-y-8 min-[400px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {STUDENTS.map((student) => (
          <article key={student.name} data-testid="student-card">
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-slate-100">
              <Image
                src={`/assets/students/${student.photo}`}
                alt={student.name}
                fill
                sizes="(max-width: 399px) 100vw, (max-width: 767px) 50vw, (max-width: 1023px) 33vw, 25vw"
                className="object-cover object-top"
              />
            </div>
            <h4 className="mt-4 text-lg font-semibold">{student.name}</h4>
            {student.year && <p className="mt-1 text-sm text-slate-600">{student.year}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}
