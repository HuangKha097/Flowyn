import 'dotenv/config';
import { MikroORM } from '@mikro-orm/mongodb';
import mikroOrmConfig from '../mikro-orm.config';
import { Role, User } from '../entities/User.entity';
import { hashPassword } from '../auth/password';

async function createManager() {
  const email = process.env.MANAGER_EMAIL?.trim().toLowerCase();
  const password = process.env.MANAGER_PASSWORD;
  if (!email || !password || password.length < 12) throw new Error('MANAGER_EMAIL and MANAGER_PASSWORD (minimum 12 characters) are required');
  const orm = await MikroORM.init(mikroOrmConfig);
  try {
    const em = orm.em.fork();
    let user = await em.findOne(User, { email });
    if (user) {
      user.name = 'Flowyn Manager';
      user.password = await hashPassword(password);
      user.role = Role.MANAGER;
      user.deletedAt = undefined;
      user.refreshTokenHash = undefined;
    } else {
      const now = new Date();
      user = em.create(User, { name: 'Flowyn Manager', email, password: await hashPassword(password), role: Role.MANAGER, createdAt: now, updatedAt: now });
      em.persist(user);
    }
    await em.flush();
    console.log(`Manager account ready: ${email}`);
  } finally { await orm.close(true); }
}

createManager().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
