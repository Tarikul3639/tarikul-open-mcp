import {
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class ListCalendarEventsInput {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  maxResults?: number;
}

// Date-time range used to find calendar events.
export class FindEventsByDateInput {
  @IsISO8601()
  startDate!: string;

  @IsISO8601()
  endDate!: string;
}

export class FindCalendarEventInput {
  @IsString()
  @MinLength(1)
  @MaxLength(1024)
  eventId!: string;
}

// Input accepted by the calendar service when creating an event.
export class CreateCalendarEventInput {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  summary!: string;

  @IsOptional()
  @IsString()
  @MaxLength(8192)
  description?: string;

  @IsISO8601()
  start!: string;

  @IsISO8601()
  end!: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  colorId?: string;
}

// Input accepted by the calendar service when updating an event.
export class UpdateCalendarEventInput {
  @IsString()
  @MinLength(1)
  @MaxLength(1024)
  eventId!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  summary?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8192)
  description?: string;

  @IsOptional()
  @IsISO8601()
  start?: string;

  @IsOptional()
  @IsISO8601()
  end?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  colorId?: string;
}
