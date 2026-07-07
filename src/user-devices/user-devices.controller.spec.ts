import { Test, TestingModule } from '@nestjs/testing';
import { UserDevicesController } from './user-devices.controller';

describe('UserDevicesController', () => {
  let controller: UserDevicesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserDevicesController],
    }).compile();

    controller = module.get<UserDevicesController>(UserDevicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
