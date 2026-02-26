import { Test, TestingModule } from '@nestjs/testing';
import { TraspasosController } from './traspasos.controller';

describe('TraspasosController', () => {
  let controller: TraspasosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TraspasosController],
    }).compile();

    controller = module.get<TraspasosController>(TraspasosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
