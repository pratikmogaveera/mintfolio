import { IsNotEmpty, IsNumberString, IsString } from 'class-validator';

export class CreateHoldingDto {
  @IsString()
  @IsNotEmpty()
  scheme_code: string;

  @IsString()
  @IsNotEmpty()
  scheme_name: string;

  @IsNumberString()
  @IsNotEmpty()
  units: string;

  @IsNumberString()
  @IsNotEmpty()
  amount_invested: string;
}
