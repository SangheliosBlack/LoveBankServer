import mongoose from 'mongoose';

import logger from '../helpers/logger.js';
import AppError from '../utils/appError.js';

const dbConnection = async()=>{

    try {
        if (!process.env.DB_ATLAS) {
          throw new Error('DB_ATLAS is not configured');
        }

        await mongoose.connect(process.env.DB_ATLAS, {
          dbName: process.env.DB_NAME || 'lovebank',
          serverSelectionTimeoutMS: 10000,
        });

        logger.info('Database connected');
    } catch (error) {
      logger.error(`Database connection failed: ${error.message}`);
      throw new AppError('Database error - Contact the Admin', 500);
    }
}

export default dbConnection;