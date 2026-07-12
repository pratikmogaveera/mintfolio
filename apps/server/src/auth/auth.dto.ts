import { IsEmail, IsNotEmpty, IsString, Length, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  email: string;

  @IsString({ message: 'Username must be a string.' })
  @IsNotEmpty({ message: 'Username is required.' })
  @Length(3, 30, { message: 'Username must be between 3 and 30 characters.' })
  username: string;

  @IsString({ message: 'Password must be a string.' })
  @IsNotEmpty({ message: 'Password is required.' })
  @MinLength(6, { message: 'Password must be at least 6 characters.' })
  password: string;
}

export class LoginUserDto {
  @IsString({ message: 'Identifier must be a string.' })
  @IsNotEmpty({ message: 'Username or email is required.' })
  @Length(3, 40, { message: 'Please enter a valid username or email (3–40 characters).' })
  identifier: string;

  @IsString({ message: 'Password must be a string.' })
  @IsNotEmpty({ message: 'Password is required.' })
  password: string;
}
