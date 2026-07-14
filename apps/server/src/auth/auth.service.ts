import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { eq, or } from 'drizzle-orm';
import { compareHash, hash } from '../../lib/utils';
import { DatabaseService } from '../db/database.service';
import { users } from '../db/schema';
import { CreateUserDto, LoginUserDto } from './auth.dto';
import { JwtService } from '@nestjs/jwt';
import { DatabaseError } from 'pg';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    private dbService: DatabaseService,
    private jwtService: JwtService,
  ) {}

  async register(payload: CreateUserDto) {
    try {
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
    } catch (error) {
      if (error instanceof HttpException) throw error;
      if (error instanceof Error && error.cause instanceof DatabaseError && error.cause.code === '23505') {
        this.logger.warn('User with these credentials already exists.');
        throw new ConflictException('User with these credentials already exists.');
      }
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong while registering user.';
      this.logger.warn(errorMessage);
      throw error;
    }
  }

  async authenticate(payload: LoginUserDto) {
    this.logger.log(`Login attempt: ${payload.identifier}`);
    try {
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
    } catch (error) {
      if (error instanceof HttpException) throw error;
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong while authenticating user.';
      this.logger.warn(errorMessage);
      throw error;
    }
  }

  async me(id: string | undefined) {
    try {
      if (!id) throw new BadRequestException('User ID is missing from request.');

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
      if (!user) throw new NotFoundException('User not found.');
      return user;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong while fetching user.';
      this.logger.warn(errorMessage);
      throw error;
    }
  }
}
