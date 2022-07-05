import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
import { Exclude, Transform, Type } from 'class-transformer'
import { User } from '@/modules/user/interfaces/user.interface'
import { userInfo } from 'os'

export type ActivityDocument = Activity & Document

@Schema()
export class Activity {
  @Prop()
  @Transform(({ value }) => value.toString())
  _id: Types.ObjectId

  @Prop()
  name: string

  @Prop()
  duration: string

  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: User
}

export const ActivitySchema = SchemaFactory.createForClass(Activity)
