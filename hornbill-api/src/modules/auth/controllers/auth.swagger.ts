import { applyDecorators } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SignupDto } from '../dto/signup.dto';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { SignupResponseDto } from '../dto/signup-response.dto';
import { LoginResponseDto } from '../dto/login-response.dto';
import { RefreshTokenResponseDto } from '../dto/refresh-token-response.dto';

export const AuthSwaggerDecorators = {
  Controller: () => applyDecorators(ApiTags('Authentication')),

  Signup: () =>
    applyDecorators(
      ApiOperation({
        summary: 'User Registration',
        description: 'Register a new user account with email, username, and password',
      }),
      ApiBody({
        type: SignupDto,
        description: 'User registration data',
        examples: {
          example1: {
            summary: 'Valid registration data',
            value: {
              username: 'john_doe',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john.doe@example.com',
              password: 'MySecureP@ssw0rd',
              confirmPassword: 'MySecureP@ssw0rd',
            },
          },
        },
      }),
      ApiResponse({
        status: 201,
        description: 'User successfully registered',
        type: SignupResponseDto,
      }),
      ApiBadRequestResponse({
        description: 'Invalid input data or validation errors',
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'number', example: 400 },
            message: {
              type: 'array',
              items: { type: 'string' },
              example: [
                'Username is required',
                'Email must be valid',
                'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character',
              ],
            },
            error: { type: 'string', example: 'Bad Request' },
          },
        },
      }),
      ApiConflictResponse({
        description: 'User already exists (email or username conflict)',
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'number', example: 409 },
            message: { type: 'string', example: 'Username already exists' },
            error: { type: 'string', example: 'Conflict' },
          },
        },
      }),
      ApiInternalServerErrorResponse({
        description: 'Internal server error',
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'number', example: 500 },
            message: { type: 'string', example: 'Internal server error' },
            error: { type: 'string', example: 'Internal Server Error' },
          },
        },
      }),
    ),

  Login: () =>
    applyDecorators(
      ApiOperation({
        summary: 'User Login',
        description:
          'Authenticate with email and password. Returns JWT access token (15min) and refresh token (7 days).',
      }),
      ApiBody({
        type: LoginDto,
        description: 'User login credentials',
        examples: {
          example1: {
            summary: 'Valid credentials',
            value: {
              email: 'john.doe@example.com',
              password: 'MySecureP@ssw0rd',
            },
          },
        },
      }),
      ApiResponse({
        status: 200,
        description: 'Login successful',
        type: LoginResponseDto,
      }),
      ApiBadRequestResponse({
        description: 'Invalid input data or validation errors',
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'number', example: 400 },
            message: {
              type: 'array',
              items: { type: 'string' },
              example: ['Email must be valid', 'Password is required'],
            },
            error: { type: 'string', example: 'Bad Request' },
          },
        },
      }),
      ApiUnauthorizedResponse({
        description: 'Invalid email or password',
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'number', example: 401 },
            message: { type: 'string', example: 'Invalid credentials' },
            error: { type: 'string', example: 'Unauthorized' },
          },
        },
      }),
      ApiInternalServerErrorResponse({
        description: 'Internal server error',
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'number', example: 500 },
            message: { type: 'string', example: 'Internal server error' },
            error: { type: 'string', example: 'Internal Server Error' },
          },
        },
      }),
    ),

  Refresh: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Refresh Tokens',
        description:
          'Exchange a valid refresh token for a new access token and a rotated refresh token.',
      }),
      ApiBody({
        type: RefreshTokenDto,
        description: 'Current refresh token',
        examples: {
          example1: {
            summary: 'Valid refresh token',
            value: { refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          },
        },
      }),
      ApiResponse({
        status: 200,
        description: 'New access and refresh tokens issued',
        type: RefreshTokenResponseDto,
      }),
      ApiUnauthorizedResponse({
        description: 'Invalid or expired refresh token',
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'number', example: 401 },
            message: { type: 'string', example: 'Invalid or expired refresh token' },
            error: { type: 'string', example: 'Unauthorized' },
          },
        },
      }),
      ApiInternalServerErrorResponse({
        description: 'Internal server error',
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'number', example: 500 },
            message: { type: 'string', example: 'Internal server error' },
            error: { type: 'string', example: 'Internal Server Error' },
          },
        },
      }),
    ),
};
