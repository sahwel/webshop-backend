import { Body, Controller, Param, Post } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { LoginDTO } from '../commom/definitions/commonDtos';
import { ForgotDTO, ForgotSetDTO } from './definitions/ForgotDefinitions';
import { CreateUserDTO } from './definitions/UserDefinitions';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async RegisterUser(@Body() data: CreateUserDTO) {
    return await this.userService.RegisterUser(data);
  }

  @Post('login')
  async LoginUser(@Body() data: LoginDTO) {
    return await this.userService.LoginUser(data);
  }

  @Post('forgot')
  async CreateForgotPassword(@Body() data: ForgotDTO) {
    return await this.userService.CreateForgotPassword(data);
  }

  @Post('forgot/set/:id')
  async ForgotPassword(@Body() data: ForgotSetDTO, @Param() id: string) {
    return await this.userService.ForgotPassword(data, new ObjectId(id));
  }
}
