import { IsString, IsNotEmpty, MaxLength, Matches, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTodoDto {
  @ApiProperty({
    description: 'The title of the To-Do item',
    example: 'Buy milk',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Matches(/^[a-zA-Z0-9 ]+$/, {
    message: 'Title must contain only alphanumeric characters and spaces',
  })
  title!: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Optional image file to upload with the To-Do',
    required: false,
  })
  @IsOptional()
  image?: any;
}


