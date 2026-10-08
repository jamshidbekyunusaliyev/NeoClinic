export type Doctor = {
  id: string;
  name: string;
  speciality: string;
  degree: string;
  experience: number;
  fees: number;
  rating: number;
  reviews: number;
  available: boolean;
  today: boolean;
  image: string;
  color: string;
  bio: string;
};

export const specialities = [
  "General physician",
  "Gynecologist",
  "Dermatologist",
  "Pediatricians",
  "Neurologist",
  "Gastroenterologist",
];

export const doctors: Doctor[] = [
  { id: "amara-patel", name: "Dr. Amara Patel", speciality: "General physician", degree: "MBBS, MD · Internal Medicine", experience: 12, fees: 120, rating: 4.98, reviews: 238, available: true, today: true, image: "photo-1559839734-2b71ea197ec2", color: "#a7f3d0", bio: "Thoughtful, whole-person care for every stage of life. Dr. Patel makes time to listen, explain, and build a care plan that fits you." },
  { id: "elena-morris", name: "Dr. Elena Morris", speciality: "Gynecologist", degree: "MD · Obstetrics & Gynecology", experience: 9, fees: 150, rating: 4.96, reviews: 184, available: true, today: false, image: "photo-1594824476967-48c8b964273f", color: "#fbcfe8", bio: "Dr. Morris provides compassionate, evidence-led women's healthcare, from routine wellness to complex care." },
  { id: "noah-williams", name: "Dr. Noah Williams", speciality: "Dermatologist", degree: "MD · Dermatology", experience: 14, fees: 180, rating: 4.94, reviews: 316, available: true, today: true, image: "photo-1612349317150-e413f6a5b16d", color: "#bfdbfe", bio: "A board-certified dermatologist focused on healthy skin, clear answers, and treatment plans grounded in the latest research." },
  { id: "sofia-chen", name: "Dr. Sofia Chen", speciality: "Pediatricians", degree: "MD · Pediatrics", experience: 11, fees: 130, rating: 4.99, reviews: 292, available: false, today: false, image: "photo-1551836022-d5d88e9218df", color: "#fde68a", bio: "Dr. Chen partners with families to give children a warm, confident start and the care they need as they grow." },
  { id: "lucas-bennett", name: "Dr. Lucas Bennett", speciality: "Neurologist", degree: "MD · Neurology", experience: 16, fees: 220, rating: 4.91, reviews: 147, available: true, today: true, image: "photo-1622253692010-333f2da6031d", color: "#ddd6fe", bio: "Specialist neurological care with a clear, collaborative approach to diagnosis, treatment, and long-term wellbeing." },
  { id: "maya-johnson", name: "Dr. Maya Johnson", speciality: "Gastroenterologist", degree: "MD · Gastroenterology", experience: 13, fees: 200, rating: 4.97, reviews: 201, available: true, today: false, image: "photo-1580489944761-15a19d654956", color: "#fecaca", bio: "Dr. Johnson helps patients find relief and clarity with personalized care for digestive and gut health." },
  { id: "oliver-grant", name: "Dr. Oliver Grant", speciality: "General physician", degree: "MBBS, DNB · Family Medicine", experience: 8, fees: 100, rating: 4.89, reviews: 132, available: true, today: true, image: "photo-1537368910025-700350fe46c7", color: "#bae6fd", bio: "Accessible primary care for busy lives, with a focus on prevention, continuity, and feeling heard." },
  { id: "isabella-rossi", name: "Dr. Isabella Rossi", speciality: "Gynecologist", degree: "MD · Women's Health", experience: 18, fees: 190, rating: 4.95, reviews: 255, available: false, today: false, image: "photo-1551836022-4c4c79ecde51", color: "#f5d0fe", bio: "A trusted women's health specialist offering attentive care through every chapter of life." },
  { id: "ethan-brooks", name: "Dr. Ethan Brooks", speciality: "Dermatologist", degree: "MD · Clinical Dermatology", experience: 7, fees: 140, rating: 4.87, reviews: 119, available: true, today: true, image: "photo-1500648767791-00dcc994a43e", color: "#c7d2fe", bio: "Practical, personalized dermatology, from everyday skin concerns to advanced treatments." },
  { id: "grace-kim", name: "Dr. Grace Kim", speciality: "Pediatricians", degree: "MD · Pediatrics, FAAP", experience: 15, fees: 160, rating: 4.99, reviews: 328, available: true, today: true, image: "photo-1594824476967-48c8b964273f", color: "#bbf7d0", bio: "Dr. Kim creates a calm, welcoming space for children and the people who care for them." },
  { id: "james-okafor", name: "Dr. James Okafor", speciality: "Neurologist", degree: "MD · Neurology, PhD", experience: 20, fees: 250, rating: 4.93, reviews: 176, available: false, today: false, image: "photo-1560250097-0b93528c311a", color: "#a5f3fc", bio: "An experienced neurologist delivering advanced care with compassion and a strong patient partnership." },
  { id: "layla-hassan", name: "Dr. Layla Hassan", speciality: "Gastroenterologist", degree: "MD · Digestive Health", experience: 10, fees: 175, rating: 4.92, reviews: 162, available: true, today: true, image: "photo-1551836022-91a0e9f53e3d", color: "#fed7aa", bio: "Dr. Hassan brings curiosity, careful listening, and evidence-based treatment to every digestive health visit." },
];

export function doctorImage(image: string) {
  return `https://images.unsplash.com/${image}?auto=format&fit=crop&w=900&q=85`;
}