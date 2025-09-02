import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'enhancement-bitebase-intelligence',
  location: 'us-central1'
};

export const createUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateUser', inputVars);
}
createUserRef.operationName = 'CreateUser';

export function createUser(dcOrVars, vars) {
  return executeMutation(createUserRef(dcOrVars, vars));
}

export const updateUserProfileRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateUserProfile', inputVars);
}
updateUserProfileRef.operationName = 'UpdateUserProfile';

export function updateUserProfile(dcOrVars, vars) {
  return executeMutation(updateUserProfileRef(dcOrVars, vars));
}

export const createRestaurantRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateRestaurant', inputVars);
}
createRestaurantRef.operationName = 'CreateRestaurant';

export function createRestaurant(dcOrVars, vars) {
  return executeMutation(createRestaurantRef(dcOrVars, vars));
}

export const addRestaurantReviewRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AddRestaurantReview', inputVars);
}
addRestaurantReviewRef.operationName = 'AddRestaurantReview';

export function addRestaurantReview(dcOrVars, vars) {
  return executeMutation(addRestaurantReviewRef(dcOrVars, vars));
}

export const updateRestaurantReviewRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateRestaurantReview', inputVars);
}
updateRestaurantReviewRef.operationName = 'UpdateRestaurantReview';

export function updateRestaurantReview(dcOrVars, vars) {
  return executeMutation(updateRestaurantReviewRef(dcOrVars, vars));
}

export const deleteRestaurantReviewRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteRestaurantReview', inputVars);
}
deleteRestaurantReviewRef.operationName = 'DeleteRestaurantReview';

export function deleteRestaurantReview(dcOrVars, vars) {
  return executeMutation(deleteRestaurantReviewRef(dcOrVars, vars));
}

export const createMarketReportRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateMarketReport', inputVars);
}
createMarketReportRef.operationName = 'CreateMarketReport';

export function createMarketReport(dcOrVars, vars) {
  return executeMutation(createMarketReportRef(dcOrVars, vars));
}

export const updateMarketReportRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateMarketReport', inputVars);
}
updateMarketReportRef.operationName = 'UpdateMarketReport';

export function updateMarketReport(dcOrVars, vars) {
  return executeMutation(updateMarketReportRef(dcOrVars, vars));
}

export const deleteMarketReportRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteMarketReport', inputVars);
}
deleteMarketReportRef.operationName = 'DeleteMarketReport';

export function deleteMarketReport(dcOrVars, vars) {
  return executeMutation(deleteMarketReportRef(dcOrVars, vars));
}

export const listRestaurantsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListRestaurants', inputVars);
}
listRestaurantsRef.operationName = 'ListRestaurants';

export function listRestaurants(dcOrVars, vars) {
  return executeQuery(listRestaurantsRef(dcOrVars, vars));
}

export const searchRestaurantsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'SearchRestaurants', inputVars);
}
searchRestaurantsRef.operationName = 'SearchRestaurants';

export function searchRestaurants(dcOrVars, vars) {
  return executeQuery(searchRestaurantsRef(dcOrVars, vars));
}

export const getRestaurantByIdRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetRestaurantById', inputVars);
}
getRestaurantByIdRef.operationName = 'GetRestaurantById';

export function getRestaurantById(dcOrVars, vars) {
  return executeQuery(getRestaurantByIdRef(dcOrVars, vars));
}

export const getUserProfileRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserProfile');
}
getUserProfileRef.operationName = 'GetUserProfile';

export function getUserProfile(dc) {
  return executeQuery(getUserProfileRef(dc));
}

export const getUserMarketReportsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserMarketReports', inputVars);
}
getUserMarketReportsRef.operationName = 'GetUserMarketReports';

export function getUserMarketReports(dcOrVars, vars) {
  return executeQuery(getUserMarketReportsRef(dcOrVars, vars));
}

export const getMarketReportByIdRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMarketReportById', inputVars);
}
getMarketReportByIdRef.operationName = 'GetMarketReportById';

export function getMarketReportById(dcOrVars, vars) {
  return executeQuery(getMarketReportByIdRef(dcOrVars, vars));
}

export const getLocationAnalysisByIdRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetLocationAnalysisById', inputVars);
}
getLocationAnalysisByIdRef.operationName = 'GetLocationAnalysisById';

export function getLocationAnalysisById(dcOrVars, vars) {
  return executeQuery(getLocationAnalysisByIdRef(dcOrVars, vars));
}

export const getNearbyRestaurantsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetNearbyRestaurants', inputVars);
}
getNearbyRestaurantsRef.operationName = 'GetNearbyRestaurants';

export function getNearbyRestaurants(dcOrVars, vars) {
  return executeQuery(getNearbyRestaurantsRef(dcOrVars, vars));
}

