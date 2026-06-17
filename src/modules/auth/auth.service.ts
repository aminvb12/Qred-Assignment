import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto'


@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
    ) { }

    async register(user: RegisterDto) {
        let existing = await this.userService.findByEmail(user.email);
        if (existing) throw new ConflictException('Email already in use');

        const hashed = await bcrypt.hash(existing.password, 10);
        existing.password = hashed;
        const createdUser = await this.userService.create(existing);
        return this.signToken(createdUser);
    }

    async login(user: LoginDto) {
        const { email, password } = user
        const existingUser = await this.userService.findByEmail(email);
        if (!existingUser) throw new UnauthorizedException('Invalid credentials');

        const match = await bcrypt.compare(existingUser.password, password);
        if (!match) throw new UnauthorizedException('Invalid credentials');

        return this.signToken(existingUser);
    }

    private signToken(user: User) {
        return {
            access_token: this.jwtService.sign({ sub: user.id, email: user.email }),
        };
    }
}
