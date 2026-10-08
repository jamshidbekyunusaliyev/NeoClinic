import { connectDatabase } from "../app/lib/server/db";
import { doctors, doctorImage } from "../app/lib/doctors";
import { Doctor } from "../app/models/Doctor";

async function seed() {
  await connectDatabase();
  await Doctor.bulkWrite(doctors.map((doctor) => ({
    updateOne: {
      filter: { _id: doctor.databaseId },
      update: { $set: {
        name: doctor.name,
        speciality: doctor.speciality,
        degree: doctor.degree,
        experience: doctor.experience,
        fees: doctor.fees,
        rating: doctor.rating,
        reviews: doctor.reviews,
        available: doctor.available,
        availableToday: doctor.today,
        imageUrl: doctorImage(doctor.image),
        bio: doctor.bio,
      } },
      upsert: true,
    },
  })));
  console.info(`Seeded ${doctors.length} Prescripto doctors.`);
  await (await import("mongoose")).default.disconnect();
}

seed().catch(async (error: unknown) => {
  console.error("Doctor seed failed:", error);
  await (await import("mongoose")).default.disconnect();
  process.exitCode = 1;
});