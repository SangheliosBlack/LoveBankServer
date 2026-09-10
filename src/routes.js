const buildPath = (apiVersion, routePath) => `${apiVersion}${routePath}`;

const apiVersion = `/api/${process.env.API_VERSION || 'v1'}`;

export default {
  auth:          buildPath(apiVersion,'/auth'),
  users:         buildPath(apiVersion,'/user'),
  sms:           buildPath(apiVersion,'/sms'),
  notifications: buildPath(apiVersion,'/notifications'),
  love:          buildPath(apiVersion,'/loveCatalog'),
  transactions:  buildPath(apiVersion,'/transactions')
  
};