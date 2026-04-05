import { Controller, Body, Post, HttpCode, HttpStatus} from "@nestjs/common"
import { AuthService } from "../services/auth.service"
import { SignupDto } from "../dto/signup.dto"
import { SignupResponseDto } from "../dto/signup-response.dto"
import { AuthSwaggerDecorators } from "./auth.swagger"

@Controller("auth")
@AuthSwaggerDecorators.Controller()
export class AuthController {

    constructor (
        private readonly authService: AuthService
    ) {}

    @Post("signup")
    @HttpCode(HttpStatus.CREATED)
    @AuthSwaggerDecorators.Signup()
    async signup(@Body() dto: SignupDto): Promise<SignupResponseDto> {
        return await this.authService.signup(dto)        
    }
}