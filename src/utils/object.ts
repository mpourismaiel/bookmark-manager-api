export function pickDefined<T extends object>(obj: T): Partial<T> {
  const result: Partial<T> = {}
  for (const key in obj) {
    if (
      Object.prototype.hasOwnProperty.call(obj, key) &&
      obj[key as keyof T] !== undefined
    ) {
      result[key as keyof T] = obj[key as keyof T]
    }
  }
  return result
}
