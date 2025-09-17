import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env.config';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DamDoh API Documentation',
      version: '1.0.0',
      description: 'API documentation for DamDoh backend services',
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
      contact: {
        name: 'DamDoh Support',
        url: 'https://damdoh.com/support',
        email: 'support@damdoh.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Development server',
      },
      {
        url: 'https://api.damdoh.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['error', 'fail'],
            },
            message: {
              type: 'string',
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
            },
            password: {
              type: 'string',
              format: 'password',
            },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'name'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
            },
            password: {
              type: 'string',
              format: 'password',
            },
            name: {
              type: 'string',
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
            },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                name: { type: 'string' },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'Auth',
        description: 'Authentication endpoints',
      },
      {
        name: 'Users',
        description: 'User management endpoints',
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to the API route files
};

export const swaggerSpec = swaggerJsdoc(options);