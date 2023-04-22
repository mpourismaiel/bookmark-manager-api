export function organizeShortcuts(shortcuts) {
  const tree: any = []
  const shortcutMap = {}

  // create a map of shortcuts for easier lookup
  for (const shortcut of shortcuts) {
    shortcut.children = []
    shortcutMap[shortcut._id] = shortcut
  }

  for (const shortcut of shortcuts) {
    if (shortcut.parent) {
      const parent = shortcutMap[shortcut.parent]
      if (parent) {
        parent.children.push(shortcut)
      }
    } else {
      tree.push(shortcut)
    }
  }

  return tree
}
