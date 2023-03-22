import { Test, TestingModule } from '@nestjs/testing';
import { RefreshSessionsController } from './refresh-sessions.controller';

describe('RefreshSessionsController', () => {
  let controller: RefreshSessionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RefreshSessionsController],
    }).compile();

    controller = module.get<RefreshSessionsController>(RefreshSessionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
