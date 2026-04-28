import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { WishlistPriority } from '@src/generated/prisma/enums';

export class CreateWishlistItemDto {
  @ApiProperty({ example: 'Ficus Lyrata' })
  @IsString()
  @MaxLength(100)
  speciesName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  estimatedPrice?: number;

  @ApiProperty({ enum: WishlistPriority, required: false, default: WishlistPriority.MEDIUM })
  @IsOptional()
  @IsEnum(WishlistPriority)
  priority?: WishlistPriority;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  link?: string;
}
