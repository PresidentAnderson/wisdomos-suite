import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../apps/api/src/app.module';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';

let app: any;

const createNestApp = async () => {
  if (!app) {
    app = await NestFactory.create(AppModule, {
      logger: false,
    });
    
    // Raw body for webhook signature verification
    app.use('/api/integrations/hubspot/webhook', bodyParser.raw({ type: 'application/json' }));
    
    // JSON body for all other routes
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    
    // Enable CORS for Netlify deployment
    app.use(cors({
      origin: [
        'http://localhost:3000',
        'http://localhost:3011',
        process.env.NEXT_PUBLIC_SITE_URL || 'https://*.netlify.app'
      ],
      credentials: true,
    }));

    // Global validation pipe
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
    }));

    // API prefix
    app.setGlobalPrefix('api');
    
    await app.init();
  }
  
  return app;
};

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  try {
    const nestApp = await createNestApp();
    const adapter = nestApp.getHttpAdapter();
    
    // Convert Netlify event to Express-like request
    const { path, httpMethod, headers, body, multiValueQueryStringParameters } = event;
    
    // Build query string
    let queryString = '';
    if (multiValueQueryStringParameters) {
      const params = new URLSearchParams();
      Object.entries(multiValueQueryStringParameters).forEach(([key, values]) => {
        if (values) {
          values.forEach(value => params.append(key, value));
        }
      });
      queryString = params.toString();
    }
    
    const url = queryString ? `${path}?${queryString}` : path;
    
    // Create mock request/response objects
    const req = {
      method: httpMethod,
      url,
      headers: headers || {},
      body: body ? (httpMethod === 'POST' || httpMethod === 'PUT' || httpMethod === 'PATCH' 
        ? JSON.parse(body) 
        : body) : undefined,
    };
    
    let responseBody = '';
    let statusCode = 200;
    let responseHeaders = {};
    
    const res = {
      status: (code: number) => {
        statusCode = code;
        return res;
      },
      json: (data: any) => {
        responseBody = JSON.stringify(data);
        responseHeaders = { ...responseHeaders, 'Content-Type': 'application/json' };
        return res;
      },
      send: (data: any) => {
        responseBody = typeof data === 'string' ? data : JSON.stringify(data);
        return res;
      },
      setHeader: (name: string, value: string) => {
        responseHeaders = { ...responseHeaders, [name]: value };
        return res;
      },
      end: (data?: any) => {
        if (data) responseBody = data;
        return res;
      }
    };
    
    // Handle the request through NestJS
    await adapter.getRequestHandler()(req, res);
    
    return {
      statusCode,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        ...responseHeaders,
      },
      body: responseBody,
    };
    
  } catch (error) {
    console.error('API Error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      }),
    };
  }
};