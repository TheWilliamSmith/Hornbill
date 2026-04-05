import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, context: ExecutionContext): JwtPayload | string => {
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    return data ? user[data] : user;
  },
);
