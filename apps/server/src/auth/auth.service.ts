import { BadRequestException, ConflictException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { eq, or } from 'drizzle-orm';
import { compareHash, hash } from '../../lib/utils';
import { DatabaseService } from '../db/database.service';
import { users } from '../db/schema';
import { CreateUserDto, LoginUserDto } from './auth.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('Auth');

  constructor(
    private dbService: DatabaseService,
    private jwtService: JwtService,
  ) {}

  register = async (payload: CreateUserDto) => {
    if ((await this.dbService.db.select().from(users).where(eq(users.email, payload.email))).length)
      throw new ConflictException('User with the provided email already exists.');

    if ((await this.dbService.db.select().from(users).where(eq(users.username, payload.username))).length)
      throw new ConflictException('User with the provided username already exists.');

    const createdUser = await this.dbService.db
      .insert(users)
      .values({
        email: payload.email,
        username: payload.username,
        password_hash: await hash(payload.password),
      })
      .returning({ id: users.id, username: users.username, email: users.email });

    this.logger.log(`New user created: ${createdUser[0].username} ${createdUser[0].email}`);
    return createdUser[0];
  };

  authenticate = async (payload: LoginUserDto) => {
    this.logger.log(`Login attempt: ${payload.identifier}`);
    const userExists = await this.dbService.db
      .select()
      .from(users)
      .where(or(eq(users.email, payload.identifier), eq(users.username, payload.identifier)))
      .limit(1);

    if (!userExists.length || !(await compareHash(payload.password, userExists[0].password_hash))) {
      this.logger.warn(`Login failed: ${payload.identifier}`);
      throw new UnauthorizedException('Invalid username/email or password.');
    }

    const { username, email, id } = userExists[0];
    const tokenPayload: JwtSign = { sub: id };

    this.logger.log(`Login successful: ${payload.identifier}`);

    return { id, username, email, accessToken: await this.jwtService.signAsync(tokenPayload) };
  };

  me = async (id: string | undefined) => {
    if (!id) throw new BadRequestException();

    const user = (
      await this.dbService.db
        .select({
          id: users.id,
          username: users.username,
          email: users.email,
          created_at: users.created_at,
        })
        .from(users)
        .where(eq(users.id, id))
    )?.[0];
    return user;
  };
}
