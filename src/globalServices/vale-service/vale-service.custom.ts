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
     const queryVale = `
    EXEC [dbo].[SP_GV_Obtener_vale] 
    @CveBod = @0,
    @CveMov = @1,
    @FolMov = @2,
    @SerMov = @3
  `;

  const [getVale] = await manager.query(queryVale, [
    CveBod,
    CveMov,
    FolMov,
    SerMov,
  ]);

    return {
    vale : getVale,
    reimpresion: isReimp,
  };
    
  }
}