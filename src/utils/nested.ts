export function organizeShortcuts(arr) {
  const result: any[] = []
  const map = {}
  for (let i = 0; i < arr.length; i++) {
    const obj = arr[i]
    obj.children = []
    map[obj._id] = obj
    if (obj.parent) {
      if (!map[obj.parent].children) {
        map[obj.parent].children = []
      }
      map[obj.parent].children.push(obj)
    } else {
      result.push(obj)
    }
  }
  return result
}
