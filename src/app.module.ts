import { Module, RequestTimeoutException } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm'; 
import { AuthGuardModule } from './guards/authGuard/authGuard.module';
import { JwtServiceModule } from './globalServices/jwt-service/jwt-service.module';
import { EntradasModule } from './app/entradas/entradas.module';
import { SalidasModule } from './app/salidas/salidas.module';
import { ComprasModule } from './app/compras/compras.module';
import { TraspasosModule } from './app/traspasos/traspasos.module';
import { AuthGuardWebsocketModule } from './guards/authGuard/authGuardWebsocket.module';
import { ApartadosModule } from './app/apartados/apartados.module';
import { TicketModule } from './globalServices/ticket-service/ticket-service.module';

// se necesita para poder llamar las variables de entorno
require('dotenv').config();

@Module({
  imports: [ 
    TypeOrmModule.forRoot({
    type: 'mssql',
    host: process.env.DB_HOST, // o la dirección IP de tu servidor SQL
    port: 1433, // el puerto por defecto de SQL Server
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: false, // Esto crea automáticamente las tablas basadas en tus entidades
    options: {
      encrypt: false, // Desactiva el cifrado SSL/TLS
      trustServerCertificate: true, // Confía en el certificado del servidor
   }, 
   extra: { 
      RequestTimeoutException: 600000000
    }
  }),   
  JwtServiceModule, 
  AuthGuardModule, 
  AuthGuardWebsocketModule,
  EntradasModule,
  SalidasModule, 
  ComprasModule,
  TraspasosModule, 
  ApartadosModule,
  TicketModule
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
