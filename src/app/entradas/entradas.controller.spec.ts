import { Test, TestingModule } from '@nestjs/testing';
import { EntradasController } from './entradas.controller';
import { EntradasService } from './entradas.service';

describe('EntradasController', () => {
  let controller: EntradasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EntradasController],
      providers: [EntradasService],
    }).compile();

    controller = module.get<EntradasController>(EntradasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
