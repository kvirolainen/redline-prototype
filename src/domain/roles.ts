// Screens name people by role, never by name: the names belong to the demo personas, not to the product.
// Dealer contacts and directors are stored as role titles ("Sales Manager", "Sales Director").

/** "Sales Director" → "the sales director", for the middle of a sentence. */
export const the = (role: string) => `the ${role.toLowerCase()}`;
/** "Sales Director" → "The sales director", to start a sentence. */
export const The = (role: string) => `The ${role.toLowerCase()}`;
/** A role as a byline, in sentence case like the rest of the screens: "Sales Director" → "Sales director",
 *  "Inspector" → "Clutch inspector". Names like "Redline" or "Clutch" stay as they are. */
export const byline = (who: string) => {
  if (who === 'Inspector') return 'Clutch inspector';
  if (!/\s/.test(who)) return who;
  return who.charAt(0) + who.slice(1).toLowerCase();
};
