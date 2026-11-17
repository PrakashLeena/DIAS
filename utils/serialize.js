// Converts Mongoose lean documents (ObjectId, Date) into plain JSON-safe objects
// that can be passed from Server Components to Client Components.
export function serialize(doc) {
  return JSON.parse(JSON.stringify(doc ?? null));
}

export function escapeRegex(str = '') {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
