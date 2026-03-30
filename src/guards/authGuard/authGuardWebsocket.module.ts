import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { authGuard } from './authGuard';
import { HttpModule } from '@nestjs/axios';
import { WsAuthGuard } from './authGuardWebsocket';
// generamos un modulo global para las configuraciones del guardian que nos servira para la autenticacion ya que nuestro guardian sera global
@Global()
@Module({  
    imports: [HttpModule],
    providers: [ 
             // con este objeto definimos que el guardian se va ejecutar globalmente en toda la aplicacion
        { 
            provide: APP_GUARD, 
            useClass: WsAuthGuard
        },
        
          
        
    ],  
    // exportamos obligatoriamente el modulo de http, ya que como es un guardian global, todos los modulos o servicios usen este guardian deben tener acceso al servicio httpservice, y para no importar el httpModule en cada uno de los servicios que lo usan, simplemente exportamos el httpModule y este le dara acceso a todos los que usen el guardian, 
    exports: [HttpModule]
})
export class AuthGuardWebsocketModule {}