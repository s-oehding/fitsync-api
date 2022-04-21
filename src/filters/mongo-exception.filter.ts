import {
  ArgumentsHost,
  Catch,
  HttpAdapterHost,
  ExceptionFilter
} from '@nestjs/common'
import { MongoError } from 'mongoose/node_modules/mongodb'
import { Error } from 'mongoose'

@Catch(MongoError)
export class MongoExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: MongoError, host: ArgumentsHost) {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost

    const ctx = host.switchToHttp()
    let httpStatus = 0
    let message
    switch (exception.code) {
      case 11000:
        httpStatus = 400
        message = exception.message
      default:
        httpStatus = 500
        message = exception.message
    }

    console.log(exception)

    const responseBody = {
      statusCode: httpStatus,
      createdBy: 'MongoExceptionFilter',
      message: message,
      error: exception,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest())
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus)
  }
}

@Catch(Error.ValidationError)
export class MongooseExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: Error.ValidationError, host: ArgumentsHost): any {
    const ctx = host.switchToHttp()
    const { httpAdapter } = this.httpAdapterHost

    httpAdapter.reply(
      ctx.getResponse(),
      {
        statusCode: 400,
        createdBy: 'ValidationErrorFilter',
        timestamp: new Date().toISOString(),
        errors: exception.errors
      },
      400
    )
  }
}
