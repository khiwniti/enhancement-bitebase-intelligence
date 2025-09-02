import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface AddRestaurantReviewData {
  restaurantReview_insert: RestaurantReview_Key;
}

export interface AddRestaurantReviewVariables {
  restaurantId: UUIDString;
  rating: number;
  title?: string | null;
  reviewText?: string | null;
  visitDate?: DateString | null;
  visitType?: string | null;
  partySize?: number | null;
  imageUrls?: string | null;
}

export interface CreateMarketReportData {
  marketReport_insert: MarketReport_Key;
}

export interface CreateMarketReportVariables {
  title: string;
  query: string;
  reportType: string;
  targetLocation?: string | null;
  analysisRadius?: number | null;
  coordinates?: string | null;
}

export interface CreateRestaurantData {
  restaurant_insert: Restaurant_Key;
}

export interface CreateRestaurantVariables {
  name: string;
  description?: string | null;
  cuisineType?: string | null;
  priceRange?: string | null;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  phoneNumber?: string | null;
  website?: string | null;
  email?: string | null;
  businessHours?: string | null;
  imageUrls?: string | null;
  tags?: string | null;
  googlePlaceId?: string | null;
  yelpId?: string | null;
  foursquareId?: string | null;
}

export interface CreateUserData {
  user_upsert: User_Key;
}

export interface CreateUserVariables {
  email: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
}

export interface DeleteMarketReportData {
  marketReport_delete?: MarketReport_Key | null;
}

export interface DeleteMarketReportVariables {
  id: UUIDString;
}

export interface DeleteRestaurantReviewData {
  restaurantReview_delete?: RestaurantReview_Key | null;
}

export interface DeleteRestaurantReviewVariables {
  id: UUIDString;
}

export interface GetLocationAnalysisByIdData {
  locationAnalysis?: {
    id: UUIDString;
    latitude: number;
    longitude: number;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    zipCode?: string | null;
    radius: number;
    analysisType: string;
    competitorCount?: number | null;
    averageRating?: number | null;
    averagePriceRange?: string | null;
    dominantCuisines?: string | null;
    marketSaturation?: number | null;
    opportunityScore?: number | null;
    populationDensity?: number | null;
    medianIncome?: number | null;
    ageDistribution?: string | null;
    footTraffic?: string | null;
    confidence?: number | null;
    dataQuality?: string | null;
    analysisDate: TimestampString;
    expiresAt?: TimestampString | null;
    rawData?: string | null;
    insights?: string | null;
    recommendations?: string | null;
    user: {
      id: string;
      username: string;
    } & User_Key;
  } & LocationAnalysis_Key;
}

export interface GetLocationAnalysisByIdVariables {
  id: UUIDString;
}

export interface GetMarketReportByIdData {
  marketReport?: {
    id: UUIDString;
    title: string;
    query: string;
    status: string;
    reportType: string;
    targetLocation?: string | null;
    analysisRadius?: number | null;
    coordinates?: string | null;
    executiveSummary?: string | null;
    marketAnalysis?: string | null;
    competitorAnalysis?: string | null;
    demographicAnalysis?: string | null;
    recommendations?: string | null;
    riskAssessment?: string | null;
    confidence?: number | null;
    dataQuality?: string | null;
    processingTime?: number | null;
    createdAt: TimestampString;
    completedAt?: TimestampString | null;
    expiresAt?: TimestampString | null;
    exportUrls?: string | null;
    isPublic?: boolean | null;
    shareToken?: string | null;
    user: {
      id: string;
      username: string;
      firstName?: string | null;
      lastName?: string | null;
    } & User_Key;
  } & MarketReport_Key;
}

export interface GetMarketReportByIdVariables {
  id: UUIDString;
}

export interface GetNearbyRestaurantsData {
  restaurants: ({
    id: UUIDString;
    name: string;
    cuisineType?: string | null;
    priceRange?: string | null;
    latitude: number;
    longitude: number;
    rating?: number | null;
    reviewCount?: number | null;
    address: string;
    city: string;
  } & Restaurant_Key)[];
}

export interface GetNearbyRestaurantsVariables {
  latitude: number;
  longitude: number;
  radius: number;
}

export interface GetRestaurantByIdData {
  restaurant?: {
    id: UUIDString;
    name: string;
    description?: string | null;
    cuisineType?: string | null;
    priceRange?: string | null;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    latitude: number;
    longitude: number;
    phoneNumber?: string | null;
    website?: string | null;
    email?: string | null;
    rating?: number | null;
    reviewCount?: number | null;
    isOpen?: boolean | null;
    businessHours?: string | null;
    imageUrls?: string | null;
    tags?: string | null;
    createdAt: TimestampString;
    verifiedAt?: TimestampString | null;
    reviews: ({
      id: UUIDString;
      rating: number;
      title?: string | null;
      reviewText?: string | null;
      visitDate?: DateString | null;
      visitType?: string | null;
      isVerified?: boolean | null;
      helpfulCount?: number | null;
      createdAt: TimestampString;
      imageUrls?: string | null;
      user: {
        id: string;
        username: string;
        firstName?: string | null;
        lastName?: string | null;
      } & User_Key;
    } & RestaurantReview_Key)[];
      analytics: ({
        viewCount?: number | null;
        clickCount?: number | null;
        averageRating?: number | null;
        searchPosition?: number | null;
        marketShare?: number | null;
      })[];
  } & Restaurant_Key;
}

export interface GetRestaurantByIdVariables {
  id: UUIDString;
}

export interface GetUserMarketReportsData {
  user?: {
    reports: ({
      id: UUIDString;
      title: string;
      query: string;
      status: string;
      reportType: string;
      targetLocation?: string | null;
      analysisRadius?: number | null;
      executiveSummary?: string | null;
      confidence?: number | null;
      dataQuality?: string | null;
      processingTime?: number | null;
      createdAt: TimestampString;
      completedAt?: TimestampString | null;
      expiresAt?: TimestampString | null;
      exportUrls?: string | null;
      isPublic?: boolean | null;
      shareToken?: string | null;
    } & MarketReport_Key)[];
  };
}

export interface GetUserMarketReportsVariables {
  status?: string | null;
  limit?: number | null;
}

export interface GetUserProfileData {
  user?: {
    id: string;
    email: string;
    username: string;
    firstName?: string | null;
    lastName?: string | null;
    role: string;
    status: string;
    profileImageUrl?: string | null;
    phoneNumber?: string | null;
    preferences?: string | null;
    createdAt: TimestampString;
    lastLoginAt?: TimestampString | null;
    reports: ({
      id: UUIDString;
      title: string;
      status: string;
      reportType: string;
      targetLocation?: string | null;
      confidence?: number | null;
      createdAt: TimestampString;
      completedAt?: TimestampString | null;
      isPublic?: boolean | null;
    } & MarketReport_Key)[];
      analyses: ({
        id: UUIDString;
        latitude: number;
        longitude: number;
        address?: string | null;
        city?: string | null;
        analysisType: string;
        opportunityScore?: number | null;
        confidence?: number | null;
        analysisDate: TimestampString;
      } & LocationAnalysis_Key)[];
        reviews: ({
          id: UUIDString;
          rating: number;
          title?: string | null;
          reviewText?: string | null;
          visitDate?: DateString | null;
          createdAt: TimestampString;
          restaurant: {
            id: UUIDString;
            name: string;
            cuisineType?: string | null;
            city: string;
          } & Restaurant_Key;
        } & RestaurantReview_Key)[];
  } & User_Key;
}

export interface ListRestaurantsData {
  restaurants: ({
    id: UUIDString;
    name: string;
    cuisineType?: string | null;
    priceRange?: string | null;
    address: string;
    city: string;
    state: string;
    rating?: number | null;
    reviewCount?: number | null;
    imageUrls?: string | null;
    isOpen?: boolean | null;
    phoneNumber?: string | null;
    website?: string | null;
  } & Restaurant_Key)[];
}

export interface ListRestaurantsVariables {
  limit?: number | null;
  offset?: number | null;
  city?: string | null;
  cuisineType?: string | null;
}

export interface LocationAnalysis_Key {
  id: UUIDString;
  __typename?: 'LocationAnalysis_Key';
}

export interface MarketReport_Key {
  id: UUIDString;
  __typename?: 'MarketReport_Key';
}

export interface RestaurantAnalytics_Key {
  id: UUIDString;
  __typename?: 'RestaurantAnalytics_Key';
}

export interface RestaurantReview_Key {
  id: UUIDString;
  __typename?: 'RestaurantReview_Key';
}

export interface Restaurant_Key {
  id: UUIDString;
  __typename?: 'Restaurant_Key';
}

export interface SearchRestaurantsData {
  restaurants: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    cuisineType?: string | null;
    priceRange?: string | null;
    address: string;
    city: string;
    state: string;
    latitude: number;
    longitude: number;
    rating?: number | null;
    reviewCount?: number | null;
    imageUrls?: string | null;
    phoneNumber?: string | null;
    website?: string | null;
    businessHours?: string | null;
  } & Restaurant_Key)[];
}

export interface SearchRestaurantsVariables {
  query?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  radius?: number | null;
}

export interface UpdateMarketReportData {
  marketReport_update?: MarketReport_Key | null;
}

export interface UpdateMarketReportVariables {
  id: UUIDString;
  status?: string | null;
  executiveSummary?: string | null;
  marketAnalysis?: string | null;
  competitorAnalysis?: string | null;
  demographicAnalysis?: string | null;
  recommendations?: string | null;
  riskAssessment?: string | null;
  confidence?: number | null;
  dataQuality?: string | null;
  processingTime?: number | null;
  completedAt?: TimestampString | null;
  expiresAt?: TimestampString | null;
  exportUrls?: string | null;
}

export interface UpdateRestaurantReviewData {
  restaurantReview_update?: RestaurantReview_Key | null;
}

export interface UpdateRestaurantReviewVariables {
  id: UUIDString;
  rating?: number | null;
  title?: string | null;
  reviewText?: string | null;
  visitDate?: DateString | null;
  visitType?: string | null;
  partySize?: number | null;
  imageUrls?: string | null;
}

export interface UpdateUserProfileData {
  user_update?: User_Key | null;
}

export interface UpdateUserProfileVariables {
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  profileImageUrl?: string | null;
  preferences?: string | null;
}

export interface UserSession_Key {
  id: UUIDString;
  __typename?: 'UserSession_Key';
}

export interface User_Key {
  id: string;
  __typename?: 'User_Key';
}

interface CreateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
  operationName: string;
}
export const createUserRef: CreateUserRef;

export function createUser(vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;
export function createUser(dc: DataConnect, vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface UpdateUserProfileRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: UpdateUserProfileVariables): MutationRef<UpdateUserProfileData, UpdateUserProfileVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: UpdateUserProfileVariables): MutationRef<UpdateUserProfileData, UpdateUserProfileVariables>;
  operationName: string;
}
export const updateUserProfileRef: UpdateUserProfileRef;

export function updateUserProfile(vars?: UpdateUserProfileVariables): MutationPromise<UpdateUserProfileData, UpdateUserProfileVariables>;
export function updateUserProfile(dc: DataConnect, vars?: UpdateUserProfileVariables): MutationPromise<UpdateUserProfileData, UpdateUserProfileVariables>;

interface CreateRestaurantRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateRestaurantVariables): MutationRef<CreateRestaurantData, CreateRestaurantVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateRestaurantVariables): MutationRef<CreateRestaurantData, CreateRestaurantVariables>;
  operationName: string;
}
export const createRestaurantRef: CreateRestaurantRef;

export function createRestaurant(vars: CreateRestaurantVariables): MutationPromise<CreateRestaurantData, CreateRestaurantVariables>;
export function createRestaurant(dc: DataConnect, vars: CreateRestaurantVariables): MutationPromise<CreateRestaurantData, CreateRestaurantVariables>;

interface AddRestaurantReviewRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddRestaurantReviewVariables): MutationRef<AddRestaurantReviewData, AddRestaurantReviewVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: AddRestaurantReviewVariables): MutationRef<AddRestaurantReviewData, AddRestaurantReviewVariables>;
  operationName: string;
}
export const addRestaurantReviewRef: AddRestaurantReviewRef;

export function addRestaurantReview(vars: AddRestaurantReviewVariables): MutationPromise<AddRestaurantReviewData, AddRestaurantReviewVariables>;
export function addRestaurantReview(dc: DataConnect, vars: AddRestaurantReviewVariables): MutationPromise<AddRestaurantReviewData, AddRestaurantReviewVariables>;

interface UpdateRestaurantReviewRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateRestaurantReviewVariables): MutationRef<UpdateRestaurantReviewData, UpdateRestaurantReviewVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateRestaurantReviewVariables): MutationRef<UpdateRestaurantReviewData, UpdateRestaurantReviewVariables>;
  operationName: string;
}
export const updateRestaurantReviewRef: UpdateRestaurantReviewRef;

export function updateRestaurantReview(vars: UpdateRestaurantReviewVariables): MutationPromise<UpdateRestaurantReviewData, UpdateRestaurantReviewVariables>;
export function updateRestaurantReview(dc: DataConnect, vars: UpdateRestaurantReviewVariables): MutationPromise<UpdateRestaurantReviewData, UpdateRestaurantReviewVariables>;

interface DeleteRestaurantReviewRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteRestaurantReviewVariables): MutationRef<DeleteRestaurantReviewData, DeleteRestaurantReviewVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteRestaurantReviewVariables): MutationRef<DeleteRestaurantReviewData, DeleteRestaurantReviewVariables>;
  operationName: string;
}
export const deleteRestaurantReviewRef: DeleteRestaurantReviewRef;

export function deleteRestaurantReview(vars: DeleteRestaurantReviewVariables): MutationPromise<DeleteRestaurantReviewData, DeleteRestaurantReviewVariables>;
export function deleteRestaurantReview(dc: DataConnect, vars: DeleteRestaurantReviewVariables): MutationPromise<DeleteRestaurantReviewData, DeleteRestaurantReviewVariables>;

interface CreateMarketReportRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateMarketReportVariables): MutationRef<CreateMarketReportData, CreateMarketReportVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateMarketReportVariables): MutationRef<CreateMarketReportData, CreateMarketReportVariables>;
  operationName: string;
}
export const createMarketReportRef: CreateMarketReportRef;

export function createMarketReport(vars: CreateMarketReportVariables): MutationPromise<CreateMarketReportData, CreateMarketReportVariables>;
export function createMarketReport(dc: DataConnect, vars: CreateMarketReportVariables): MutationPromise<CreateMarketReportData, CreateMarketReportVariables>;

interface UpdateMarketReportRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateMarketReportVariables): MutationRef<UpdateMarketReportData, UpdateMarketReportVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateMarketReportVariables): MutationRef<UpdateMarketReportData, UpdateMarketReportVariables>;
  operationName: string;
}
export const updateMarketReportRef: UpdateMarketReportRef;

export function updateMarketReport(vars: UpdateMarketReportVariables): MutationPromise<UpdateMarketReportData, UpdateMarketReportVariables>;
export function updateMarketReport(dc: DataConnect, vars: UpdateMarketReportVariables): MutationPromise<UpdateMarketReportData, UpdateMarketReportVariables>;

interface DeleteMarketReportRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteMarketReportVariables): MutationRef<DeleteMarketReportData, DeleteMarketReportVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteMarketReportVariables): MutationRef<DeleteMarketReportData, DeleteMarketReportVariables>;
  operationName: string;
}
export const deleteMarketReportRef: DeleteMarketReportRef;

export function deleteMarketReport(vars: DeleteMarketReportVariables): MutationPromise<DeleteMarketReportData, DeleteMarketReportVariables>;
export function deleteMarketReport(dc: DataConnect, vars: DeleteMarketReportVariables): MutationPromise<DeleteMarketReportData, DeleteMarketReportVariables>;

interface ListRestaurantsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: ListRestaurantsVariables): QueryRef<ListRestaurantsData, ListRestaurantsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: ListRestaurantsVariables): QueryRef<ListRestaurantsData, ListRestaurantsVariables>;
  operationName: string;
}
export const listRestaurantsRef: ListRestaurantsRef;

export function listRestaurants(vars?: ListRestaurantsVariables): QueryPromise<ListRestaurantsData, ListRestaurantsVariables>;
export function listRestaurants(dc: DataConnect, vars?: ListRestaurantsVariables): QueryPromise<ListRestaurantsData, ListRestaurantsVariables>;

interface SearchRestaurantsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: SearchRestaurantsVariables): QueryRef<SearchRestaurantsData, SearchRestaurantsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: SearchRestaurantsVariables): QueryRef<SearchRestaurantsData, SearchRestaurantsVariables>;
  operationName: string;
}
export const searchRestaurantsRef: SearchRestaurantsRef;

export function searchRestaurants(vars?: SearchRestaurantsVariables): QueryPromise<SearchRestaurantsData, SearchRestaurantsVariables>;
export function searchRestaurants(dc: DataConnect, vars?: SearchRestaurantsVariables): QueryPromise<SearchRestaurantsData, SearchRestaurantsVariables>;

interface GetRestaurantByIdRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetRestaurantByIdVariables): QueryRef<GetRestaurantByIdData, GetRestaurantByIdVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetRestaurantByIdVariables): QueryRef<GetRestaurantByIdData, GetRestaurantByIdVariables>;
  operationName: string;
}
export const getRestaurantByIdRef: GetRestaurantByIdRef;

export function getRestaurantById(vars: GetRestaurantByIdVariables): QueryPromise<GetRestaurantByIdData, GetRestaurantByIdVariables>;
export function getRestaurantById(dc: DataConnect, vars: GetRestaurantByIdVariables): QueryPromise<GetRestaurantByIdData, GetRestaurantByIdVariables>;

interface GetUserProfileRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetUserProfileData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetUserProfileData, undefined>;
  operationName: string;
}
export const getUserProfileRef: GetUserProfileRef;

export function getUserProfile(): QueryPromise<GetUserProfileData, undefined>;
export function getUserProfile(dc: DataConnect): QueryPromise<GetUserProfileData, undefined>;

interface GetUserMarketReportsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: GetUserMarketReportsVariables): QueryRef<GetUserMarketReportsData, GetUserMarketReportsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: GetUserMarketReportsVariables): QueryRef<GetUserMarketReportsData, GetUserMarketReportsVariables>;
  operationName: string;
}
export const getUserMarketReportsRef: GetUserMarketReportsRef;

export function getUserMarketReports(vars?: GetUserMarketReportsVariables): QueryPromise<GetUserMarketReportsData, GetUserMarketReportsVariables>;
export function getUserMarketReports(dc: DataConnect, vars?: GetUserMarketReportsVariables): QueryPromise<GetUserMarketReportsData, GetUserMarketReportsVariables>;

interface GetMarketReportByIdRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetMarketReportByIdVariables): QueryRef<GetMarketReportByIdData, GetMarketReportByIdVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetMarketReportByIdVariables): QueryRef<GetMarketReportByIdData, GetMarketReportByIdVariables>;
  operationName: string;
}
export const getMarketReportByIdRef: GetMarketReportByIdRef;

export function getMarketReportById(vars: GetMarketReportByIdVariables): QueryPromise<GetMarketReportByIdData, GetMarketReportByIdVariables>;
export function getMarketReportById(dc: DataConnect, vars: GetMarketReportByIdVariables): QueryPromise<GetMarketReportByIdData, GetMarketReportByIdVariables>;

interface GetLocationAnalysisByIdRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetLocationAnalysisByIdVariables): QueryRef<GetLocationAnalysisByIdData, GetLocationAnalysisByIdVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetLocationAnalysisByIdVariables): QueryRef<GetLocationAnalysisByIdData, GetLocationAnalysisByIdVariables>;
  operationName: string;
}
export const getLocationAnalysisByIdRef: GetLocationAnalysisByIdRef;

export function getLocationAnalysisById(vars: GetLocationAnalysisByIdVariables): QueryPromise<GetLocationAnalysisByIdData, GetLocationAnalysisByIdVariables>;
export function getLocationAnalysisById(dc: DataConnect, vars: GetLocationAnalysisByIdVariables): QueryPromise<GetLocationAnalysisByIdData, GetLocationAnalysisByIdVariables>;

interface GetNearbyRestaurantsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetNearbyRestaurantsVariables): QueryRef<GetNearbyRestaurantsData, GetNearbyRestaurantsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetNearbyRestaurantsVariables): QueryRef<GetNearbyRestaurantsData, GetNearbyRestaurantsVariables>;
  operationName: string;
}
export const getNearbyRestaurantsRef: GetNearbyRestaurantsRef;

export function getNearbyRestaurants(vars: GetNearbyRestaurantsVariables): QueryPromise<GetNearbyRestaurantsData, GetNearbyRestaurantsVariables>;
export function getNearbyRestaurants(dc: DataConnect, vars: GetNearbyRestaurantsVariables): QueryPromise<GetNearbyRestaurantsData, GetNearbyRestaurantsVariables>;

