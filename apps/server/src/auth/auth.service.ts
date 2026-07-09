import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { DatabaseService } from '../db/database.service';
import { usersTable } from '../db/schema';
import { CreateUserDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(private dbService: DatabaseService) {}
  registerUser = async (payload: CreateUserDto) => {
    if ((await this.dbService.db.select().from(usersTable).where(eq(usersTable.email, payload.email))).length)
      throw new ConflictException('User with the provided email already exists.');

    if ((await this.dbService.db.select().from(usersTable).where(eq(usersTable.username, payload.username))).length)
      throw new ConflictException('User with the provided username already exists.');

    const createdUser = await this.dbService.db
      .insert(usersTable)
      .values({
        email: payload.email,
        username: payload.username,
        password_hash: await bcrypt.hash(payload.password, 10),
      })
      .returning({ id: usersTable.id, username: usersTable.username, email: usersTable.email });

    return createdUser;
  };
}
