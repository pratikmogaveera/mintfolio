import { BadRequestException, ConflictException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { eq, or } from 'drizzle-orm';
import { compareHash, hash } from '../../lib/utils';
import { DatabaseService } from '../db/database.service';
import { usersTable } from '../db/schema';
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
    if ((await this.dbService.db.select().from(usersTable).where(eq(usersTable.email, payload.email))).length)
      throw new ConflictException('User with the provided email already exists.');

    if ((await this.dbService.db.select().from(usersTable).where(eq(usersTable.username, payload.username))).length)
      throw new ConflictException('User with the provided username already exists.');

    const createdUser = await this.dbService.db
      .insert(usersTable)
      .values({
        email: payload.email,
        username: payload.username,
        password_hash: await hash(payload.password),
      })
      .returning({ id: usersTable.id, username: usersTable.username, email: usersTable.email });

    this.logger.log(`New user created: ${createdUser[0].username} ${createdUser[0].email}`);
    return createdUser[0];
  };

  authenticate = async (payload: LoginUserDto) => {
    this.logger.log(`Login attempt: ${payload.identifier}`);
    const userExists = await this.dbService.db
      .select()
      .from(usersTable)
      .where(or(eq(usersTable.email, payload.identifier), eq(usersTable.username, payload.identifier)))
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
          id: usersTable.id,
          username: usersTable.username,
          email: usersTable.email,
          created_at: usersTable.created_at,
        })
        .from(usersTable)
        .where(eq(usersTable.id, id))
    )?.[0];
    return user;
  };
}
