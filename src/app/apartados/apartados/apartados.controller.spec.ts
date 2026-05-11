import { Test, TestingModule } from '@nestjs/testing';
import { ApartadosController } from './apartados.controller';

describe('ApartadosController', () => {
  let controller: ApartadosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApartadosController],
    }).compile();

    controller = module.get<ApartadosController>(ApartadosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
