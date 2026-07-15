import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateSubscription {
  @IsUrl({}, { message: 'A valid push endpoint URL is required.' })
  endpoint: string;

  @IsString({ message: 'p256dh key must be a string.' })
  @IsNotEmpty({ message: 'p256dh key is required.' })
  p256dh: string;

  @IsString({ message: 'Auth key must be a string.' })
  @IsNotEmpty({ message: 'Auth key is required.' })
  auth: string;
}
