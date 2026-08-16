import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'DevTaskMan API',
      version: '1.0.0',
      description: 'REST API for the DevTaskMan internal task tracking platform (auth, tasks, users, notifications).'
    },
    servers: [
      { url: '/api/v1', description: 'API v1' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['Admin', 'PM', 'DevLeader', 'QALeader', 'Developer', 'QA'] },
            avatarUrl: { type: 'string' }
          }
        },
        Comment: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userName: { type: 'string' },
            role: { type: 'string' },
            text: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },
        HistoryLog: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userName: { type: 'string' },
            action: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },
        Task: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            priority: { type: 'string', enum: ['High', 'Medium', 'Low'] },
            status: { type: 'string', enum: ['Backlog', 'ToDo', 'InProgress', 'ReadyForQA', 'Testing', 'Done'] },
            assigneeId: { type: 'string', nullable: true },
            startDate: { type: 'string' },
            dueDate: { type: 'string' },
            comments: { type: 'array', items: { $ref: '#/components/schemas/Comment' } },
            history: { type: 'array', items: { $ref: '#/components/schemas/HistoryLog' } }
          }
        },
        Notification: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            taskId: { type: 'string' },
            taskTitle: { type: 'string' },
            message: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' },
            type: { type: 'string', enum: ['slack', 'system'] },
            read: { type: 'boolean' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: [path.join(__dirname, '../routes/*.{ts,js}')]
};

export const swaggerSpec = swaggerJSDoc(options);
