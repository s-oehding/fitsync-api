import { Controller, Get } from '@nestjs/common'
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  MongooseHealthIndicator,
  MicroserviceHealthIndicator
} from '@nestjs/terminus'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { Transport, RedisOptions } from '@nestjs/microservices'
import { ConfigService } from '@nestjs/config'

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private mongoose: MongooseHealthIndicator,
    private microservice: MicroserviceHealthIndicator,
    private configService: ConfigService
  ) {
    console.log('health controller added')
  }

  @Get('/')
  @ApiOperation({ summary: 'HealthCheck' })
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.mongoose.pingCheck('mongoose'),
      async () =>
        this.microservice.pingCheck<RedisOptions>('redis', {
          transport: Transport.REDIS,
          options: {
            url: `redis://${this.configService.get(
              'REDIS_HOST'
            )}:${this.configService.get('REDIS_PORT')}`
          }
        }),
      async () =>
        this.microservice.pingCheck('kafka', {
          transport: Transport.TCP,
          options: {
            host: this.configService.get('KAFKA_HOST'),
            port: this.configService.get('KAFKA_PORT')
          }
        })
    ])
  }
}
