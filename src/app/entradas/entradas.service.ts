import { HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateEntradaDto } from './dto/create-entrada.dto';
import { UpdateEntradaDto } from './dto/update-entrada.dto';
import { DataSource } from 'typeorm';
import { JwtServiceCustom } from 'src/globalServices/jwt-service/jwt-service-custom';
import { payLoadToken } from 'src/types/types';
import { resJsonClass } from 'src/utils/resJsonClass';
import { SpResponse } from 'src/types/resJson';
interface response { 
  error: boolean; 
  mensaje: string; 
  estatus: number;  
};  


@Injectable()
export class EntradasService {
  constructor(private readonly  dataSource: DataSource, private readonly jwtServiceCustom: JwtServiceCustom){}
    public ApiJson = new resJsonClass(); 
 async  crearEntrada(createEntradaDto: CreateEntradaDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      // Abrimos la conexiónn y la transacción
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const entityManager = queryRunner.manager;
      const payloadToken:payLoadToken = this.jwtServiceCustom.payloadToken as payLoadToken
      
     //Insertar Movimiento
     const resMovtos: Array<response & {Folmov:number, fecmov:string}>= await entityManager.query(
      `EXEC [dbo].[SP_GV_AgregarMovTosBool2]
          @CVEBOD        = @0, 
          @CveMov        = @1,
          @SerMov        = @2,
          @OrdCom        = @3,
          @NumDoc        = @4,
          @CveProvCli    = @5,
          @DiasCred      = @6,
          @ImpMov        = @7,
          @ImpDes        = @8,
          @PorcDesc      = @9,
          @ImpFle        = @10,
          @ImpSub        = @11,
          @ImpIva        = @12,
          @PorcIva       = @13,
          @ImpTot        = @14,
          @Login         = @15,
          @CveVen        = @16,
          @Observ        = @17,
          @ImpLet        = @18,
          @Facturada     = @19,
          @Cancelada     = @20,
          @Devuelto      = @21,
          @Afectado      = @22,
          @NumDias       = @23,
          @RepEntregada  = @24,
          @Garantia      = @25,
          @UsuarioAlta   = @26,
          @UsuarioId = @27`,
          [
            createEntradaDto.cveBod,
            createEntradaDto.cveMov,
            createEntradaDto.serMov,
           0,
           0,
            createEntradaDto.cveProvCli,
          0,
          0,
          0,
          0,
          0,
            createEntradaDto.movimiento[0].impSub,
          0,
          0,
           createEntradaDto.movimiento[0].impTot,
            createEntradaDto.login,
            0,
             createEntradaDto.movimiento[0].observ,
              createEntradaDto.movimiento[0].impLet,
            0,
            0,
            0,
            0,
            0,
            0,
            '',
             createEntradaDto.usuarioAlta,
             payloadToken.UsuarioId 
          ]
     );
     if(!resMovtos[0] || resMovtos[0].error){
      const mensaje = resMovtos[0].mensaje ||  'Error al crear el movimiento'; 
      const estatus = resMovtos[0]?.estatus || HttpStatus.INTERNAL_SERVER_ERROR
        this.ApiJson.customeHttpExeption(mensaje, estatus); 

     }
           const FolMov = resMovtos[0].Folmov;
      const fecMov = resMovtos[0].fecmov;

     // Insertar Detalle Movimiento
       for(const articulo of createEntradaDto.articulo){
        const [resDetMovtos]:SpResponse = await entityManager.query(
           `EXEC [dbo].[SP_GV_AgregarDetMovTosBool2]
            @CveBod      = @0,
            @FolMov      = @1,
            @CveMov      = @2,
            @SerMov      = @3,
            @CveProd     = @4,
            @Cant        = @5,
            @LisPre      = @6,
            @PorcDesc    = @7,
            @PreUni      = @8,
            @ImpSub      = @9,
            @DesProd     = @10,
            @UsuarioAlta = @11`,
            [
              createEntradaDto.cveBod,
              FolMov,
               createEntradaDto.cveMov,
                createEntradaDto.serMov,
                articulo.cveProd,
                articulo.cant,
                articulo.lisPre,
                articulo.porcentaje,
                articulo.preUni,
                articulo.importeTotal,
                articulo.desProd,
                createEntradaDto.usuarioAlta
            ]
        );
        if(resDetMovtos?.error){
          const mensaje = resDetMovtos.mensaje || 'Error al crear detalle de movimiento'; 
          const estatus = resDetMovtos.estatus || HttpStatus.INTERNAL_SERVER_ERROR;
           this.ApiJson.customeHttpExeption(mensaje, estatus); 
        }
       }
     //Insertar Existe
          for(const articulo of createEntradaDto.articulo){
            const[resExiste]:SpResponse = await entityManager.query(
                         `EXEC [dbo].[SP_GV_AgregarExisteBool2]
            @CVEPROD    = @0,
            @CVEBOD      = @1,
            @EXISTE     = @2,
            @FECINV      = @3,
            @ULTCOS     = @4,
            @COSPRO        = @5,
            @EXIFIS     = @6,
            @UsuarioAlta = @7`,
            [
              articulo.cveProd,
              createEntradaDto.cveBod,
              articulo.cant,
               createEntradaDto.existencias[0].fecInv,
                createEntradaDto.existencias[0].cosPro,
                 createEntradaDto.existencias[0].exiFis,
                 createEntradaDto.usuarioAlta
            ]
            );

             if(resExiste?.error){
          const mensaje = resExiste.mensaje || 'Error al crear detalle de movimiento'; 
          const estatus = resExiste.estatus || HttpStatus.INTERNAL_SERVER_ERROR;
           this.ApiJson.customeHttpExeption(mensaje, estatus); 
        }
          };

          await queryRunner.commitTransaction();
          return this.ApiJson.customeResSuccess('Entrada Creada Exitosamente',{
            FolMov,
            fecMov,
            usuarioAlta: createEntradaDto.usuarioAlta,
            totalArticulos:createEntradaDto.articulo.length,
            totalExistencias:createEntradaDto.existencias.length
          })

  
    } catch (err) {
      //Rollback en caso de error
      if(queryRunner.isTransactionActive){
        await queryRunner.rollbackTransaction();
      }
      if(err instanceof HttpException){
        throw err;
      }

      throw new InternalServerErrorException( 
         `Error ${err['message'] || 'Ocurrió un error interno'}`,
        );
      
    }finally{
      //Siempre liberar el queryRunner
      if(!queryRunner.isReleased){
        await queryRunner.release()
      }
    }
  }


}
