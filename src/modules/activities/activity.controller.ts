import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus
} from '@nestjs/common'

import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiParam
} from '@nestjs/swagger'

import { AuthGuard } from '@nestjs/passport'
import { RolesGuard } from 'src/modules/auth/guards/roles.guard'
import { Roles } from './../auth/decorators/roles.decorator'

import { ActivityService } from './activity.service'
import { CreateActivityDto } from './dto/create-activity.dto'
import { UpdateActivityDto } from './dto/update-activity.dto'

@ApiTags('Activity')
@Controller('activity')
@UseGuards(RolesGuard)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Post()
  create(@Body() createActivityDto: CreateActivityDto) {
    return this.activityService.create(createActivityDto)
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get All activitys for User' })
  @ApiOkResponse({})
  findAll() {
    return this.activityService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.activityService.findOne(+id)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateActivityDto: UpdateActivityDto
  ) {
    return this.activityService.update(+id, updateActivityDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.activityService.remove(+id)
  }
}
