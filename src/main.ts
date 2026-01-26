import { NestFactory } from '@nestjs/core'; 
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module'; 
import * as cookieParser from 'cookie-parser';

async function bootstrap() { 

  const app = await NestFactory.create(AppModule);   
  
  app.use(cookieParser());
  
  const config = new DocumentBuilder()
  .setTitle('Inventarios')
  .setDescription('Api para llevar el control de las entradas y salidas en SICAVI ')
  .setVersion('1.0')
  .addBearerAuth()
  .addCookieAuth(process.env.COOKIE_KEY_TOKEN)
  .addCookieAuth(process.env.COOKIE_KEY_RTOKEN)
  .build();

  app.enableCors({
    origin: '*', // Reemplaza con el origen permitido o usa un array para múltiples orígenes
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  }); 

     // valida los dtos y si encuentra un erro nos devuelve un error personalizado
     app.useGlobalPipes(new ValidationPipe( { 
      exceptionFactory: (errors) => {
        // Aquí puedes personalizar la respuesta de error
        const errorMessages = errors.map(error => Object.values(error.constraints as object)).join(', ');
        return new BadRequestException({
          status: 400,
          message: `Bad Request (${errorMessages})`,
          error: true, 
          data: [],
        });
      }
     } )); 
     
     const document = SwaggerModule.createDocument(app, config);
     SwaggerModule.setup('', app, document,{
      swaggerOptions: {
        docExpansion: 'none', // Esto oculta los endpoints al inicio
     },
    });

 await app.listen(process.env.PORT ?? 8000);
}
bootstrap();