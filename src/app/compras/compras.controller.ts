import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, Put } from '@nestjs/common';
import { ComprasService } from './compras.service';
import { CreateCompraDto } from './dto/create-compra.dto';
import { UpdateEncabezadoFactura } from './dto/update-compra.dto';
import { UseAuth } from 'src/guards/authGuard/authGuard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()  
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@ApiTags('Compras')
@UseAuth()
@Controller('compras')
export class ComprasController {
  constructor(private readonly comprasService: ComprasService) {}

  @Post()
  create(@Body() createCompraDto: CreateCompraDto) {
    return this.comprasService.create(createCompraDto);
  }; 

  @Get()
  findAll() {
    return this.comprasService.getAllCompras();
  }; 

  @Get('/:CveBod/:FolMov/:CveMov/:SerMov')
  findDetalle(@Param('CveBod') CveBod: string, @Param('FolMov') FolMov: string, @Param('CveMov') CveMov: string, @Param('SerMov') SerMov: string) {
    return this.comprasService.getComprasDetalle(+CveBod, +FolMov, +CveMov, SerMov);
  };   

  @Get('totales/:CveBod/:FolMov/:CveMov/:SerMov')
  findDetalleTotales(@Param('CveBod') CveBod: string, @Param('FolMov') FolMov: string, @Param('CveMov') CveMov: string, @Param('SerMov') SerMov: string) {
    return this.comprasService.getComprasDetalleTotales(+CveBod, +FolMov, +CveMov, SerMov);
  };  


  @Put('/:CveBod/:FolMov/:CveMov/:SerMov')
  updateEncabezadoFactura(@Param('CveBod') CveBod: string, @Param('FolMov') FolMov: string, @Param('CveMov') CveMov: string, @Param('SerMov') SerMov: string, @Body() updateEncabezadoFactura: UpdateEncabezadoFactura  ) {
    return this.comprasService.updateEncabezadoFactura(+CveBod, +FolMov, +CveMov, SerMov, updateEncabezadoFactura );
  }; 


  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.comprasService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateCompraDto: UpdateCompraDto) {
  //   return this.comprasService.update(+id, updateCompraDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.comprasService.remove(+id);
  // }
}
