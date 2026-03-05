import { Controller, Get, Param, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UseAuth } from 'src/guards/authGuard/authGuard';
import { TraspasosService } from './traspasos.service';
@ApiBearerAuth()  
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@ApiTags('Traspaso')
@UseAuth()   
@Controller('Traspaso')
export class TraspasosController {
    constructor(private readonly traspasosService:TraspasosService){}

      @ApiOperation({ summary: 'Obtener lista de traspasos' })
      @Get('ObtenerListaDeTraspasos') 
      obtenerMovimientoByTraspaso(
       
      ){

        return this.traspasosService.obtenerMovimientoByTraspaso(
  
        )
      }
@ApiOperation({ summary: 'Obtener todas los traspasos por bodega' })
@ApiQuery({ name: 'ESTATUSFILTER', required: false })
@Get(':CVEBOD')
ObtenerGeneralTraspasoMov(
  @Param('CVEBOD') CVEBOD: number,
  @Query('ESTATUSFILTER') ESTATUSFILTER?: string,
  @Query('page') page?: number,
  @Query('limit') limit?: number,
) {
  return this.traspasosService.ObtenerGeneralTraspasoMov(
    Number(CVEBOD),
    ESTATUSFILTER ?? '',
    Number(page) || 1,
    Number(limit) || 30,
  );
}
   @ApiOperation({ summary: 'Obtener detalle por traspaso' })
@ApiQuery({ name: 'SERMOV', required: false })
@Get(':CVEBOD/:CVEMOV/:FOLMOV')
ObteneDetalleTraspasoMov(
  @Param('CVEBOD') CVEBOD: number,
  @Param('CVEMOV') CVEMOV: number,
  @Param('FOLMOV') FOLMOV: number,
  @Query('SERMOV') SERMOV?: string,
) {
  return this.traspasosService.ObteneDetalleTraspasoMov(
    Number(CVEBOD),
    Number(CVEMOV),
    Number(FOLMOV),
    SERMOV ?? '',
  );
}

        }


  

            
      
    

