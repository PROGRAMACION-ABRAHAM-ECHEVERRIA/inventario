import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UseAuth } from 'src/guards/authGuard/authGuard';
import { TraspasosService } from './traspasos.service';
import { CreateTraspasoDto } from './dto/create-traspaso.dto';
import { AceptarTraspaso } from './dto/aceptar-traspaso.dto';
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
    summary: 'Aceptar movimiento de traspaso',
    description: 'Acepta un movimiento de traspaso ejecutando el SP_GV_AceptarTraspaso',
  })
  @ApiBody({
    type: AceptarTraspaso,
    description: 'Datos necesarios para aceptar el traspaso',
  })
  @ApiResponse({
    status: 200,
    description: 'Traspaso aceptado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Error en los datos enviados',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor',
  })
  async aceptarMovimientoTraspaso(
    @Body() aceptarTraspaso: AceptarTraspaso,
  ) {
    return this.traspasosService.aceptarMovimientoTraspaso(aceptarTraspaso);
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








