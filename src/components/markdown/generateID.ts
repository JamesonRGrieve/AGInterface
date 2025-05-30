export default function generateId(text: string): string {
  return text ? text.toString().toLowerCase().replace(/\W+/g, '-') : '';
}
