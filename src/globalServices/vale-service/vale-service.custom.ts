import { Injectable } from "@nestjs/common";
import { EntityManager } from "typeorm";

@Injectable()
export class ValeService{
  async getVale(
     manager: EntityManager,
      CveBod: number,
      FolMov: number,
      CveMov: number,
      SerMov: string,
      isReimp: boolean,
  ){

/*       const queryEncabezado = `
    EXEC SP_GV_Obtener_encabezado_vale_Apartado
    @CveBod = @0,
    @CveMov = @1,
    @FolMov = @2,
    @SerMov = @3
  `;

    const [getEncabezadoTicket] = await manager.query(queryEncabezado, [
    CveBod,
    CveMov,
    FolMov,
    SerMov,
  ]); */
  
     const queryVale = `
    EXEC [dbo].[SP_GV_Obtener_vale_Reimpresion] 
    @CveBod = @0,
    @CveMov = @1,
    @FolMov = @2,
    @SerMov = @3
  `;

  const getVale = await manager.query(queryVale, [
    CveBod,
    CveMov,
    FolMov,
    SerMov,
  ]);

const observaciones = `-Este vale es intransferible, por lo que únicamente el titular podrá hacer uso de él, previa identificación. -Este vale solo es válido para comprar en alguna de nuestras tiendas. -Este vale no podra cambiarse por dinero en efectivo. -Este vale solo podra usarse antes de que haya vencido -Si el articulo a comprar es de mayor precio, unicamente podra pagarse la diferencia en efectivo -En caso de ser un importe menor el articulo a comprar, no se podra reembolsar la diferencia`;

const TotalVales = (getVale ?? []).reduce(
      (total, vale) => total + Number(vale.ValorNota || 0),
      0,
    );

return {
    Vale: (getVale ?? []).map((vale) => ({
      ...vale,
      observaciones,
    })),
     
    reimpresion: isReimp,
        TotalVales,
  };
    
  }
}