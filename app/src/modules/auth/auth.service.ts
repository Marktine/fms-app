import { AuthRepository } from './auth.repository.ts';
import { hash, verify } from '@felix/argon2';
import { sign } from 'hono/jwt';

export class AuthService {
  constructor(private readonly repo: AuthRepository) {}

  // Authentication logic will go here
  async login(email: string, password: string): Promise<string | false> {
    const user = await this.repo.findByEmail(email);
    if (user) {
      const userPass = user.passwordHash;
      if (await verify(userPass, password)) {
        const payload = {
          userId: user.id,
          email: user.email,
          exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24),
        };

        const jwtSecret = Deno.env.get('JWT_SECRET');
        if (jwtSecret) {
          const token = await sign(payload, jwtSecret);
          return token;
        }
      }
    }
    return false;
  }

  async register(email: string, password: string): Promise<{
    errorMessage?: string;
    result: boolean;
  }> {
    const passwordHash = await hash(password);
    const user = await this.repo.findByEmail(email);
    let errorMessage = 'Failed to create new user!';
    if (!user) {
      const newUser = await this.repo.createUser({
        email,
        passwordHash,
      });
      if (newUser) {
        return {
          result: true,
        };
      }
    } else {
      errorMessage = 'User already exists';
    }
    return {
      errorMessage,
      result: false,
    };
  }
}
