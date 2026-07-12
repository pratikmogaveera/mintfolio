import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateHoldingDto {
  @IsString()
  @IsNotEmpty()
  scheme_code: string;

  @IsString()
  @IsNotEmpty()
  scheme_name: string;

  @IsNumber()
  @Min(0.01, { message: 'Minimum value of units is 0.01' })
  units: number;

  @IsNumber()
  @Min(10, { message: 'Minimum invested amount must be ₹10.00' })
  amount_invested: number;
}

export class UpdateHoldingDto {
  @IsNumber()
  @Min(0.01, { message: 'Minimum value of units is 0.01' })
  @IsOptional()
  units: number;

  @IsNumber()
  @Min(10, { message: 'Minimum invested amount must be ₹10.00' })
  @IsOptional()
  amount_invested: number;
}
