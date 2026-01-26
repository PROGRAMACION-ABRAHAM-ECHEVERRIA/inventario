import { HttpService } from "@nestjs/axios";
import { HttpStatus, Injectable } from "@nestjs/common";
import { AxiosResponse } from "axios";
import { lastValueFrom } from "rxjs";
import { resJsonType } from "src/types/resJson";
import { resJsonClass } from "src/utils/resJsonClass";
// Servicio que ejecutara funciones para generar y validar los tokens de jwt
@Injectable() 
export class AxiosService {  
        public ApiJson = new resJsonClass();  

    constructor(private httpService: HttpService ){} 

    async get(path:string, Token? : string): Promise<resJsonType | undefined> {
        try {
            const resAxios = await lastValueFrom(this.httpService.get(`${process.env.API_SEGURIDIN_PATH}/${path}`, {
                  headers: {
                    Authorization: `Bearer ${Token}`, 
    },
            }))
                  //const {data}: {data: resJsonType} = resAxios;   
                  const res: AxiosResponse = resAxios as unknown as AxiosResponse;
                  //console.log('exitoso')
                  //console.log(res, 'axios')
                  return res.data as resJsonType;
        } catch (err) {
            console.log(err, 'error 1')
              this.ApiJson.customeHttpExeption('Error al hacer la petición', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
    
};
