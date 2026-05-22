import { Body, Controller, Get, Param, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UseAuth } from 'src/guards/authGuard/authGuard';
import { ApartadosService } from './apartados.service';
import { CreateApartadoDto } from './dto/createApartado.dto';

@ApiBearerAuth()
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@ApiTags('Apartados')
@UseAuth()   
@Controller('Apartados')
export class ApartadosController {

  constructor(private readonly apartadosService: ApartadosService) { }
  @Post()
  @ApiOperation({
    summary: 'Crar un apartado',
    description: 'Crea un apartado',
  })
  @ApiBody({
    type: CreateApartadoDto,
    description: 'Datos del movimiento de apartado',
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
  create(@Body() createApartadoDto: CreateApartadoDto) {
    return this.apartadosService.create(createApartadoDto);

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
  @Get('obtenerDetalleApartado/:FolMov/:SerMov')


  ObteneDetalleApartados(@Param('FolMov') Folmov: number, @Param('SerMov') SerMov: string) {
    console.log(Folmov)
    return this.apartadosService.obtenerApartadoDetalle(Folmov, SerMov)
  }


}
