export type QuestStatus = 'locked' | 'active' | 'completed';

export interface Quest {
  id: string;
  title: string;
  description: string;
  isHidden?: boolean;
  points?: number;
}

export const QUESTS: Quest[] = [
  {
    id: 'q1',
    title: 'The Birthday VIP',
    description: 'Βγάλε μια φωτογραφία με τη Βασιλική (την εορτάζουσα)!',
  },
  {
    id: 'q2',
    title: 'Roulette',
    description: 'Όλοι πρέπει να πιουν σφηνάκι από την ρουλέτα!',
  },
  {
    id: 'q3',
    title: 'The Recruiter',
    description: 'Βρες 3 άτομα που δεν ήξερες και πείσε τους να βγάλετε μια ομαδική selfie.',
  },
  {
    id: 'q4',
    title: 'Mirror, Mirror',
    description: 'Βγάλε φωτό με τον πιο όμορφο άνθρωπο στο πάρτυ.',
  },
  {
    id: 'q5',
    title: 'Dance Floor Hero',
    description: 'Βγάλε μια φωτό την ώρα που χορεύεις σαν να μην υπάρχει αύριο.',
  },
  {
    id: 'q6',
    title: 'Cheers!',
    description: 'Τσούγκρισε το ποτήρι σου με 5 διαφορετικά άτομα ταυτόχρονα (χρειαζόμαστε τα ποτήρια στην κάμερα).',
  },
  {
    id: 'q7',
    title: 'Photobomb',
    description: 'Μπες κρυφά στη φωτογραφία κάποιου άλλου και ανέβασέ την εδώ.',
  },
  {
    id: 'q8',
    title: 'DJ Apprentice',
    description: 'Βγάλε μια φωτογραφία με τον DJ του πάρτι.',
  },
  {
    id: 'q9',
    title: 'Get Inked!',
    description: 'Κάνε ένα από τα αυτοκόλλητα τατού του πάρτι και ανέβασε φωτογραφία να το δούμε!',
  },
  {
    id: 'q10',
    title: 'Τα Αναφιώτικα',
    description: 'Ρώτα και μάθε για την ιστορία στα αναφιώτικα και ανέβασε μια φωτό που το κάνεις recreate με έναν φίλο σου!',
    isHidden: true,
    points: 3
  }
];
