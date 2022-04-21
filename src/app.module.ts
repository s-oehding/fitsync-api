import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { CacheModule, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import * as redisStore from 'cache-manager-redis-store'
import { GraphQLModule } from '@nestjs/graphql'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { HealthModule } from './modules/health/health.module'
import { UserModule } from './modules/user/user.module'
import { AuthModule } from './modules/auth/auth.module'
import { ArticleModule } from './modules/article/article.module'
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        if (
          config.get('NODE_ENV') === 'production' &&
          config.get('EXTERNAL_MONGO_CONNECT_STRING')
        ) {
          return { uri: config.get('EXTERNAL_MONGO_CONNECT_STRING') }
        }
        console.log(config.get('LOCAL_MONGO_CONNECT_STRING'))
        return { uri: config.get('LOCAL_MONGO_CONNECT_STRING') }
      }
    }),
    CacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        store: redisStore,
        auth_pass: config.get('REDIS_PASSWORD'),
        host: config.get('REDIS_HOST_NAME'),
        port: config.get('REDIS_PORT')
      }),
      isGlobal: true
    }),
    // GraphQLModule.forRootAsync({
    //   driver: ApolloDriver,
    //   imports: [ConfigModule],
    //   useFactory: async (config: ConfigService) => ({
    //     // autoSchemaFile: config.get<string>('GRAPHQL_SCHEMA_FILEPATH'),
    //     sortSchema: true,
    //     debug: (config.get<string>('NODE_ENV') !== 'production') as boolean,
    //     uploads: false,
    //     path: '/graphql',
    //     typePaths: ['./**/*.graphql'],
    //     introspection: config.get<boolean>('GRAPHQL_INTROSPECTION', false)
    //   }),
    //   inject: [ConfigService]
    // }),
    HealthModule,
    UserModule,
    AuthModule,
    ArticleModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
