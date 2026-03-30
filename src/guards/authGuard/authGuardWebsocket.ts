import { applyDecorators, CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, UnauthorizedException, UseGuards } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtServiceCustom } from "src/globalServices/jwt-service/jwt-service-custom";
import { resJsonClass } from "src/utils/resJsonClass"; 
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { resJsonType } from "src/types/resJson";  
import { Request } from "express";
import { Socket } from "socket.io/dist/socket";

interface isLiveToken { 
    isLive: boolean
} 

interface bodyValidMethodTokenIsLive { 
    isLive: boolean, 
    mensaje: string
}

// Para websocket así se define un decorador
export const UseAuthWebsocket = () => {
  return applyDecorators(
    UseGuards(WsAuthGuard),
  );
};

@Injectable()
export class WsAuthGuard implements CanActivate { 

     
    public ApiJson = new resJsonClass(); 
    constructor(  
        private JwtServiceCustom: JwtServiceCustom, 
        private reflector: Reflector,   
        private httpService: HttpService 
        // @InjectRepository(RefreshToken) private refreshTokenRepository: Repository<RefreshToken>
    ){}  

async canActivate(context: ExecutionContext): Promise<boolean> {
     console.log('si funciona')
        try {
            // Verificar si el método o la clase requiere autenticación
            const useAuth = this.reflector.get<boolean>('use_auth_websocket', context.getHandler()) || 
                            this.reflector.get<boolean>('use_auth_websocket', context.getClass()); 
            if (!useAuth) return true;

            // Extraer socket
            const client: Socket = context.switchToWs().getClient<Socket>();
            const token: string = client.handshake.auth?.token;
            if (!token) throw new UnauthorizedException('Token no proporcionado');

        console.log('token', token)
 // obtenemos la peticion 
    //    let request: Request = context.switchToHttp().getRequest(); 

       // let BearerToken: string | null = null  

        // extraemos el bearer token de los headers de la peticion siempre y cuando las cookies funcionen 
        // if(request.cookies[process.env.COOKIE_KEY_TOKEN]){
        //     BearerToken = request.headers.authorization;
        // };  

        //BearerToken = request.headers.authorization as string;  

       // let Token = this.ApiJson.parseToken(BearerToken);  
               // si el token no existe no autorizamos la peticion
               if(!token) this.ApiJson.customeHttpExeption('El token no es valido', HttpStatus.UNAUTHORIZED); 
       
               // verificamos que el token exista en la bd ;  
               // let bdToken = await this.refreshTokenRepository.findOne({where: {Token}});     
               let resTokenIsLive: bodyValidMethodTokenIsLive = await this.validateTokenIslive(token as string) as bodyValidMethodTokenIsLive;   
       
               if(!resTokenIsLive.isLive) { 
                   this.ApiJson.customeHttpExeption(resTokenIsLive.mensaje, HttpStatus.UNAUTHORIZED)
               }; 
       
               // extramos la informacion del token con el servico de jwt
               let payLoad = this.JwtServiceCustom.validateToken(token as string); 
                       
               if(!payLoad) { 
                   this.ApiJson.customeHttpExeption('El token ya no esta activo', HttpStatus.UNAUTHORIZED);  
                   return false; 
               }; 
       
               // guardando el payload del token en una variable del servicio global custom de jwtService 
               // esto nos servira para compartir esta informacion en diferentes guardianes 
               // se actualiza cada ves que se consume una endpoint para ir actualizando dinamicamente el token y de esta manera manejar la concurrencia de los diferentes usuarios que puedan estar consumiendo la misma endpoint 
               // de lo contrario el token quedara estatico y parecera que el mismo usuario esta consumiendo la misma endpoint aunque se haga con usuarios diferentes
               // esto es importante para el guardian de permisos ya que extraemos el grupo de permisos del token
               this.JwtServiceCustom.payloadToken = payLoad;  
       
               return true; 

        } catch(err) {
            if (err instanceof UnauthorizedException) throw err;
            throw new UnauthorizedException('No autorizado');
        }
    } 
    // separamos la logica de esta peticion para tener un manejo de errores de la peticion personalizada a travez del bloque try catch
    async validateTokenIslive(Token: string): Promise<bodyValidMethodTokenIsLive  | undefined> { 
        try { 
     
            const resAxios  = await lastValueFrom(
                this.httpService.post(`${process.env.API_SEGURIDIN_PATH}/refresh-token/token/is/live`, {
                Token, // Token en el cuerpo de la petición
                }),
            );    

            // extraemos la informacion del body de axios
            const {data}: {data: resJsonType} = resAxios;     

            // extraemos el booleando que retorna la endpoint,
            // ya que axios trae su propio body estandarizado, accedemos a la propiedad data, para luego acceder a nuestro body personalizado, por lo cual accedemos dos veces a la misma variable, data.data
            let extractData: isLiveToken  = data.data as isLiveToken; 

            return { 
                isLive: extractData.isLive, 
                mensaje: data.message
            } 

        }catch(err){ 
            // retornamos este error en caso de que la conexion del SSO no exista
            this.ApiJson.customeHttpExeption('Error al validar el token desde el SSO verifiqué la conexión', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}; 