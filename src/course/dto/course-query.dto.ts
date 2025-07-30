import { IsOptional, IsNumber, IsString, IsEnum, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum CourseSortBy {
  NAME = 'name',
  PRICE = 'price',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt'
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}

export class CourseQueryDto {
  @ApiProperty({required:false})
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({required:false})
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({required:false})
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string;

  @ApiProperty({required:false})
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  teacher?: string;


  @ApiProperty({required:false})
  @IsOptional()
  @IsEnum(CourseSortBy)
  sortBy?: CourseSortBy = CourseSortBy.CREATED_AT;

  @ApiProperty({required:false})
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}


export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}