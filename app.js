import expressWinston from 'express-winston';
import compression from  'compression';
import path, { dirname } from 'path';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import passport from 'passport';
import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import mongoose from 'mongoose';
import http from 'http';
import fs from 'fs';

import {initializeSocketServer} from './src/sockets/socket.js';
import trim_json_values from './src/utils/trim_json_values.js';
import dbConnection from './src/database/config.js';
import AppError from './src/utils/appError.js';
import loadRoutes from './src/routeLoader.js';
import logger from './src/helpers/logger.js';
import routes from './src/routes.js';
import corsOptions from './src/config/cors_configuration.js';
import { requestLogger } from './src/middlewares/requestLogger.js';
import { responseHandler } from './src/middlewares/responseHandler.js';


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class Server {

    constructor(){
        
        this.app = express();
        this.server = http.createServer(this.app);
        this.port = process.env.PORT || 3000;
        this.apiVersion = `/api/${process.env.API_VERSION || 'v1'}/${process.env.NODE_ENV}`;

        this.io = initializeSocketServer(this.server, corsOptions); 

        this.initStorage();

        this.middlewares();
        this.conectarDB();
        this.routes();

    }

    initStorage() {
      const uploadDir = path.join(process.cwd(), "uploads/invoices");

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log("📁 Upload directory created:", uploadDir);
      }
    }


    async conectarDB(){

        await dbConnection();

    }

    middlewares(){

      this.app.get('/healthz', async (_req, res) => {
        try {
          const dbState = mongoose.connection.readyState;
          res.status(200).json({
            status: 'ok',
            uptime: process.uptime(),
            database: dbState === 1 ? 'connected' : 'disconnected',
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          res.status(500).json({ status: 'error', message: error.message });
        }
      });

      this.app.use(requestLogger);
      this.app.use(responseHandler);
      this.setupStructuredLogging();  // Nuevo logging estructurado
      this.setupLogger();
      this.setupSecurity();
      this.setupCors();

      this.app.use(passport.initialize()); 

      this.app.get('/favicon.ico', (_req, res) => res.status(204).end());
      this.app.use(express.static(path.join(__dirname, 'src', 'public')));
      this.app.use(bodyParser.json(),trim_json_values);
      this.app.use(compression());

      if (process.env.NODE_ENV !== 'p') {
        this.app.use(morgan('dev'));
      }

      this.app.use(
        bodyParser.urlencoded({
          limit: '50mb',
          extended: true,
        })
      );

      import('./src/config/authentication.js');

      this.app.use('/.well-known', express.static(path.join(__dirname, 'src', 'public', '.well-known')));

      this.app.use((req, res, next) => {
        req.requestTime = new Date().toISOString();
        next();
      });

    }

    async routes()  {

      this.app.set("trust proxy",1);
      this.app.set('view engine', 'ejs');
      this.app.set('views', path.join(__dirname, 'src', 'views'));
      
      await loadRoutes(this.app, routes);

      this.app.all('*', (req, res, next) => {
        
        console.log('statusCode before creating AppError:', 404); // O el valor que estés pasando
        
        next(new AppError(404, `The requested URL ${req.originalUrl} was not found on this server. Please check the URL for typos or go back to the homepage.`));

      });
      
    }

    listen(){

        this.server.listen(this.port,() => {

          logger.info(`Server running on port ${this.port} || ${this.apiVersion}`);

        });
        
    }

    setupLogger() {
      this.app.use(
        expressWinston.logger({
          winstonInstance: logger,
          meta: true, // Enviar metadata estructurada
          msg: function (req, res) {
            const clientIp = res.locals.clientIp || req.ip || 'unknown';
            const userAgent = res.locals.userAgent || req.headers['user-agent'] || 'unknown';
            return `${res.statusCode} - ${req.method} - ${req.url} - ${
              res.responseTime
            }ms - IP: ${clientIp} - Device: ${userAgent.substring(0, 50)}`;
          },
          dynamicMeta: function(req, res) {
            return {
              statusCode: res.statusCode,
              clientIp: res.locals.clientIp || req.ip,
              userAgent: res.locals.userAgent || req.headers['user-agent'],
              responseTime: res.responseTime,
              requestId: res.locals.requestId,
            };
          },
        })
      );
    }

    setupStructuredLogging() {
      // Middleware adicional para loguear campos estructurados
      this.app.use((req, res, next) => {
        const startTime = Date.now();
        
        res.on('finish', () => {
          const duration = Date.now() - startTime;
          const clientIp = res.locals.clientIp || req.ip || 'unknown';
          const userAgent = res.locals.userAgent || req.headers['user-agent'] || 'unknown';
          
          // Log estructurado - usando atributos estándar de Datadog
          logger.info('API Request', {
            'http.status_code': res.statusCode,
            'http.method': req.method,
            'http.url': req.originalUrl || req.url,
            'network.client.ip': clientIp,
            'http.useragent': userAgent,
            'duration': duration,
            'request_id': res.locals.requestId,
          });
        });
        
        next();
      });
    }

    setupSecurity() {
    }
    
    setupCors() {

      this.app.use(cors(corsOptions));

    }

}

export default Server;