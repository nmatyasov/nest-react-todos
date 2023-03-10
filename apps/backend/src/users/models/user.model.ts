import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { IUser } from '@libs/user.interface';
import { genSalt, hash} from 'bcrypt'

@Schema({ collection: 'users', timestamps: true })
export class UserModel extends Document implements IUser {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, unique: true,  })
  email: string;

  @Prop({ default: false })
  isActivated: boolean;

  @Prop()
  activationLink: string;

  @Prop()
  refreshToken: string;

}

export const UserSchema = SchemaFactory.createForClass(UserModel);
//https://codesti.com/issue/Automattic/mongoose/12558
// eslint-disable-next-line @typescript-eslint/no-explicit-any
UserSchema.pre('save', async function (next: any) {
  const user = this as UserModel;

  if (this.isModified('password') || this.isNew) {
    const salt = await genSalt(10);
    user.password = await hash(user.password, salt);
  }
  next();
});
