import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { eq, or } from 'drizzle-orm';
import { compareHash, hash } from '../../lib/utils';
import { DatabaseService } from '../db/database.service';
import { usersTable } from '../db/schema';
import { CreateUserDto, LoginUserDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(private dbService: DatabaseService) {}
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

    return createdUser;
  };

  authenticate = async (payload: LoginUserDto) => {
    const userExists = await this.dbService.db
      .select()
      .from(usersTable)
      .where(or(eq(usersTable.email, payload.identifier), eq(usersTable.username, payload.identifier)))
      .limit(1);

    if (!userExists.length || !(await compareHash(payload.password, userExists[0].password_hash)))
      throw new UnauthorizedException('Invalid username/email or password.');

    const { username, email, id } = userExists[0];

    return { id, username, email };
  };
}
