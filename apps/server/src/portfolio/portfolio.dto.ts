import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateHoldingDto {
  @IsString({ message: 'Scheme code must be a string.' })
  @IsNotEmpty({ message: 'Scheme code is required.' })
  scheme_code: string;

  @IsString({ message: 'Scheme name must be a string.' })
  @IsNotEmpty({ message: 'Scheme name is required.' })
  scheme_name: string;

  @IsNumber({}, { message: 'Units must be a number.' })
  @Min(0.01, { message: 'Units must be at least 0.01.' })
  units: number;

  @IsNumber({}, { message: 'Amount invested must be a number.' })
  @Min(10, { message: 'Amount invested must be at least ₹10.' })
  amount_invested: number;
}

export class UpdateHoldingDto {
  @IsNumber({}, { message: 'Units must be a number.' })
  @Min(0.01, { message: 'Units must be at least 0.01.' })
  @IsOptional()
  units: number;

  @IsNumber({}, { message: 'Amount invested must be a number.' })
  @Min(10, { message: 'Amount invested must be at least ₹10.' })
  @IsOptional()
  amount_invested: number;
}
