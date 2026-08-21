import { v4 as uuidv4 } from 'uuid';

function extractClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = forwarded.split(',').map(ip => ip.trim());
    for (const ip of ips) {
      if (!isPrivateIp(ip)) return ip;
    }
    return ips[0];
  }
  
  const realIp = req.headers['x-real-ip'];
  if (realIp && !isPrivateIp(realIp)) return realIp;
  
  const remoteIp = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress;
  
  if (remoteIp === '::1' || remoteIp === '::ffff:127.0.0.1') return '127.0.0.1';
  
  return remoteIp || 'unknown';
}

function isPrivateIp(ip) {
  if (!ip) return true;
  const privateRanges = [
    /^127\./, /^10\./, /^172\.(1[6-9]|2[0-9]|3[0-1])\./, /^192\.168\./,
    /^::1$/, /^::ffff:127\./, /^fc00:/, /^fe80:/,
  ];
  return privateRanges.some(range => range.test(ip));
}

export function requestLogger(req, res, next) {
  const requestId = uuidv4();
  res.locals.requestId = requestId;
  req.startTime = Date.now();
  res.locals.clientIp = extractClientIp(req);
  res.locals.userAgent = req.headers['user-agent'] || 'Unknown';
  next();
}