import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import User from './user.model'
import List from './list.model'
import Shortcut from './shortcut.model'
import jwt from 'jsonwebtoken'

async function createShortcuts(parentTitle, user, list, parent?, max = 6) {
  for (let i = 0; i < Math.floor(Math.random() * max); i++) {
    const title = `Shortcut ${i}, child of ${parentTitle}`

    const shortcut = await Shortcut.create({
      title,
      order: i,
      url: 'https://example.com',
      user: user.id,
      list: list.id,
      parent: parent,
    })

    await createShortcuts(title, user, list, shortcut.id, max / 2)
  }
}

async function main() {
  await User.deleteMany({})
  await List.deleteMany({})
  await Shortcut.deleteMany({})

  for (let i = 0; i < 10; i++) {
    const username = `user${i}`
    const user = await User.findOneAndUpdate(
      { username },
      {
        username,
        password: bcrypt.hashSync('password', 10),
        uuid: uuidv4(),
      },
      { upsert: true, new: true },
    )

    console.log(
      i % 2 === 0 ? '🍏' : '🍎',
      'Created user',
      user.username,
      user.uuid,
    )
    console.log(
      '\t',
      '🔑',
      jwt.sign(
        { id: user.id, uuid: user.uuid, username: user.username },
        process.env.JWT_SECRET || 'just-in-dev',
      ),
    )

    await List.deleteMany({
      user: user.id,
    })

    await Shortcut.deleteMany({
      user: user.id,
    })

    for (let k = 0; k < Math.floor(Math.random() * 4); k++) {
      const listTitle = `List ${k}, ${username}`
      const list = await List.create({
        title: listTitle,
        user: user.id,
      })
      await user.updateOne({
        $push: {
          lists: list.id,
        },
      })

      await createShortcuts(listTitle, user, list)

      const shortcuts = await Shortcut.find({ list: list.id })
      await list.updateOne({
        $push: {
          shortcuts: shortcuts.map(s => s.id),
        },
      })

      await user.updateOne({
        $push: {
          shortcuts: shortcuts.map(s => s.id),
        },
      })

      console.log('\t', '📝', 'Created list', list.title, list.id)
      console.log('\t', '🔗', `Created ${shortcuts.length} shortcuts`)
    }

    console.log('\n')
  }
}

export default main
