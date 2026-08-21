import RequestUtil from '../utils/requestUtils.js';
import logger from '../helpers/logger.js';

export function responseHandler(req, res, next) {
    
  res.sendResponse = (data, message = 'OK',statusCode = 200, pagination = null) => {

    const duration_ms = Date.now() - req.startTime;

    let status;

    if (statusCode >= 200 && statusCode < 300) {
      status = 'success';
    } else {
      status = 'error';
    }

    const response = RequestUtil.prepareResponse(
      statusCode,
      message,
      data,
      res.locals.requestId,
      duration_ms,
       pagination && Object.keys(pagination).length > 0
        ? pagination
        : undefined 
    );

    logger.info('Response', {
      requestId: res.locals.requestId,
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: statusCode,
      duration_ms: duration_ms,
      response_data: data,
      message: message,
    });

    res.json(response);
  };

  next();
}