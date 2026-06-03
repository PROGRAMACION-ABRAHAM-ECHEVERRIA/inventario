import { Body, Controller, Get, Param, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UseAuth } from 'src/guards/authGuard/authGuard';
import { ApartadosService } from './apartados.service';
import { CreateApartadoDto } from './dto/createApartado.dto';
import { CreatePagoApartadoProgramadoDto } from './dto/pagoApartadoProgramado';


@ApiBearerAuth()
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@ApiTags('Apartados')
@UseAuth()   
@Controller('Apartados')
export class ApartadosController {

  constructor(private readonly apartadosService: ApartadosService) { }
  @Post('CrearApartado')
  @ApiOperation({
    summary: 'Crar un apartado',
    description: 'Crea un apartado',
  })
  @ApiBody({
    type: CreateApartadoDto,
    description: 'Datos del movimiento de apartado',
  })
  create(@Body() createApartadoDto: CreateApartadoDto) {
    return this.apartadosService.create(createApartadoDto);

  }

  

  @Post('realizarPagoProgramado')
  @ApiOperation({
    summary: 'Pago de apartado',
    description: 'Reliza un pago de apartado ',
  })
  @ApiBody({
    type: CreatePagoApartadoProgramadoDto,
    description: 'Datos delpago de apartado',
  })
  createPagoApartadoProgramado(@Body() CreatePagoApartadoProgramadoDto: CreatePagoApartadoProgramadoDto) {
    return this.apartadosService.createPagoApartadoProgramado(CreatePagoApartadoProgramadoDto);

  }





  @ApiOperation({ summary: 'Obtener Lista General de Apartados Pagados' })
  @Get('obtenerApartadosPagados')
  ObteneGeneralApartados(
    @Query('page') page?: number,
    @Query('limit') limit?: number,) {
    return this.apartadosService.obtenerApartadosPagados(
      Number(page) || 1,
      Number(limit) || 30,);
  }



  @ApiOperation({ summary: 'Obtener Lista de Apartados Pendientes' })
  @Get('obtenerApartadosPendientes')
  ObtenerApartadosPendientes(
     @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    return this.apartadosService.obtenerApartadosPendientes(
       Number(page) || 1,
      Number(limit) || 30)
    
  }


  @ApiOperation({ summary: 'Obtener el detalle de un Apartado' })
@ApiQuery({
  name: 'SerMov',
  required: false,
  description: 'Serie del movimiento (opcional)',
})
@Get('obtenerDetalleApartado/:FolMov')
ObteneDetalleApartados(
  @Param('FolMov') Folmov: number,
  @Query('SerMov') SerMov?: string,
) {
  const serieFinal = SerMov?.trim() ? SerMov : '';
  return this.apartadosService.obtenerApartadoDetalle(Folmov, serieFinal);
}

}
