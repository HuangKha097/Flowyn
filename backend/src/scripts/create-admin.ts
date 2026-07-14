import 'dotenv/config';
import { MikroORM } from '@mikro-orm/mongodb';
import mikroOrmConfig from '../mikro-orm.config';
import { Role, User } from '../entities/User.entity';
import { hashPassword } from '../auth/password';

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password || password.length < 12) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD (minimum 12 characters) are required');
  }

  const orm = await MikroORM.init(mikroOrmConfig);
  try {
    const em = orm.em.fork();
    let user = await em.findOne(User, { email });
    if (user) {
      user.name = 'Flowyn Admin';
      user.password = await hashPassword(password);
      user.role = Role.ADMIN;
      user.deletedAt = undefined;
      user.refreshTokenHash = undefined;
    } else {
      user = em.create(User, {
        name: 'Flowyn Admin',
        email,
        password: await hashPassword(password),
        role: Role.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      em.persist(user);
    }
    await em.flush();
    console.log(`Admin account ready: ${email}`);
  } finally {
    await orm.close(true);
  }
}

createAdmin().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
