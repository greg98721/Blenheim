import { Test, TestingModule } from '@nestjs/testing';
import { AirRoutesController } from './air-routes.controller';

describe('AirRoutesController', () => {
  let controller: AirRoutesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AirRoutesController],
    }).compile();

    controller = module.get<AirRoutesController>(AirRoutesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
