import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt"; 
import { payLoadToken } from "src/types/types"; 
import * as jwt from 'jsonwebtoken';
import { Secret, SignOptions } from 'jsonwebtoken';

// Servicio que ejecutara funciones para generar y validar los tokens de jwt
@Injectable() 
export class JwtServiceCustom {   

    constructor( private jwtService: JwtService ){} 

    private _tokenPayload: object;  

    validateToken(Token: string): payLoadToken | false {
        try {
          let payLoad = this.jwtService.verify(Token, { secret: process.env.SECRET_KEY });
          return payLoad;
        } catch (err) {
          return false;
        }
    }; 

    // generateToken(Usuario: string, UsuarioId: number, GrupoPermisoId: number, timeExpire: string | number): string {
    //   let payLoad = { Usuario, UsuarioId, GrupoPermisoId };
    //   let Token = jwt.sign(payLoad, process.env.SECRET_KEY as string, {
    //     expiresIn: timeExpire as number,
    //   });
    //   return Token;
    // };  

    generateToken(Usuario: string,UsuarioId: number,GrupoPermisoId: number,timeExpire: SignOptions['expiresIn'],): string {
        const payload = { Usuario, UsuarioId, GrupoPermisoId };
        const secret: Secret = process.env.SECRET_KEY as string;
        const options: SignOptions = {
            expiresIn: timeExpire,
        };
        return jwt.sign(payload, secret, options);
    };
    
    // Setter para almacenar la informacion del token esto nos servira para compartir de manera global dicha informacion
    set payloadToken(payLoad: object){ 
      this._tokenPayload = payLoad 
    } 

    // Getter para obtener la informacion del token
    get payloadToken() { 
      return this._tokenPayload
    }
    
};
