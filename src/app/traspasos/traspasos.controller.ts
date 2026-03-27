import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UseAuth } from 'src/guards/authGuard/authGuard';
import { TraspasosService } from './traspasos.service';
import { CreateTraspasoDto } from './dto/create-traspaso.dto';
import { AceptarTraspaso } from './dto/aceptar-traspaso.dto';
import { RechazarTraspaso } from './dto/rechazar-traspaso.dto';
import { CancelarTraspasoDTO } from './dto/cancelar-traspaso.dto';

@ApiBearerAuth()
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@ApiTags('Traspaso')
@UseAuth()
@Controller('Traspaso')
export class TraspasosController {
  constructor(private readonly traspasosService: TraspasosService) { }

  @ApiOperation({ summary: 'Enpoint para crear un traspaso' })
  @Post('crear-traspaso')
  createTraspaso(@Body() createTraspasoDto: CreateTraspasoDto) {
    return this.traspasosService.createMovimientoTraspaso(createTraspasoDto);
  }
  @ApiOperation({ summary: 'Obtener lista de traspasos' })
  @Get('ObtenerListaDeTraspasos')
  obtenerMovimientoByTraspaso(

  ) {

    return this.traspasosService.obtenerMovimientoByTraspaso(

    )
  }

  @Post('aceptar-traspaso')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Aceptar traspaso',
    description: 'Acepta un movimiento de traspaso entre bodegas ejecutando el SP_GV_AceptarTraspaso',
  })
  @ApiBody({
    type: AceptarTraspaso,
    description: 'Datos del movimiento de traspaso a aceptar',
  })
@ApiResponse({
  status: 200,
  description: 'Traspaso aceptado Exitosamente',
})
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos en la solicitud',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor',
  })
  async AceptarTraspaso(
    @Body() aceptarTraspaso: AceptarTraspaso
  ) {

    return await this.traspasosService.aceptarMovimientoTraspaso(aceptarTraspaso);

  }

  @Post('rechazar-traspaso')
  @ApiOperation({
    summary: 'Rechazar Traspaso',
    description: 'Reachazar traspaso unicamente aplica en bodega destino',
  })
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    type: RechazarTraspaso,
    description: 'Datos necesarios para rechazar el traspaso',
  })
  @ApiResponse({
    status: 200,
    description: 'Traspaso rechazado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Error en los datos enviados',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor',
  })
  async rechazarTraspaso(
    @Body() rechazarTraspaso: RechazarTraspaso
  ) {

    return await this.traspasosService.rechazarTraspaso(rechazarTraspaso);

  }

  @Post('cancelar-traspaso')
  @ApiOperation({
    summary: 'Cancelar Traspaso',
    description: 'Cancelar traspaso unicamente aplica en bodega Origen',
  })

  @HttpCode(HttpStatus.OK)
  @ApiBody({
    type:CancelarTraspasoDTO,
    description: 'Datos necesarios para Cancelar el traspaso',
  })
  @ApiResponse({
    status: 200,
    description: 'Traspaso cancelado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Error en los datos enviados',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor',
  })

  async cancelarTraspaso(
    @Body() cancelarTraspasoDTO: CancelarTraspasoDTO
  ) {

    return await this.traspasosService.cancelarTraspasoMovimiento(cancelarTraspasoDTO);

  }


  @ApiOperation({ summary: 'Obtener todas los traspasos por bodega' })
@ApiQuery({ name: 'ESTATUSFILTER', required: false })
@ApiQuery({ name: 'BUSQUEDA', required: false, description: 'Texto, número o fecha parcial para búsqueda global' })
@Get('General')
ObtenerGeneralTraspasoMov(
  @Query('CVEBOD') CVEBOD: number,
  @Query('ESTATUSFILTER') ESTATUSFILTER?: string,
  @Query('BUSQUEDA') BUSQUEDA?: string,
  @Query('page') page?: number,
  @Query('limit') limit?: number,
) {
  return this.traspasosService.obtenerGeneralTraspasoMov(
    Number(CVEBOD),
    ESTATUSFILTER ?? '',
    BUSQUEDA ?? '',
    Number(page) || 1,
    Number(limit) || 30,
  );
}
  @ApiOperation({ summary: 'Obtener detalle por traspaso' })
  @ApiQuery({ name: 'SERIEORIGEN', required: false })
  @ApiQuery({ name: 'SERIEDESTINO', required: false })
  @Get('Detalle')
  ObteneDetalleTraspasoMov(
    @Query('CVEBOD') CVEBOD: number,
    @Query('CVEBODDES') CVEBODDES: number,
    @Query('CVEMOV') CVEMOV: number,
    @Query('FOLMOV') FOLMOV: number,
    @Query('SERIEORIGEN') SERIEORIGEN?: string,
    @Query('SERIEDESTINO') SERIEDESTINO?: string,
  ) {
    return this.traspasosService.obteneDetalleTraspasoMov(
      Number(CVEBOD),
      Number(CVEBODDES),
      Number(CVEMOV),
      Number(FOLMOV),
      SERIEORIGEN ?? '',
      SERIEDESTINO ?? '',
    );
  }


  /* @ApiOperation({ summary: 'Buscador' })
  @ApiQuery({ name: 'CVEBOD', required: true, type: Number, description: 'Clave de la bodega (obligatorio)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'SEARCH', required: false, type: String })
  @Get('Buscador/BuscarTraspasos')
  buscadorTraspaso(
    @Query('CVEBOD') CVEBOD: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('SEARCH') Search?: string,
  ) {
    const searchValue = Search?.trim() ? Search.trim() : '';

    return this.traspasosService.buscadorTraspaso(
      CVEBOD,
      String(searchValue),
      Number(page) || 1,
      Number(limit) || 25,
    );
  }
 */






}








