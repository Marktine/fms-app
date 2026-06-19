import { eq } from 'drizzle-orm';
import { db } from '../../core/db.ts';
import { users } from '../../core/schema.ts';

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export class AuthRepository {
  constructor() {}
  // Database operations will go here

  async findByEmail(email: string): Promise<User | undefined> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return result[0];
  }

  async createUser(data: NewUser): Promise<User> {
    const result = await db
      .insert(users)
      .values(data)
      .returning();

    return result[0];
  }
}
