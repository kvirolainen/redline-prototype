// Real defect photos for the demo, matched to a photo by its caption ("Glass, photo 1", "Windshield, driver side").
// Both from Wikimedia Commons; credits in public/photos/CREDITS.md. Anything else stays a camera placeholder.
const PHOTOS: [RegExp, string][] = [
  [/glass|windshield/i, '/photos/windshield-crack.jpg'],
  [/body|paint|arch|bumper/i, '/photos/paint-lifting.jpg'],
];

export function photoFor(caption: string): string | null {
  return PHOTOS.find(([re]) => re.test(caption))?.[1] ?? null;
}
