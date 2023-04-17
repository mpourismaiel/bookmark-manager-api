import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

async function main() {
  const shortcuts: Promise<any>[] = [];
  for (let i = 0; i < 10; i++) {
    const username = `user${i}`;
    const user = await prisma.user.create({
      data: {
        uuid: uuidv4(),
        username,
        password: "password",
      },
    });

    for (let k = 0; k < Math.floor(Math.random() * 4); k++) {
      const listTitle = `List ${k}, ${username}`;
      const list = await prisma.list.create({
        data: {
          title: listTitle,
          ownerId: user.uuid,
        },
      });

      for (let j = 0; j < Math.floor(Math.random() * 10); j++) {
        const title = `Shortcut ${j}, ${listTitle}`;
        shortcuts.push(
          prisma.shortcut.create({
            data: {
              title,
              url: "https://example.com",
              listId: list.id,
            },
          })
        );
      }
    }
  }

  await Promise.all(shortcuts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
