import { applyDecorators } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { SignupDto } from '../dto/signup.dto';
import { SignupResponseDto } from '../dto/signup-response.dto';

/**
 * Swagger documentation for Auth Controller
 */
export const AuthSwaggerDecorators = {
  Controller: () =>
    applyDecorators(
      ApiTags('Authentication'),
    ),

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
            statusCode: {
              type: 'number',
              example: 400,
            },
            message: {
              type: 'array',
              items: {
                type: 'string',
              },
              example: [
                'Username is required',
                'Email must be valid',
                'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character',
              ],
            },
            error: {
              type: 'string',
              example: 'Bad Request',
            },
          },
        },
      }),
      ApiConflictResponse({
        description: 'User already exists (email or username conflict)',
        schema: {
          type: 'object',
          properties: {
            statusCode: {
              type: 'number',
              example: 409,
            },
            message: {
              type: 'string',
              example: 'User with this email or username already exists',
            },
            error: {
              type: 'string',
              example: 'Conflict',
            },
          },
        },
      }),
      ApiInternalServerErrorResponse({
        description: 'Internal server error',
        schema: {
          type: 'object',
          properties: {
            statusCode: {
              type: 'number',
              example: 500,
            },
            message: {
              type: 'string',
              example: 'Internal server error',
            },
            error: {
              type: 'string',
              example: 'Internal Server Error',
            },
          },
        },
      }),
    ),
};