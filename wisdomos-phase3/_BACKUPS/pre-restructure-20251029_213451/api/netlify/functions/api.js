const { NestFactory } = require('@nestjs/core');
const { ValidationPipe } = require('@nestjs/common');
const { AppModule } = require('../../dist/app.module');

let app;

async function createApp() {
  if (!app) {
    app = await NestFactory.create(AppModule);
    
    // Enable CORS
    app.enableCors({
      origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'https://wisdomos-phoenix.vercel.app'],
      credentials: true,
    });

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
}

exports.handler = async (event, context) => {
  const app = await createApp();
  
  const adapter = app.getHttpAdapter();
  
  return new Promise((resolve, reject) => {
    const req = {
      method: event.httpMethod,
      url: event.path + (event.queryStringParameters ? '?' + new URLSearchParams(event.queryStringParameters).toString() : ''),
      headers: event.headers,
      body: event.body
    };
    
    const res = {
      statusCode: 200,
      headers: {},
      body: '',
      setHeader: function(name, value) {
        this.headers[name] = value;
      },
      end: function(data) {
        this.body = data;
        resolve({
          statusCode: this.statusCode,
          headers: this.headers,
          body: this.body
        });
      }
    };
    
    adapter.reply(res, req.body, res.statusCode || 200);
  });
};