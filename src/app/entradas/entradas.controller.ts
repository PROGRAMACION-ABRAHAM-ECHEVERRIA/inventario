import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe } from '@nestjs/common';
import { EntradasService } from './entradas.service';
import { CreateEntradaDto } from './dto/create-entrada.dto';
import { UpdateEntradaDto } from './dto/update-entrada.dto';
import { UseAuth } from 'src/guards/authGuard/authGuard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

 @ApiBearerAuth() 
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@ApiTags('Catalogo de bodega temporal')
@UseAuth()  
@Controller('entradas')
export class EntradasController {
  constructor(private readonly entradasService: EntradasService) {}

  @Post()
  @ApiOperation({summary: 'Endpoint Para hacer una entrada'})
  create(@Body() createEntradaDto: CreateEntradaDto) {
    return this.entradasService.crearEntrada(createEntradaDto);

  }





}
