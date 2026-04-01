import { IsBoolean, IsOptional, IsString, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTodoDto {
  @ApiProperty({
    description: 'The updated title of the To-Do item',
    example: 'Buy almond milk instead',
    required: false,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Matches(/^[a-zA-Z0-9 ]+$/, {
    message: 'Title must contain only alphanumeric characters and spaces',
  })
  title?: string;

  @ApiProperty({
    description: 'Whether the To-Do is completed',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}

