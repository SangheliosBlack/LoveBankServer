const RequestUtil = {
  prepareListResponse(status, data, message) {
    if (data) {
      return {
        status: status,
        message: message,
        doc: { data: data },
      };
    }
  
    return {
      status: status,
      message: message,
      doc: { data: { count: 0, rows: [] } },
    };
  },
  prepareListFromQueryResponse(status, data, message) {
    if (data) {
      return {
        status: status,
        message: message,
        doc: { data: { count: data.length, rows: data } },
      };
    }
  
    return {
      status: status,
      message: message,
      doc: { data: { count: 0, rows: [] } },
    };
  },
  prepareResponse(statusCode, message, data, links) {

    const statusTextMap = {
      200: 'SUCCESS',
      201: 'CREATED',
      204: 'NO_CONTENT',
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      400: 'BAD_REQUEST',
      404: 'NOT_FOUND',
      500: 'ERROR'
    };

    const response = {
      status: statusTextMap[statusCode] || 'UNKNOWN',
      statusCode: statusCode,
      message: message,
      meta: {
        "version": "1.0.0",
        "language": "es"
      },
      timestamp: new Date(),
    };

    if (this.validParam(links)) {
      response.links = links;
    }

    if (this.validParam(data)) {
      response.data = data;
    }

    return response;
  },
  validParam(param) {
    return param !== undefined && param !== null;
  }
}

export default RequestUtil;


  