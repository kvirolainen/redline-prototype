// Screens name people by role, never by name: the names belong to the demo personas, not to the product.
// Dealer contacts and directors are stored as role titles ("Sales Manager", "Sales Director").

/** "Sales Director" → "the sales director", for the middle of a sentence. */
export const the = (role: string) => `the ${role.toLowerCase()}`;
/** "Sales Director" → "The sales director", to start a sentence. */
export const The = (role: string) => `The ${role.toLowerCase()}`;
