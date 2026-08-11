import { HttpService } from "@nestjs/axios";
import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, SetMetadata, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { InjectRepository } from "@nestjs/typeorm";
import { lastValueFrom } from "rxjs";
import { JwtServiceCustom } from "src/globalServices/jwt-service/jwt-service-custom";
import { payLoadToken, resJsonType } from "src/types/types";
import { resJsonClass } from "src/utils/resJsonClass";
import { DataSource, EntityManager, Repository } from "typeorm"; 

interface permisosBody { 
    GrupoPermisoId: number,  
    CveAplicacion: number,
    CveModulo: number, 
    CveSubmodulo: number,  
    CveAccion: number
} 

interface tienePermiso { 
    tienePermiso: boolean
}  

interface returnTienePermiso { 
    tienePermiso: boolean;  
    mensaje: string; 
}; 

// Creando decorador que almacena los permisos, cabe mencionar que este decorador simple es un decorador de metodo  
// No es necesario hacer que este decorador tambien se pueda usar en una clase, ya que esta pensando para usarse de manera granular en cada uno de los metodos
export const UsePermisosGuarLlave = (CveAplicacion: number, CveModulo: number, CveSubmodulo: number, CveAccion: number) => (  
    // Insertamos la metadata a traves del decorador
    SetMetadata('permissions', { CveAplicacion, CveModulo, CveSubmodulo, CveAccion }) 
);

@Injectable()
export class PermisosGuard implements CanActivate{

    constructor( 
        private reflector: Reflector,  
        private JwtServiceCustom: JwtServiceCustom,  
        private httpService: HttpService,
        private readonly dataSource: DataSource,
            private readonly manager: EntityManager,
        @InjectRepository(Repository) private Repository: Repository<any> 
    ){}

    private ApiJson = new resJsonClass(); 
    
async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
        const requiredPermissions = this.reflector.get<{
            CveAplicacion: number;
            CveModulo: number;
            CveSubmodulo: number;
            CveAccion: number;
  
        }>(
            'permissions',
            context.getHandler(),
        );

        if (!requiredPermissions) {
            return true;
        }

        const {
            CveAplicacion,
            CveModulo,
            CveSubmodulo,
            CveAccion
        } = requiredPermissions;

        const request = context.switchToHttp().getRequest();

   const refLlave = request.headers['x-ref-llave'];

        const payloadToken =
            this.JwtServiceCustom.payloadToken as payLoadToken;

        const { GrupoPermisoId } = payloadToken;

        const permiso = {
            GrupoPermisoId,
            CveAplicacion,
            CveModulo,
            CveSubmodulo,
            CveAccion
        };

        const resTienePermiso =
            await this.validarPermiso(permiso) as returnTienePermiso;

        if (!resTienePermiso.tienePermiso) {

            if (!refLlave || refLlave.trim() === '') {
                this.ApiJson.customeHttpExeption(
                    'Se requiere una llave de autorización.',
                    HttpStatus.UNAUTHORIZED,
                );

                // Si customeHttpExeption NO hace throw:
                return false;
            }

            const query = `
                EXEC [dbo].[SP_GV_DarBajaLlaveAcceso]
                    @FolMov = @0,
                    @SerMov = @1,
                    @FolPag = @2
            `;

            const res: any[] = await this.manager.query(query, [
                refLlave
            ]);

            if (!res?.[0] || res[0].error) {
                this.ApiJson.customeHttpExeption(
                    res?.[0]?.mensaje || 'Llave no se dio de baja',
                    res?.[0]?.estatus || HttpStatus.INTERNAL_SERVER_ERROR
                );

                return false;
            }

            // Si la llave fue procesada correctamente,
            // permitimos continuar con el endpoint.
            return true;
        }

        // Ya tiene el permiso
        return true;

    } catch (err) {

        if (err instanceof HttpException) {
            throw err;
        }

        throw new UnauthorizedException();
    }
}  

    async validarPermiso(permisos: permisosBody) : Promise<returnTienePermiso | undefined> {   

        try {  

            const resAxios = await lastValueFrom(
                this.httpService.post(`${process.env.API_SEGURIDIN_PATH}/auth/validar/permiso`, permisos),
            );

            // extraemos la informacion del body de axios
            const { data } : { data : resJsonType } = resAxios;    

            let extractData: tienePermiso  = data.data as tienePermiso; 

            return { 
                tienePermiso: extractData.tienePermiso, 
                mensaje : data.message
            }; 

        }catch(err){  

            this.ApiJson.customeHttpExeption('Error al validar los permisos desde el SSO verifiqué la conexión', HttpStatus.INTERNAL_SERVER_ERROR)

        }
    }; 




}; 