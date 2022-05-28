import { Controller, UseGuards } from '@nestjs/common';
import { Body, Post } from '@nestjs/common';
import { LoginDTO } from '../commom/definitions/commonDtos';
import { AdminService } from './admin.service';
import { CreateAdminDTO } from './definitions/AdminDefinitions';
import { AdminJwtGuard } from './guards/adminJwt.guard';
import { CanEditAdminGuard } from './guards/canEditAdmins.guard';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @UseGuards(AdminJwtGuard, CanEditAdminGuard)
  @Post('register')
  async RegisterAdmin(@Body() data: CreateAdminDTO) {
    return await this.adminService.RegisterAdmin(data);
  }

  @Post('login')
  async LoginAdmin(@Body() data: LoginDTO) {
    return await this.adminService.LoginAdmin(data);
  }
}
