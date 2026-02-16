import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, Query } from '@nestjs/common';
import { EntradasService } from './entradas.service';
import { CreateEntradaDto } from './dto/create-entrada.dto';
import { UpdateEntradaDto } from './dto/update-entrada.dto';
import { UseAuth } from 'src/guards/authGuard/authGuard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

  @ApiBearerAuth()  
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@ApiTags('Entradas')
@UseAuth()   
@Controller('entradas')
export class EntradasController {
  constructor(private readonly entradasService: EntradasService) {}

  @Post()
  @ApiOperation({summary: 'Endpoint Para hacer una entrada'})
  create(@Body() createEntradaDto: CreateEntradaDto) {
    return this.entradasService.crearEntrada(createEntradaDto);

  }


  @Get(':CVEBOD') 
  ObteneTotalProdMov(@Param('CVEBOD') CVEBOD: number,
  @Query('page') page?: number,
  @Query('limit') limit?: number,){
    return this.entradasService.ObteneTotalProdMov(CVEBOD,
    Number(page) || 1,
    Number(limit) || 30,);
  }

    @Get(':CVEBOD/:CVEMOV/:FOLMOV/:SERMOV') 
    ObteneProdByMov(@Param('CVEBOD') CVEBOD:number, @Param('CVEMOV') CVEMOV:number, @Param('FOLMOV') FOLMOV:number, @Param('SERMOV')SERMOV:string){
        return this.entradasService.ObteneProdByMov(CVEBOD,CVEMOV,FOLMOV, SERMOV)
    }



}
