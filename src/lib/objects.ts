export function deepMergeJSON(...objects: any[]) {
  const deepCopyObjects = objects.map((object) => JSON.parse(JSON.stringify(object)));
  return deepCopyObjects.reduce((merged, current) => ({ ...merged, ...current }), {});
}

export default function deepMerge(obj1: any, obj2: any) {
  const result = { ...obj1 };

  for (const key in obj2) {
    if (
      obj2[key] &&
      typeof obj2[key] === 'object' &&
      !Array.isArray(obj2[key]) &&
      obj1[key] &&
      typeof obj1[key] === 'object'
    ) {
      // If both are objects, recurse
      result[key] = deepMerge(obj1[key], obj2[key]);
    } else {
      // Otherwise, overwrite with obj2's value
      result[key] = obj2[key];
    }
  }

  return result;
}
