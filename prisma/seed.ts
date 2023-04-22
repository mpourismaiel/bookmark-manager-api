import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

async function main() {
  const shortcuts: Promise<any>[] = []
  await prisma.user.deleteMany({
    where: {
      username: {
        startsWith: 'user',
      },
    },
  })

  for (let i = 0; i < 10; i++) {
    const username = `user${i}`
    const user = await prisma.user.upsert({
      where: { username },
      create: {
        uuid: uuidv4(),
        username,
        password: bcrypt.hashSync('password', 10),
      },
      update: {},
    })

    console.log(
      i % 2 === 0 ? '🍏' : '🍎',
      'Created user',
      user.username,
      user.uuid,
    )

    await prisma.list.deleteMany({
      where: {
        ownerId: user.uuid,
      },
    })

    await prisma.shortcut.deleteMany({
      where: {
        parentId: null,
        list: {
          ownerId: user.uuid,
        },
      },
    })

    for (let k = 0; k < Math.floor(Math.random() * 4); k++) {
      const listTitle = `List ${k}, ${username}`
      const list = await prisma.list.create({
        data: {
          title: listTitle,
          ownerId: user.uuid,
        },
      })

      for (let j = 0; j < Math.floor(Math.random() * 10); j++) {
        const title = `Shortcut ${j}, ${listTitle}`
        const shortcut = await prisma.shortcut.create({
          data: {
            title,
            order: j,
            url: 'https://example.com',
            listId: list.id,
          },
        })

        for (let jj = 0; jj < Math.floor(Math.random() * 6); jj++) {
          const title = `Shortcut ${jj}, child of ${j}, ${listTitle}`

          await prisma.shortcut.create({
            data: {
              title,
              order: j,
              url: 'https://example.com',
              parentId: shortcut.id,
            },
          })
        }
      }
    }
  }

  await Promise.all(shortcuts)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
