import { HttpException, HttpStatus } from "@nestjs/common";
import { resJsonType } from "src/types/resJson";

export class resJsonClass  { 
    private resJson: resJsonType;    
    public readonly statusActivo = 'AC' 
    public readonly statusBaja = 'BA' 
    public readonly statusPendiente = 'PE' 
    public readonly statusIncompleto = 'INC' 
    public readonly statusAceptado = 'ACP'; 

    public readonly estatusError: string  = 'El estatus no existe'
    public readonly estatusCompareError: string = 'Solo puedes ingresar los estatus AC y BA en este recurso'

    // creamos un seter para añadir la respuesta, 
    setresJson(res: resJsonType){ 
         this.resJson = res; 
    } 

    // creamos un getter para obtener la respuesta,
    get getResJson (): resJsonType { 
        return this.resJson
    } 

    // funcion para ingresar la estructura de la respuesta a la variable que lo contendra 
    // en este caso es una respuesta exitosa
    setResSuccess(message: string, data: any[] | object ){ 
        this.resJson = { 
            error: false, 
            status: HttpStatus.OK, 
            message, 
            data,
        }
    }

    // funcion para ingresar la estructura de la respuesta a la variable que lo contendra 
    // en este caso es una respuesta de error
    setResJsonError(message: string, status: number, data?: any[]) { 
        this.resJson = { 
            error: true, 
            status: status, 
            message, 
            data: data? data : []
        }
    } 

    // funcion para crear una httpExeption con la estructura de la respuesta establecida 
    customeHttpExeption(message: string, status: number) {
            this.setResJsonError(message, status); 
            throw new HttpException( this.getResJson, status); 
      } 

    //funcion para crear una httpExeption con la estructura de la respuesta establecida y tambien retornar registros o un json de informacion
    customeHttpExeptionWithData(message: string, status: number, data: any) {
        this.setResJsonError(message, status, data); 
        throw new HttpException( this.getResJson, status); 
    }

    // funcion para crear una respuesta exitosa con la estructura de datos establecida
    customeResSuccess(message: string, data: any[] | object){ 
        this.setResSuccess(message, data); 
        return this.getResJson; 
    }  

    parseToken = (bearertoken: string) =>{   
        if(!bearertoken) return; 
        const [type, token] = bearertoken.split(" ");   
        return type.toLowerCase() === 'bearer' ? token : null; 
    };  

    // funcion para convertir cadenas de string en valores numericos 
    ParseNumerInt = (number: string)=> isNaN(parseInt(number)) ? null : parseInt(number);
}