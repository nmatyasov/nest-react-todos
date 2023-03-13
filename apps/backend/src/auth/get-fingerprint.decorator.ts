import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import RequestWithUser from './requestWithUser.interface';
import { createHash } from 'node:crypto';

/**
 * Источник вдохновения
 * https://g-booking.medium.com/jwt-fingerprint-tokens-af56215bb19a
 * Create a 32 byte MD-5 hex checksum (any checksum) of your fingerprint
 */
export const GetFingerprintBrowser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: RequestWithUser = ctx.switchToHttp().getRequest();

    /**Шаблон формирования строки fingerprint
     * ip.no : sec-ch-ua : user-agent : accept-language : upgrade-insecure-req
     * ip address не использую
     */
    const ipno = 'localhost'; /**but  request.headers["host"]*/
    const secchua = request.headers['sec-ch-ua'];
    const useragent = request.headers['user-agent'];
    const acceptlanguage = request.headers['accept-language'];
    const upgradeinsecurereq = request.headers['upgrade-insecure-requests'];
    const info = `${ipno}:${secchua}:${useragent}:${acceptlanguage}:${upgradeinsecurereq}`;

    return createHash('md5').update(info).digest('hex');
  }
);
