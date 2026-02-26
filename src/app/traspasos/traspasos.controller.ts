import { Controller, Get, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UseAuth } from 'src/guards/authGuard/authGuard';
import { TraspasosService } from './traspasos.service';
//@ApiBearerAuth()  
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@ApiTags('Traspaso')
//@UseAuth()   
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


            
      

}
