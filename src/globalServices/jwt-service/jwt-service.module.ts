import { Global, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtServiceCustom } from './jwt-service-custom';

// generamos un modulo global para exportar un servicio y que este este disponible en toda la aplicacion
@Global()
@Module({ 
    providers: [JwtService, JwtServiceCustom],
    exports: [JwtServiceCustom]
})
export class JwtServiceModule {}