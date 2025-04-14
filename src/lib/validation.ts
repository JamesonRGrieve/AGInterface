export function validateURI(uri: string): boolean {
  try {
    new URL(uri);
    return true;
  } catch {
    return false;
  }
}
