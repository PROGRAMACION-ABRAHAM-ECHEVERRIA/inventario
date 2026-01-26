import { Injectable } from '@nestjs/common';
import { CreateEntradaDto } from './dto/create-entrada.dto';
import { UpdateEntradaDto } from './dto/update-entrada.dto';

@Injectable()
export class EntradasService {
  create(createEntradaDto: CreateEntradaDto) {
    return 'This action adds a new entrada';
  }

  findAll() {
    return `This action returns all entradas`;
  }

  findOne(id: number) {
    return `This action returns a #${id} entrada`;
  }

  update(id: number, updateEntradaDto: UpdateEntradaDto) {
    return `This action updates a #${id} entrada`;
  }

  remove(id: number) {
    return `This action removes a #${id} entrada`;
  }
}
