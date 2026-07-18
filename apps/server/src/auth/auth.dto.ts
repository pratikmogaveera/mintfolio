import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  @Length(3, 254, { message: 'Please enter a valid email (3-254 characters).' })
  email: string;

  @IsString({ message: 'Username must be a string.' })
  @IsNotEmpty({ message: 'Username is required.' })
  @Length(3, 40, { message: 'Please enter a valid username (3-40 characters).' })
  username: string;

  @IsString({ message: 'Password must be a string.' })
  @IsNotEmpty({ message: 'Password is required.' })
  @Length(8, 40, { message: 'Please enter a valid password (8-40 characters).' })
  password: string;
}

export class LoginUserDto {
  @IsString({ message: 'Identifier must be a string.' })
  @IsNotEmpty({ message: 'Username or email is required.' })
  @Length(3, 254, { message: 'Please enter a valid username or email (3-254 characters).' })
  identifier: string;

  @IsString({ message: 'Password must be a string.' })
  @IsNotEmpty({ message: 'Password is required.' })
  @Length(8, 40, { message: 'Please enter a valid password (8-40 characters).' })
  password: string;
}
