import {
  MongoExceptionFilter,
  MongooseExceptionFilter
} from '@/filters/mongo-exception.filter'
import { HttpAdapterHost, NestFactory } from '@nestjs/core'
if (process.env.NEW_RELIC_LICENSE_KEY) {
  require('newrelic')
}
import { AppModule } from './app.module'
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule
} from 'nest-winston'
import { Logger, ValidationPipe } from '@nestjs/common'
import * as winston from 'winston'
import * as path from 'path'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { Transport } from '@nestjs/microservices'
import { ConfigService } from '@nestjs/config'

async function bootstrap() {
  const configApp = await NestFactory.create(AppModule)
  const configService = configApp.get<ConfigService>(ConfigService)
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: true,
      allowedHeaders: [
        'Origin',
        'Access-Control-Request-Method',
        'Access-Control-Allow-Origin',
        'Access-Control-Allow-Headers',
        'Accept',
        'alloworigin',
        'x-mm-debug',
        'Cache-Control',
        'Content-Type',
        'Access-Control-Allow-Credentials',
        'Authorization'
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      credentials: true
    },
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            nestWinstonModuleUtilities.format.nestLike()
          )
        }),
        new winston.transports.File({
          filename: path.dirname(__dirname) + '/logs/error.log',
          level: 'error'
        }),
        new winston.transports.File({
          filename: path.dirname(__dirname) + '/logs/combined.log'
        })
        /*new NewrelicWinston({
          env: NODE_ENV,
          app_name: [COMPOSE_PROJECT_NAME],
          license_key: '',
        }),*/
      ],
      exitOnError: false
    })
  })

  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('MS Monsooq Example API')
      .setDescription('MS Monsooq Example API description')
      .setVersion('1.0')
      .addBearerAuth()
      // .addTag('articles')
      .build()
  )
  SwaggerModule.setup('', app, document)

  app.useGlobalPipes(new ValidationPipe())
  // app.useGlobalFilters(new GlobalExceptionFilter(Logger))
  app.useGlobalFilters(new MongoExceptionFilter(app.get(HttpAdapterHost)))
  app.useGlobalFilters(new MongooseExceptionFilter(app.get(HttpAdapterHost)))

  if (configService.get('USE_KAFKA') === 1) {
    app.connectMicroservice({
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: [
            `${configService.get('KAFKA_HOST')}:${configService.get(
              'KAFKA_PORT'
            )}`
          ]
        },
        consumer: {
          groupId: configService.get('KAFKA_GROUP_ID')
        }
      }
    })
  }

  await app
    .startAllMicroservices()
    .then(() => console.log('Microservices started'))
    .catch((e) => {
      console.log('Microservice starting error: ', e)
    })

  app.enableShutdownHooks()
  await app.listen(+configService.get('SERVICE_PORT'))
  console.log(`Application is running on: ${await app.getUrl()}`)
}
bootstrap()
