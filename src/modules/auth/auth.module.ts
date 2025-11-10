import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { OtpController } from './controllers/otp.controller';
import { LoginController } from './controllers/login.controller';
import { OtpService } from './services/otp.service';
import { LoginService } from './services/login.service';
import { TokenService } from './services/token.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [OtpController, LoginController],
  providers: [OtpService, LoginService, TokenService, JwtStrategy],
  exports: [JwtStrategy], // чтобы guards можно было использовать в других модулях
})
export class AuthModule {}
