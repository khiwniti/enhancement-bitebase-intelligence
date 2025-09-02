const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'enhancement-bitebase-intelligence',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

const createUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateUser', inputVars);
}
createUserRef.operationName = 'CreateUser';
exports.createUserRef = createUserRef;

exports.createUser = function createUser(dcOrVars, vars) {
  return executeMutation(createUserRef(dcOrVars, vars));
};

const updateUserProfileRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateUserProfile', inputVars);
}
updateUserProfileRef.operationName = 'UpdateUserProfile';
exports.updateUserProfileRef = updateUserProfileRef;

exports.updateUserProfile = function updateUserProfile(dcOrVars, vars) {
  return executeMutation(updateUserProfileRef(dcOrVars, vars));
};

const createRestaurantRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateRestaurant', inputVars);
}
createRestaurantRef.operationName = 'CreateRestaurant';
exports.createRestaurantRef = createRestaurantRef;

exports.createRestaurant = function createRestaurant(dcOrVars, vars) {
  return executeMutation(createRestaurantRef(dcOrVars, vars));
};

const addRestaurantReviewRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AddRestaurantReview', inputVars);
}
addRestaurantReviewRef.operationName = 'AddRestaurantReview';
exports.addRestaurantReviewRef = addRestaurantReviewRef;

exports.addRestaurantReview = function addRestaurantReview(dcOrVars, vars) {
  return executeMutation(addRestaurantReviewRef(dcOrVars, vars));
};

const updateRestaurantReviewRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateRestaurantReview', inputVars);
}
updateRestaurantReviewRef.operationName = 'UpdateRestaurantReview';
exports.updateRestaurantReviewRef = updateRestaurantReviewRef;

exports.updateRestaurantReview = function updateRestaurantReview(dcOrVars, vars) {
  return executeMutation(updateRestaurantReviewRef(dcOrVars, vars));
};

const deleteRestaurantReviewRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteRestaurantReview', inputVars);
}
deleteRestaurantReviewRef.operationName = 'DeleteRestaurantReview';
exports.deleteRestaurantReviewRef = deleteRestaurantReviewRef;

exports.deleteRestaurantReview = function deleteRestaurantReview(dcOrVars, vars) {
  return executeMutation(deleteRestaurantReviewRef(dcOrVars, vars));
};

const createMarketReportRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateMarketReport', inputVars);
}
createMarketReportRef.operationName = 'CreateMarketReport';
exports.createMarketReportRef = createMarketReportRef;

exports.createMarketReport = function createMarketReport(dcOrVars, vars) {
  return executeMutation(createMarketReportRef(dcOrVars, vars));
};

const updateMarketReportRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateMarketReport', inputVars);
}
updateMarketReportRef.operationName = 'UpdateMarketReport';
exports.updateMarketReportRef = updateMarketReportRef;

exports.updateMarketReport = function updateMarketReport(dcOrVars, vars) {
  return executeMutation(updateMarketReportRef(dcOrVars, vars));
};

const deleteMarketReportRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteMarketReport', inputVars);
}
deleteMarketReportRef.operationName = 'DeleteMarketReport';
exports.deleteMarketReportRef = deleteMarketReportRef;

exports.deleteMarketReport = function deleteMarketReport(dcOrVars, vars) {
  return executeMutation(deleteMarketReportRef(dcOrVars, vars));
};

const listRestaurantsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListRestaurants', inputVars);
}
listRestaurantsRef.operationName = 'ListRestaurants';
exports.listRestaurantsRef = listRestaurantsRef;

exports.listRestaurants = function listRestaurants(dcOrVars, vars) {
  return executeQuery(listRestaurantsRef(dcOrVars, vars));
};

const searchRestaurantsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'SearchRestaurants', inputVars);
}
searchRestaurantsRef.operationName = 'SearchRestaurants';
exports.searchRestaurantsRef = searchRestaurantsRef;

exports.searchRestaurants = function searchRestaurants(dcOrVars, vars) {
  return executeQuery(searchRestaurantsRef(dcOrVars, vars));
};

const getRestaurantByIdRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetRestaurantById', inputVars);
}
getRestaurantByIdRef.operationName = 'GetRestaurantById';
exports.getRestaurantByIdRef = getRestaurantByIdRef;

exports.getRestaurantById = function getRestaurantById(dcOrVars, vars) {
  return executeQuery(getRestaurantByIdRef(dcOrVars, vars));
};

const getUserProfileRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserProfile');
}
getUserProfileRef.operationName = 'GetUserProfile';
exports.getUserProfileRef = getUserProfileRef;

exports.getUserProfile = function getUserProfile(dc) {
  return executeQuery(getUserProfileRef(dc));
};

const getUserMarketReportsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserMarketReports', inputVars);
}
getUserMarketReportsRef.operationName = 'GetUserMarketReports';
exports.getUserMarketReportsRef = getUserMarketReportsRef;

exports.getUserMarketReports = function getUserMarketReports(dcOrVars, vars) {
  return executeQuery(getUserMarketReportsRef(dcOrVars, vars));
};

const getMarketReportByIdRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMarketReportById', inputVars);
}
getMarketReportByIdRef.operationName = 'GetMarketReportById';
exports.getMarketReportByIdRef = getMarketReportByIdRef;

exports.getMarketReportById = function getMarketReportById(dcOrVars, vars) {
  return executeQuery(getMarketReportByIdRef(dcOrVars, vars));
};

const getLocationAnalysisByIdRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetLocationAnalysisById', inputVars);
}
getLocationAnalysisByIdRef.operationName = 'GetLocationAnalysisById';
exports.getLocationAnalysisByIdRef = getLocationAnalysisByIdRef;

exports.getLocationAnalysisById = function getLocationAnalysisById(dcOrVars, vars) {
  return executeQuery(getLocationAnalysisByIdRef(dcOrVars, vars));
};

const getNearbyRestaurantsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetNearbyRestaurants', inputVars);
}
getNearbyRestaurantsRef.operationName = 'GetNearbyRestaurants';
exports.getNearbyRestaurantsRef = getNearbyRestaurantsRef;

exports.getNearbyRestaurants = function getNearbyRestaurants(dcOrVars, vars) {
  return executeQuery(getNearbyRestaurantsRef(dcOrVars, vars));
};
