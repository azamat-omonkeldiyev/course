import { IsString, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({example:"React Native"})
  @IsString()
  name: string;

  @ApiProperty({example:"For everybody, who is interseting IT"})
  @IsString()
  description: string;

  @ApiProperty({example: 1999000})
  @IsInt()
  price: number;

  @ApiProperty({example: "Bill Dev"})
  @IsString()
  teacher: string;
}
