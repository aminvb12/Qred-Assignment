import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'


export interface JwtPayload {
    sub: string;
    email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'default_secret',
        });
    }

    async validate(payload: JwtPayload) {
        // In a real application, you would validate the user exists in the database
        // For this example, we just return the payload as the user object
        if (!payload.sub || !payload.email) {
            throw new UnauthorizedException('Invalid token payload');
        }
        return { userId: payload.sub, email: payload.email };
    }
}