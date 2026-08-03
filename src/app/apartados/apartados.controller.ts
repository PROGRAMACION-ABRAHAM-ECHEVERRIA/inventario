import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UseAuth } from 'src/guards/authGuard/authGuard';
import { ApartadosService } from './apartados.service';
import { CreateApartadoDto } from './dto/createApartado.dto';
import { CreatePagoApartadoProgramadoDto } from './dto/pagoApartadoProgramado';
import { CancelarApartadoDto } from './dto/cancelacionApartado';
import { CambiotipoPagoApartadoDto } from './dto/cambiarPagoApartado';



@ApiBearerAuth()
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@ApiTags('Apartados')
@UseAuth()   
@Controller('Apartados')
export class ApartadosController {

  constructor(private readonly apartadosService: ApartadosService) { }
  @Post('CrearApartado')
  @ApiOperation({
    summary: 'Crear un apartado, pago apartado inicial 10%',
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


  /* 
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
      
    } */


  @ApiOperation({ summary: 'Obtener el detalle de un Apartado' })
  @ApiQuery({
    name: 'SerMov',
    required: false,
    type: String,
    description: 'Serie del movimiento (opcional)',
  })
  @Get('obtenerDetalleApartado/:FolMov/:Sermov')
  ObteneDetalleApartados(
    @Param('FolMov') Folmov: number,
    @Query('SerMov') SerMov: string = '',
  ) {
    const serieFinal = SerMov?.trim() ? SerMov : '';
    return this.apartadosService.obtenerApartadoDetalle(Folmov, serieFinal);
  }


  @ApiOperation({ summary: 'Obtener apartados vigentes(Pendientes)' })
  @ApiQuery({ name: 'BUSQUEDA', required: false })
  @Get('ObtenerApartadosVigentes')
  ObtenerApartadosVigentes(
    @Query('CVEBOD') CVEBOD: number,
    @Query('BUSQUEDA') BUSQUEDA?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.apartadosService.obtenerApartadosVigentesByBodega(
      Number(CVEBOD),
      BUSQUEDA ?? '',
      Number(page) || 1,
      Number(limit) || 30,
    );
  }

  @ApiOperation({ summary: 'Obtener apartados Pagados' })
  @ApiQuery({ name: 'BUSQUEDA', required: false })
  @Get('ObtenerApartadosPagados')
  ObtenerApartadosPagados(
    @Query('CVEBOD') CVEBOD: number,
    @Query('BUSQUEDA') BUSQUEDA?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.apartadosService.obtenerApartadosPagadosByBodega(
      Number(CVEBOD),
      BUSQUEDA ?? '',
      Number(page) || 1,
      Number(limit) || 30,
    );
  }

  @ApiOperation({ summary: 'Obtener apartados Cancelados' })
  @ApiQuery({ name: 'BUSQUEDA', required: false })
  @Get('ObtenerApartadosCancelados')
  ObtenerApartadosCancelados(
    @Query('CVEBOD') CVEBOD: number,
    @Query('BUSQUEDA') BUSQUEDA?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.apartadosService.obtenerApartadosCanceladosByBodega(
      Number(CVEBOD),
      BUSQUEDA ?? '',
      Number(page) || 1,
      Number(limit) || 30,
    );
  }

  @ApiOperation({ summary: 'Reimpresion ticket' })
  @ApiQuery({
    name: 'SerMov',
    required: false,
    type: String,
    description: 'Serie del movimiento (opcional)',
  })

  @Get('reimpresionTicketPagoApartado/:Folmov/:CveMov/:Folpag/:SerMov')
  ObtenerTicktReImpresion(
   // @Param('CveBodDes', ParseIntPipe) CveBodDes: number,
    @Param('Folmov', ParseIntPipe) Folmov: number,
    @Param('CveMov', ParseIntPipe) CveMov: number,
    @Param('Folpag', ParseIntPipe) FolPag: number,
    @Query('SerMov') SerMov: string = '',
       // @Param('IsPago', ParseIntPipe) IsPago: boolean,
  ) {

    return this.apartadosService.obtenerTicketReimpresionPagoApartado(
      //CveBodDes,
      Folmov,
      CveMov,
      SerMov ?? '',
      FolPag,
      //IsPago
    );
  }



  @ApiOperation({ summary: 'Reimpresion Vale' })
  @ApiQuery({
    name: 'SerMov',
    required: false,
    type: String,
    description: 'Serie del movimiento (opcional)',
  })

  @Get('reimpresionValePagoApartado/:Folmov/:SerMov')
  ObtenerValeReimPresion(
    @Param('Folmov', ParseIntPipe) Folmov: number,
    @Query('SerMov') SerMov: string = '',
  ) {

    return this.apartadosService.obtenerValesReimpresionCancelacionApartado(
      Folmov,
      SerMov ?? ''
    );
  }

   @ApiOperation({ summary: 'Validar Liquidacion Apartado' })
     @ApiQuery({
    name: 'SerMov',
    required: false,
    type: String,
    description: 'Serie del movimiento (opcional)',
  })
    @Get('validarLiquidacionApartado/:SerMov/:FolMov/:NumPago/:ImpPagoProg')
  validarLiquidacionApartado(
    @Param('FolMov', ParseIntPipe) Folmov: number,
    @Query('SerMov') SerMov: string = '',
         @Param('NumPago', ParseIntPipe) NumPago: number,
       @Param('ImpPagoProg', ParseIntPipe) ImpPagoProg: number,
  ) {

    return this.apartadosService.validarLiquidacionApartado(
      SerMov ?? '',
         Folmov,
      NumPago,
      ImpPagoProg

    );
  }


    @Post('CancelarApartado')
  @ApiOperation({
    summary: 'Cancelar un apartado',
    description: 'Cancelar un apartado',
  })
  @ApiBody({
    type: CancelarApartadoDto,
    description: 'Datos del cancelado de apartado',
  })
  cancelar(@Body() cancelarApartadoDto: CancelarApartadoDto) {
    return this.apartadosService.cancelarApartado(cancelarApartadoDto);

  }

      @Put('CambiarTipoPagoApartado')
  @ApiOperation({
    summary: 'Cambiar tipo de pagod de un apartado',
    description: 'Cambiar tipo de pagod de un apartado',
  })
  @ApiBody({
    type: CambiotipoPagoApartadoDto,
    description: 'Datos de cambio de un tipo de pago apartado',
  })
  cambiarTipoPagoApartado(@Body() cambiarTipoPagoApartadoDto: CambiotipoPagoApartadoDto) {
    return this.apartadosService.cambiarTipoPago(cambiarTipoPagoApartadoDto);

  }


    @ApiOperation({ summary: 'Obtener tipo de cancelcion activos' })
  
  @Get('obtenerTipMovCancelacion/AC')
  ObtenerCancelacionAC() {
    return this.apartadosService.obtenerCancelacionApartadoAC();
  }

  @ApiOperation({ summary: 'Obtener tipo de cancelcion inactivos' })
  
  @Get('obtenerTipMovCancelacion/BA')
  ObtenerCancelacionBA() {
    return this.apartadosService.obtenerCancelacionApartadoBA();
  }


    @ApiOperation({ summary: 'Obtener Pago by Folpag' })
    @Get('ObtenerPagoByFolPag/:Folmov/:Folpag/:SerMov')
  ObtenerPago(

    @Param('Folmov', ParseIntPipe) Folmov: number,
    @Param('Folpag', ParseIntPipe) FolPag: number,
    @Query('SerMov') SerMov: string = '',
       // @Param('IsPago', ParseIntPipe) IsPago: boolean,
  ) {

    return this.apartadosService.obtenerPagoByFolPag(
  
      Folmov,
      FolPag,
      SerMov ?? ''
      //IsPago
    );
  }



}
