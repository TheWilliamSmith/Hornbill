import { Injectable } from "@nestjs/common"
import { SignupDto } from "../dto/signup.dto"

@Injectable()
export class AuthService {
    async signup(dto: SignupDto) {
        return {
            message: "User created",
            data : {
                firstName: dto.firstName,
                lastName: dto.lastName,
                username: dto.username
            }
        }
    }
}