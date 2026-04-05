import { IsNotEmpty, IsString, IsEmail, IsStrongPassword, Length, Matches} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { IsEqualTo } from "src/common/decorators/is-equal-to.decorator";
import { Transform } from "class-transformer";

export class SignupDto {
    @ApiProperty({
        description: 'Unique username for the account',
        example: 'john_doe',
        minLength: 3,
        maxLength: 30,
        type: String,
    })
    @IsNotEmpty({ message: "Username is required" })
    @IsString({ message: "Username must be a string" })
    @Length(3, 30, { message: "Username must be between 3 and 30 characters" })
    @Matches(/^[a-zA-Z0-9_-]+$/, { message: "Username can only contain letters, numbers, underscores and hyphens"})
    @Transform(({ value }) => value.trim())
    readonly username: string;

    @ApiProperty({
        description: 'User first name',
        example: 'John',
        minLength: 1,
        maxLength: 50,
        type: String,
    })
    @IsNotEmpty({ message: "First name is required" })
    @IsString({ message: "First name must be a string" })
    @Length(1, 50, { message: "First name must be between 1 and 50 characters" })
    @Transform(({ value }) => value.trim())
    readonly firstName: string;

    @ApiProperty({
        description: 'User last name',
        example: 'Doe',
        minLength: 1,
        maxLength: 50,
        type: String,
    })
    @IsNotEmpty({ message: "Last name is required" })
    @IsString({ message: "Last name must be a string" })
    @Length(1, 50, { message: "Last name must be between 1 and 50 characters" })
    @Transform(({ value }) => value.trim())
    readonly lastName: string;

    @ApiProperty({
        description: 'Valid email address for the account',
        example: 'john.doe@example.com',
        format: 'email',
        type: String,
    })
    @IsNotEmpty({ message: "Email is required" })
    @IsEmail({}, { message: "Email must be valid" })
    @Transform(({ value }) => value.trim().toLowerCase())
    readonly email: string;

    @ApiProperty({
        description: 'Strong password (minimum 8 characters, at least one uppercase letter, one lowercase letter, one number and one special character)',
        example: 'MySecureP@ssw0rd',
        minLength: 8,
        maxLength: 128,
        type: String,
        format: 'password',
    })
    @IsNotEmpty({ message: "Password is required" })
    @IsString({ message: "Password must be a string" })
    @Length(8, 128, { message: "Password must be between 8 and 128 characters" })
    @IsStrongPassword({}, { message: "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character" })
    readonly password: string;

    @ApiProperty({
        description: 'Password confirmation (must match the password field)',
        example: 'MySecureP@ssw0rd',
        minLength: 8,
        maxLength: 128,
        type: String,
        format: 'password',
    })
    @IsNotEmpty({ message: "Confirm password is required"})
    @IsEqualTo('password', { message: "Password confirmation must match password" })
    readonly confirmPassword: string;
}