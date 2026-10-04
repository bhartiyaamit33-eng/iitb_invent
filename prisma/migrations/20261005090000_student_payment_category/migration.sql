-- UG and PG students share the GST-inclusive student fee band.
ALTER TYPE "ProfessionalCategory" ADD VALUE IF NOT EXISTS 'STUDENT';
