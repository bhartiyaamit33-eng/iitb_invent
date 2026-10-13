import Image from "next/image";

const STUDENTS = [
  { name: "Midhun K S", photo: "midhun-k-s.webp" },
  { name: "Amisha Pathak Choudhury", photo: "amisha-pathak-choudhury.webp" },
  { name: "Aditya Kumar Yadav", photo: "aditya-kumar-yadav.webp" },
  { name: "Lakshita Sheera", photo: "lakshita-sheera.webp" },
  { name: "Swarna Raut", photo: "swarna-raut.webp" },
  { name: "Fiza Mansoori", photo: "fiza-mansoori.webp" },
  { name: "Mallika", photo: "mallika.webp" },
];

export function StudentsSection() {
  return (
    <section aria-labelledby="students-heading" data-testid="students-section">
      <h2 id="students-heading" className="mb-6">Our PhD Students</h2>
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
            <h3 className="mt-4 text-lg font-semibold">{student.name}</h3>
          </article>
        ))}
      </div>
    </section>
  );
}
