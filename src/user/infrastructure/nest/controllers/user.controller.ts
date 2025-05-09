import { Body, Controller, Get, HttpCode, Inject, Param, Post } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { IUserService } from "../../../domain/services/user.interface.service";
import SymbolsUser from "../../../symbols-user";
import { CreateUserDTO } from "../dtos/user.dto";

@ApiTags('user')
@Controller('user')
export class UserController {
    constructor(
        @Inject(SymbolsUser.IUserService)
        private readonly userService: IUserService
    ) { }

    @Post('register')
    @HttpCode(201)
    @ApiResponse({ status: 201, description: 'User created' })
    @ApiResponse({ status: 400, description: `User shouldn't be created` })
    @ApiBody({ type: CreateUserDTO, description: 'Data to create a User' })
    async create(@Body() body: CreateUserDTO) {
        return this.userService.create(body);
    }

    @Get()
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'Return all Users' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async findAll() {
        return this.userService.findAll();
    }

    @Get(':id')
    @HttpCode(200)
    @ApiResponse({ status: 200, description: 'Return User by id' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async findById(@Param('id') id: string) {
        return this.userService.findById(id);
    }
}
