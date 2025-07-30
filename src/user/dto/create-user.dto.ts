import { ApiProperty } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { IsEmail, IsEnum, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class CreateUserDto {
    @ApiProperty({ example: 'Alex' })
    @IsNotEmpty()
    @IsString()
    name: string;
  
    @ApiProperty({ example: 'Pass123' })
    @IsString() 
    @MaxLength(16)
    @MinLength(4)
    password: string;
  
    @ApiProperty({ example: 'alexbek@gmail.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;
  
    @ApiProperty({
      example: UserRole.STUDENT,
    })
    @IsEnum(UserRole)
    role: UserRole;
  }
  