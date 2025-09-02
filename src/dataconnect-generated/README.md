# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListRestaurants*](#listrestaurants)
  - [*SearchRestaurants*](#searchrestaurants)
  - [*GetRestaurantById*](#getrestaurantbyid)
  - [*GetUserProfile*](#getuserprofile)
  - [*GetUserMarketReports*](#getusermarketreports)
  - [*GetMarketReportById*](#getmarketreportbyid)
  - [*GetLocationAnalysisById*](#getlocationanalysisbyid)
  - [*GetNearbyRestaurants*](#getnearbyrestaurants)
- [**Mutations**](#mutations)
  - [*CreateUser*](#createuser)
  - [*UpdateUserProfile*](#updateuserprofile)
  - [*CreateRestaurant*](#createrestaurant)
  - [*AddRestaurantReview*](#addrestaurantreview)
  - [*UpdateRestaurantReview*](#updaterestaurantreview)
  - [*DeleteRestaurantReview*](#deleterestaurantreview)
  - [*CreateMarketReport*](#createmarketreport)
  - [*UpdateMarketReport*](#updatemarketreport)
  - [*DeleteMarketReport*](#deletemarketreport)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListRestaurants
You can execute the `ListRestaurants` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listRestaurants(vars?: ListRestaurantsVariables): QueryPromise<ListRestaurantsData, ListRestaurantsVariables>;

interface ListRestaurantsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars?: ListRestaurantsVariables): QueryRef<ListRestaurantsData, ListRestaurantsVariables>;
}
export const listRestaurantsRef: ListRestaurantsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listRestaurants(dc: DataConnect, vars?: ListRestaurantsVariables): QueryPromise<ListRestaurantsData, ListRestaurantsVariables>;

interface ListRestaurantsRef {
  ...
  (dc: DataConnect, vars?: ListRestaurantsVariables): QueryRef<ListRestaurantsData, ListRestaurantsVariables>;
}
export const listRestaurantsRef: ListRestaurantsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listRestaurantsRef:
```typescript
const name = listRestaurantsRef.operationName;
console.log(name);
```

### Variables
The `ListRestaurants` query has an optional argument of type `ListRestaurantsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListRestaurantsVariables {
  limit?: number | null;
  offset?: number | null;
  city?: string | null;
  cuisineType?: string | null;
}
```
### Return Type
Recall that executing the `ListRestaurants` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListRestaurantsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListRestaurants`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listRestaurants, ListRestaurantsVariables } from '@dataconnect/generated';

// The `ListRestaurants` query has an optional argument of type `ListRestaurantsVariables`:
const listRestaurantsVars: ListRestaurantsVariables = {
  limit: ..., // optional
  offset: ..., // optional
  city: ..., // optional
  cuisineType: ..., // optional
};

// Call the `listRestaurants()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listRestaurants(listRestaurantsVars);
// Variables can be defined inline as well.
const { data } = await listRestaurants({ limit: ..., offset: ..., city: ..., cuisineType: ..., });
// Since all variables are optional for this query, you can omit the `ListRestaurantsVariables` argument.
const { data } = await listRestaurants();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listRestaurants(dataConnect, listRestaurantsVars);

console.log(data.restaurants);

// Or, you can use the `Promise` API.
listRestaurants(listRestaurantsVars).then((response) => {
  const data = response.data;
  console.log(data.restaurants);
});
```

### Using `ListRestaurants`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listRestaurantsRef, ListRestaurantsVariables } from '@dataconnect/generated';

// The `ListRestaurants` query has an optional argument of type `ListRestaurantsVariables`:
const listRestaurantsVars: ListRestaurantsVariables = {
  limit: ..., // optional
  offset: ..., // optional
  city: ..., // optional
  cuisineType: ..., // optional
};

// Call the `listRestaurantsRef()` function to get a reference to the query.
const ref = listRestaurantsRef(listRestaurantsVars);
// Variables can be defined inline as well.
const ref = listRestaurantsRef({ limit: ..., offset: ..., city: ..., cuisineType: ..., });
// Since all variables are optional for this query, you can omit the `ListRestaurantsVariables` argument.
const ref = listRestaurantsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listRestaurantsRef(dataConnect, listRestaurantsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.restaurants);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.restaurants);
});
```

## SearchRestaurants
You can execute the `SearchRestaurants` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
searchRestaurants(vars?: SearchRestaurantsVariables): QueryPromise<SearchRestaurantsData, SearchRestaurantsVariables>;

interface SearchRestaurantsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars?: SearchRestaurantsVariables): QueryRef<SearchRestaurantsData, SearchRestaurantsVariables>;
}
export const searchRestaurantsRef: SearchRestaurantsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
searchRestaurants(dc: DataConnect, vars?: SearchRestaurantsVariables): QueryPromise<SearchRestaurantsData, SearchRestaurantsVariables>;

interface SearchRestaurantsRef {
  ...
  (dc: DataConnect, vars?: SearchRestaurantsVariables): QueryRef<SearchRestaurantsData, SearchRestaurantsVariables>;
}
export const searchRestaurantsRef: SearchRestaurantsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the searchRestaurantsRef:
```typescript
const name = searchRestaurantsRef.operationName;
console.log(name);
```

### Variables
The `SearchRestaurants` query has an optional argument of type `SearchRestaurantsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface SearchRestaurantsVariables {
  query?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  radius?: number | null;
}
```
### Return Type
Recall that executing the `SearchRestaurants` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `SearchRestaurantsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `SearchRestaurants`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, searchRestaurants, SearchRestaurantsVariables } from '@dataconnect/generated';

// The `SearchRestaurants` query has an optional argument of type `SearchRestaurantsVariables`:
const searchRestaurantsVars: SearchRestaurantsVariables = {
  query: ..., // optional
  latitude: ..., // optional
  longitude: ..., // optional
  radius: ..., // optional
};

// Call the `searchRestaurants()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await searchRestaurants(searchRestaurantsVars);
// Variables can be defined inline as well.
const { data } = await searchRestaurants({ query: ..., latitude: ..., longitude: ..., radius: ..., });
// Since all variables are optional for this query, you can omit the `SearchRestaurantsVariables` argument.
const { data } = await searchRestaurants();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await searchRestaurants(dataConnect, searchRestaurantsVars);

console.log(data.restaurants);

// Or, you can use the `Promise` API.
searchRestaurants(searchRestaurantsVars).then((response) => {
  const data = response.data;
  console.log(data.restaurants);
});
```

### Using `SearchRestaurants`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, searchRestaurantsRef, SearchRestaurantsVariables } from '@dataconnect/generated';

// The `SearchRestaurants` query has an optional argument of type `SearchRestaurantsVariables`:
const searchRestaurantsVars: SearchRestaurantsVariables = {
  query: ..., // optional
  latitude: ..., // optional
  longitude: ..., // optional
  radius: ..., // optional
};

// Call the `searchRestaurantsRef()` function to get a reference to the query.
const ref = searchRestaurantsRef(searchRestaurantsVars);
// Variables can be defined inline as well.
const ref = searchRestaurantsRef({ query: ..., latitude: ..., longitude: ..., radius: ..., });
// Since all variables are optional for this query, you can omit the `SearchRestaurantsVariables` argument.
const ref = searchRestaurantsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = searchRestaurantsRef(dataConnect, searchRestaurantsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.restaurants);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.restaurants);
});
```

## GetRestaurantById
You can execute the `GetRestaurantById` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getRestaurantById(vars: GetRestaurantByIdVariables): QueryPromise<GetRestaurantByIdData, GetRestaurantByIdVariables>;

interface GetRestaurantByIdRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetRestaurantByIdVariables): QueryRef<GetRestaurantByIdData, GetRestaurantByIdVariables>;
}
export const getRestaurantByIdRef: GetRestaurantByIdRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getRestaurantById(dc: DataConnect, vars: GetRestaurantByIdVariables): QueryPromise<GetRestaurantByIdData, GetRestaurantByIdVariables>;

interface GetRestaurantByIdRef {
  ...
  (dc: DataConnect, vars: GetRestaurantByIdVariables): QueryRef<GetRestaurantByIdData, GetRestaurantByIdVariables>;
}
export const getRestaurantByIdRef: GetRestaurantByIdRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getRestaurantByIdRef:
```typescript
const name = getRestaurantByIdRef.operationName;
console.log(name);
```

### Variables
The `GetRestaurantById` query requires an argument of type `GetRestaurantByIdVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetRestaurantByIdVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetRestaurantById` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetRestaurantByIdData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetRestaurantById`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getRestaurantById, GetRestaurantByIdVariables } from '@dataconnect/generated';

// The `GetRestaurantById` query requires an argument of type `GetRestaurantByIdVariables`:
const getRestaurantByIdVars: GetRestaurantByIdVariables = {
  id: ..., 
};

// Call the `getRestaurantById()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getRestaurantById(getRestaurantByIdVars);
// Variables can be defined inline as well.
const { data } = await getRestaurantById({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getRestaurantById(dataConnect, getRestaurantByIdVars);

console.log(data.restaurant);

// Or, you can use the `Promise` API.
getRestaurantById(getRestaurantByIdVars).then((response) => {
  const data = response.data;
  console.log(data.restaurant);
});
```

### Using `GetRestaurantById`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getRestaurantByIdRef, GetRestaurantByIdVariables } from '@dataconnect/generated';

// The `GetRestaurantById` query requires an argument of type `GetRestaurantByIdVariables`:
const getRestaurantByIdVars: GetRestaurantByIdVariables = {
  id: ..., 
};

// Call the `getRestaurantByIdRef()` function to get a reference to the query.
const ref = getRestaurantByIdRef(getRestaurantByIdVars);
// Variables can be defined inline as well.
const ref = getRestaurantByIdRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getRestaurantByIdRef(dataConnect, getRestaurantByIdVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.restaurant);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.restaurant);
});
```

## GetUserProfile
You can execute the `GetUserProfile` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getUserProfile(): QueryPromise<GetUserProfileData, undefined>;

interface GetUserProfileRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetUserProfileData, undefined>;
}
export const getUserProfileRef: GetUserProfileRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getUserProfile(dc: DataConnect): QueryPromise<GetUserProfileData, undefined>;

interface GetUserProfileRef {
  ...
  (dc: DataConnect): QueryRef<GetUserProfileData, undefined>;
}
export const getUserProfileRef: GetUserProfileRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getUserProfileRef:
```typescript
const name = getUserProfileRef.operationName;
console.log(name);
```

### Variables
The `GetUserProfile` query has no variables.
### Return Type
Recall that executing the `GetUserProfile` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetUserProfileData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetUserProfile`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getUserProfile } from '@dataconnect/generated';


// Call the `getUserProfile()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getUserProfile();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getUserProfile(dataConnect);

console.log(data.user);

// Or, you can use the `Promise` API.
getUserProfile().then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

### Using `GetUserProfile`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getUserProfileRef } from '@dataconnect/generated';


// Call the `getUserProfileRef()` function to get a reference to the query.
const ref = getUserProfileRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getUserProfileRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.user);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

## GetUserMarketReports
You can execute the `GetUserMarketReports` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getUserMarketReports(vars?: GetUserMarketReportsVariables): QueryPromise<GetUserMarketReportsData, GetUserMarketReportsVariables>;

interface GetUserMarketReportsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars?: GetUserMarketReportsVariables): QueryRef<GetUserMarketReportsData, GetUserMarketReportsVariables>;
}
export const getUserMarketReportsRef: GetUserMarketReportsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getUserMarketReports(dc: DataConnect, vars?: GetUserMarketReportsVariables): QueryPromise<GetUserMarketReportsData, GetUserMarketReportsVariables>;

interface GetUserMarketReportsRef {
  ...
  (dc: DataConnect, vars?: GetUserMarketReportsVariables): QueryRef<GetUserMarketReportsData, GetUserMarketReportsVariables>;
}
export const getUserMarketReportsRef: GetUserMarketReportsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getUserMarketReportsRef:
```typescript
const name = getUserMarketReportsRef.operationName;
console.log(name);
```

### Variables
The `GetUserMarketReports` query has an optional argument of type `GetUserMarketReportsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetUserMarketReportsVariables {
  status?: string | null;
  limit?: number | null;
}
```
### Return Type
Recall that executing the `GetUserMarketReports` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetUserMarketReportsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetUserMarketReports`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getUserMarketReports, GetUserMarketReportsVariables } from '@dataconnect/generated';

// The `GetUserMarketReports` query has an optional argument of type `GetUserMarketReportsVariables`:
const getUserMarketReportsVars: GetUserMarketReportsVariables = {
  status: ..., // optional
  limit: ..., // optional
};

// Call the `getUserMarketReports()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getUserMarketReports(getUserMarketReportsVars);
// Variables can be defined inline as well.
const { data } = await getUserMarketReports({ status: ..., limit: ..., });
// Since all variables are optional for this query, you can omit the `GetUserMarketReportsVariables` argument.
const { data } = await getUserMarketReports();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getUserMarketReports(dataConnect, getUserMarketReportsVars);

console.log(data.user);

// Or, you can use the `Promise` API.
getUserMarketReports(getUserMarketReportsVars).then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

### Using `GetUserMarketReports`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getUserMarketReportsRef, GetUserMarketReportsVariables } from '@dataconnect/generated';

// The `GetUserMarketReports` query has an optional argument of type `GetUserMarketReportsVariables`:
const getUserMarketReportsVars: GetUserMarketReportsVariables = {
  status: ..., // optional
  limit: ..., // optional
};

// Call the `getUserMarketReportsRef()` function to get a reference to the query.
const ref = getUserMarketReportsRef(getUserMarketReportsVars);
// Variables can be defined inline as well.
const ref = getUserMarketReportsRef({ status: ..., limit: ..., });
// Since all variables are optional for this query, you can omit the `GetUserMarketReportsVariables` argument.
const ref = getUserMarketReportsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getUserMarketReportsRef(dataConnect, getUserMarketReportsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.user);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

## GetMarketReportById
You can execute the `GetMarketReportById` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getMarketReportById(vars: GetMarketReportByIdVariables): QueryPromise<GetMarketReportByIdData, GetMarketReportByIdVariables>;

interface GetMarketReportByIdRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetMarketReportByIdVariables): QueryRef<GetMarketReportByIdData, GetMarketReportByIdVariables>;
}
export const getMarketReportByIdRef: GetMarketReportByIdRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getMarketReportById(dc: DataConnect, vars: GetMarketReportByIdVariables): QueryPromise<GetMarketReportByIdData, GetMarketReportByIdVariables>;

interface GetMarketReportByIdRef {
  ...
  (dc: DataConnect, vars: GetMarketReportByIdVariables): QueryRef<GetMarketReportByIdData, GetMarketReportByIdVariables>;
}
export const getMarketReportByIdRef: GetMarketReportByIdRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getMarketReportByIdRef:
```typescript
const name = getMarketReportByIdRef.operationName;
console.log(name);
```

### Variables
The `GetMarketReportById` query requires an argument of type `GetMarketReportByIdVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetMarketReportByIdVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetMarketReportById` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetMarketReportByIdData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetMarketReportById`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getMarketReportById, GetMarketReportByIdVariables } from '@dataconnect/generated';

// The `GetMarketReportById` query requires an argument of type `GetMarketReportByIdVariables`:
const getMarketReportByIdVars: GetMarketReportByIdVariables = {
  id: ..., 
};

// Call the `getMarketReportById()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getMarketReportById(getMarketReportByIdVars);
// Variables can be defined inline as well.
const { data } = await getMarketReportById({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getMarketReportById(dataConnect, getMarketReportByIdVars);

console.log(data.marketReport);

// Or, you can use the `Promise` API.
getMarketReportById(getMarketReportByIdVars).then((response) => {
  const data = response.data;
  console.log(data.marketReport);
});
```

### Using `GetMarketReportById`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getMarketReportByIdRef, GetMarketReportByIdVariables } from '@dataconnect/generated';

// The `GetMarketReportById` query requires an argument of type `GetMarketReportByIdVariables`:
const getMarketReportByIdVars: GetMarketReportByIdVariables = {
  id: ..., 
};

// Call the `getMarketReportByIdRef()` function to get a reference to the query.
const ref = getMarketReportByIdRef(getMarketReportByIdVars);
// Variables can be defined inline as well.
const ref = getMarketReportByIdRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getMarketReportByIdRef(dataConnect, getMarketReportByIdVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.marketReport);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.marketReport);
});
```

## GetLocationAnalysisById
You can execute the `GetLocationAnalysisById` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getLocationAnalysisById(vars: GetLocationAnalysisByIdVariables): QueryPromise<GetLocationAnalysisByIdData, GetLocationAnalysisByIdVariables>;

interface GetLocationAnalysisByIdRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetLocationAnalysisByIdVariables): QueryRef<GetLocationAnalysisByIdData, GetLocationAnalysisByIdVariables>;
}
export const getLocationAnalysisByIdRef: GetLocationAnalysisByIdRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getLocationAnalysisById(dc: DataConnect, vars: GetLocationAnalysisByIdVariables): QueryPromise<GetLocationAnalysisByIdData, GetLocationAnalysisByIdVariables>;

interface GetLocationAnalysisByIdRef {
  ...
  (dc: DataConnect, vars: GetLocationAnalysisByIdVariables): QueryRef<GetLocationAnalysisByIdData, GetLocationAnalysisByIdVariables>;
}
export const getLocationAnalysisByIdRef: GetLocationAnalysisByIdRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getLocationAnalysisByIdRef:
```typescript
const name = getLocationAnalysisByIdRef.operationName;
console.log(name);
```

### Variables
The `GetLocationAnalysisById` query requires an argument of type `GetLocationAnalysisByIdVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetLocationAnalysisByIdVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetLocationAnalysisById` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetLocationAnalysisByIdData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetLocationAnalysisById`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getLocationAnalysisById, GetLocationAnalysisByIdVariables } from '@dataconnect/generated';

// The `GetLocationAnalysisById` query requires an argument of type `GetLocationAnalysisByIdVariables`:
const getLocationAnalysisByIdVars: GetLocationAnalysisByIdVariables = {
  id: ..., 
};

// Call the `getLocationAnalysisById()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getLocationAnalysisById(getLocationAnalysisByIdVars);
// Variables can be defined inline as well.
const { data } = await getLocationAnalysisById({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getLocationAnalysisById(dataConnect, getLocationAnalysisByIdVars);

console.log(data.locationAnalysis);

// Or, you can use the `Promise` API.
getLocationAnalysisById(getLocationAnalysisByIdVars).then((response) => {
  const data = response.data;
  console.log(data.locationAnalysis);
});
```

### Using `GetLocationAnalysisById`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getLocationAnalysisByIdRef, GetLocationAnalysisByIdVariables } from '@dataconnect/generated';

// The `GetLocationAnalysisById` query requires an argument of type `GetLocationAnalysisByIdVariables`:
const getLocationAnalysisByIdVars: GetLocationAnalysisByIdVariables = {
  id: ..., 
};

// Call the `getLocationAnalysisByIdRef()` function to get a reference to the query.
const ref = getLocationAnalysisByIdRef(getLocationAnalysisByIdVars);
// Variables can be defined inline as well.
const ref = getLocationAnalysisByIdRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getLocationAnalysisByIdRef(dataConnect, getLocationAnalysisByIdVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.locationAnalysis);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.locationAnalysis);
});
```

## GetNearbyRestaurants
You can execute the `GetNearbyRestaurants` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getNearbyRestaurants(vars: GetNearbyRestaurantsVariables): QueryPromise<GetNearbyRestaurantsData, GetNearbyRestaurantsVariables>;

interface GetNearbyRestaurantsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetNearbyRestaurantsVariables): QueryRef<GetNearbyRestaurantsData, GetNearbyRestaurantsVariables>;
}
export const getNearbyRestaurantsRef: GetNearbyRestaurantsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getNearbyRestaurants(dc: DataConnect, vars: GetNearbyRestaurantsVariables): QueryPromise<GetNearbyRestaurantsData, GetNearbyRestaurantsVariables>;

interface GetNearbyRestaurantsRef {
  ...
  (dc: DataConnect, vars: GetNearbyRestaurantsVariables): QueryRef<GetNearbyRestaurantsData, GetNearbyRestaurantsVariables>;
}
export const getNearbyRestaurantsRef: GetNearbyRestaurantsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getNearbyRestaurantsRef:
```typescript
const name = getNearbyRestaurantsRef.operationName;
console.log(name);
```

### Variables
The `GetNearbyRestaurants` query requires an argument of type `GetNearbyRestaurantsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetNearbyRestaurantsVariables {
  latitude: number;
  longitude: number;
  radius: number;
}
```
### Return Type
Recall that executing the `GetNearbyRestaurants` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetNearbyRestaurantsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetNearbyRestaurants`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getNearbyRestaurants, GetNearbyRestaurantsVariables } from '@dataconnect/generated';

// The `GetNearbyRestaurants` query requires an argument of type `GetNearbyRestaurantsVariables`:
const getNearbyRestaurantsVars: GetNearbyRestaurantsVariables = {
  latitude: ..., 
  longitude: ..., 
  radius: ..., 
};

// Call the `getNearbyRestaurants()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getNearbyRestaurants(getNearbyRestaurantsVars);
// Variables can be defined inline as well.
const { data } = await getNearbyRestaurants({ latitude: ..., longitude: ..., radius: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getNearbyRestaurants(dataConnect, getNearbyRestaurantsVars);

console.log(data.restaurants);

// Or, you can use the `Promise` API.
getNearbyRestaurants(getNearbyRestaurantsVars).then((response) => {
  const data = response.data;
  console.log(data.restaurants);
});
```

### Using `GetNearbyRestaurants`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getNearbyRestaurantsRef, GetNearbyRestaurantsVariables } from '@dataconnect/generated';

// The `GetNearbyRestaurants` query requires an argument of type `GetNearbyRestaurantsVariables`:
const getNearbyRestaurantsVars: GetNearbyRestaurantsVariables = {
  latitude: ..., 
  longitude: ..., 
  radius: ..., 
};

// Call the `getNearbyRestaurantsRef()` function to get a reference to the query.
const ref = getNearbyRestaurantsRef(getNearbyRestaurantsVars);
// Variables can be defined inline as well.
const ref = getNearbyRestaurantsRef({ latitude: ..., longitude: ..., radius: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getNearbyRestaurantsRef(dataConnect, getNearbyRestaurantsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.restaurants);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.restaurants);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateUser
You can execute the `CreateUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createUser(vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface CreateUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
}
export const createUserRef: CreateUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createUser(dc: DataConnect, vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface CreateUserRef {
  ...
  (dc: DataConnect, vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
}
export const createUserRef: CreateUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createUserRef:
```typescript
const name = createUserRef.operationName;
console.log(name);
```

### Variables
The `CreateUser` mutation requires an argument of type `CreateUserVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateUserVariables {
  email: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
}
```
### Return Type
Recall that executing the `CreateUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateUserData {
  user_upsert: User_Key;
}
```
### Using `CreateUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createUser, CreateUserVariables } from '@dataconnect/generated';

// The `CreateUser` mutation requires an argument of type `CreateUserVariables`:
const createUserVars: CreateUserVariables = {
  email: ..., 
  username: ..., 
  firstName: ..., // optional
  lastName: ..., // optional
};

// Call the `createUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createUser(createUserVars);
// Variables can be defined inline as well.
const { data } = await createUser({ email: ..., username: ..., firstName: ..., lastName: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createUser(dataConnect, createUserVars);

console.log(data.user_upsert);

// Or, you can use the `Promise` API.
createUser(createUserVars).then((response) => {
  const data = response.data;
  console.log(data.user_upsert);
});
```

### Using `CreateUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createUserRef, CreateUserVariables } from '@dataconnect/generated';

// The `CreateUser` mutation requires an argument of type `CreateUserVariables`:
const createUserVars: CreateUserVariables = {
  email: ..., 
  username: ..., 
  firstName: ..., // optional
  lastName: ..., // optional
};

// Call the `createUserRef()` function to get a reference to the mutation.
const ref = createUserRef(createUserVars);
// Variables can be defined inline as well.
const ref = createUserRef({ email: ..., username: ..., firstName: ..., lastName: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createUserRef(dataConnect, createUserVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_upsert);
});
```

## UpdateUserProfile
You can execute the `UpdateUserProfile` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateUserProfile(vars?: UpdateUserProfileVariables): MutationPromise<UpdateUserProfileData, UpdateUserProfileVariables>;

interface UpdateUserProfileRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars?: UpdateUserProfileVariables): MutationRef<UpdateUserProfileData, UpdateUserProfileVariables>;
}
export const updateUserProfileRef: UpdateUserProfileRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateUserProfile(dc: DataConnect, vars?: UpdateUserProfileVariables): MutationPromise<UpdateUserProfileData, UpdateUserProfileVariables>;

interface UpdateUserProfileRef {
  ...
  (dc: DataConnect, vars?: UpdateUserProfileVariables): MutationRef<UpdateUserProfileData, UpdateUserProfileVariables>;
}
export const updateUserProfileRef: UpdateUserProfileRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateUserProfileRef:
```typescript
const name = updateUserProfileRef.operationName;
console.log(name);
```

### Variables
The `UpdateUserProfile` mutation has an optional argument of type `UpdateUserProfileVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateUserProfileVariables {
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  profileImageUrl?: string | null;
  preferences?: string | null;
}
```
### Return Type
Recall that executing the `UpdateUserProfile` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateUserProfileData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateUserProfileData {
  user_update?: User_Key | null;
}
```
### Using `UpdateUserProfile`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateUserProfile, UpdateUserProfileVariables } from '@dataconnect/generated';

// The `UpdateUserProfile` mutation has an optional argument of type `UpdateUserProfileVariables`:
const updateUserProfileVars: UpdateUserProfileVariables = {
  firstName: ..., // optional
  lastName: ..., // optional
  phoneNumber: ..., // optional
  profileImageUrl: ..., // optional
  preferences: ..., // optional
};

// Call the `updateUserProfile()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateUserProfile(updateUserProfileVars);
// Variables can be defined inline as well.
const { data } = await updateUserProfile({ firstName: ..., lastName: ..., phoneNumber: ..., profileImageUrl: ..., preferences: ..., });
// Since all variables are optional for this mutation, you can omit the `UpdateUserProfileVariables` argument.
const { data } = await updateUserProfile();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateUserProfile(dataConnect, updateUserProfileVars);

console.log(data.user_update);

// Or, you can use the `Promise` API.
updateUserProfile(updateUserProfileVars).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

### Using `UpdateUserProfile`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateUserProfileRef, UpdateUserProfileVariables } from '@dataconnect/generated';

// The `UpdateUserProfile` mutation has an optional argument of type `UpdateUserProfileVariables`:
const updateUserProfileVars: UpdateUserProfileVariables = {
  firstName: ..., // optional
  lastName: ..., // optional
  phoneNumber: ..., // optional
  profileImageUrl: ..., // optional
  preferences: ..., // optional
};

// Call the `updateUserProfileRef()` function to get a reference to the mutation.
const ref = updateUserProfileRef(updateUserProfileVars);
// Variables can be defined inline as well.
const ref = updateUserProfileRef({ firstName: ..., lastName: ..., phoneNumber: ..., profileImageUrl: ..., preferences: ..., });
// Since all variables are optional for this mutation, you can omit the `UpdateUserProfileVariables` argument.
const ref = updateUserProfileRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateUserProfileRef(dataConnect, updateUserProfileVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

## CreateRestaurant
You can execute the `CreateRestaurant` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createRestaurant(vars: CreateRestaurantVariables): MutationPromise<CreateRestaurantData, CreateRestaurantVariables>;

interface CreateRestaurantRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateRestaurantVariables): MutationRef<CreateRestaurantData, CreateRestaurantVariables>;
}
export const createRestaurantRef: CreateRestaurantRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createRestaurant(dc: DataConnect, vars: CreateRestaurantVariables): MutationPromise<CreateRestaurantData, CreateRestaurantVariables>;

interface CreateRestaurantRef {
  ...
  (dc: DataConnect, vars: CreateRestaurantVariables): MutationRef<CreateRestaurantData, CreateRestaurantVariables>;
}
export const createRestaurantRef: CreateRestaurantRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createRestaurantRef:
```typescript
const name = createRestaurantRef.operationName;
console.log(name);
```

### Variables
The `CreateRestaurant` mutation requires an argument of type `CreateRestaurantVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `CreateRestaurant` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateRestaurantData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateRestaurantData {
  restaurant_insert: Restaurant_Key;
}
```
### Using `CreateRestaurant`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createRestaurant, CreateRestaurantVariables } from '@dataconnect/generated';

// The `CreateRestaurant` mutation requires an argument of type `CreateRestaurantVariables`:
const createRestaurantVars: CreateRestaurantVariables = {
  name: ..., 
  description: ..., // optional
  cuisineType: ..., // optional
  priceRange: ..., // optional
  address: ..., 
  city: ..., 
  state: ..., 
  zipCode: ..., 
  latitude: ..., 
  longitude: ..., 
  phoneNumber: ..., // optional
  website: ..., // optional
  email: ..., // optional
  businessHours: ..., // optional
  imageUrls: ..., // optional
  tags: ..., // optional
  googlePlaceId: ..., // optional
  yelpId: ..., // optional
  foursquareId: ..., // optional
};

// Call the `createRestaurant()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createRestaurant(createRestaurantVars);
// Variables can be defined inline as well.
const { data } = await createRestaurant({ name: ..., description: ..., cuisineType: ..., priceRange: ..., address: ..., city: ..., state: ..., zipCode: ..., latitude: ..., longitude: ..., phoneNumber: ..., website: ..., email: ..., businessHours: ..., imageUrls: ..., tags: ..., googlePlaceId: ..., yelpId: ..., foursquareId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createRestaurant(dataConnect, createRestaurantVars);

console.log(data.restaurant_insert);

// Or, you can use the `Promise` API.
createRestaurant(createRestaurantVars).then((response) => {
  const data = response.data;
  console.log(data.restaurant_insert);
});
```

### Using `CreateRestaurant`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createRestaurantRef, CreateRestaurantVariables } from '@dataconnect/generated';

// The `CreateRestaurant` mutation requires an argument of type `CreateRestaurantVariables`:
const createRestaurantVars: CreateRestaurantVariables = {
  name: ..., 
  description: ..., // optional
  cuisineType: ..., // optional
  priceRange: ..., // optional
  address: ..., 
  city: ..., 
  state: ..., 
  zipCode: ..., 
  latitude: ..., 
  longitude: ..., 
  phoneNumber: ..., // optional
  website: ..., // optional
  email: ..., // optional
  businessHours: ..., // optional
  imageUrls: ..., // optional
  tags: ..., // optional
  googlePlaceId: ..., // optional
  yelpId: ..., // optional
  foursquareId: ..., // optional
};

// Call the `createRestaurantRef()` function to get a reference to the mutation.
const ref = createRestaurantRef(createRestaurantVars);
// Variables can be defined inline as well.
const ref = createRestaurantRef({ name: ..., description: ..., cuisineType: ..., priceRange: ..., address: ..., city: ..., state: ..., zipCode: ..., latitude: ..., longitude: ..., phoneNumber: ..., website: ..., email: ..., businessHours: ..., imageUrls: ..., tags: ..., googlePlaceId: ..., yelpId: ..., foursquareId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createRestaurantRef(dataConnect, createRestaurantVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.restaurant_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.restaurant_insert);
});
```

## AddRestaurantReview
You can execute the `AddRestaurantReview` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
addRestaurantReview(vars: AddRestaurantReviewVariables): MutationPromise<AddRestaurantReviewData, AddRestaurantReviewVariables>;

interface AddRestaurantReviewRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddRestaurantReviewVariables): MutationRef<AddRestaurantReviewData, AddRestaurantReviewVariables>;
}
export const addRestaurantReviewRef: AddRestaurantReviewRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
addRestaurantReview(dc: DataConnect, vars: AddRestaurantReviewVariables): MutationPromise<AddRestaurantReviewData, AddRestaurantReviewVariables>;

interface AddRestaurantReviewRef {
  ...
  (dc: DataConnect, vars: AddRestaurantReviewVariables): MutationRef<AddRestaurantReviewData, AddRestaurantReviewVariables>;
}
export const addRestaurantReviewRef: AddRestaurantReviewRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the addRestaurantReviewRef:
```typescript
const name = addRestaurantReviewRef.operationName;
console.log(name);
```

### Variables
The `AddRestaurantReview` mutation requires an argument of type `AddRestaurantReviewVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `AddRestaurantReview` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `AddRestaurantReviewData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface AddRestaurantReviewData {
  restaurantReview_insert: RestaurantReview_Key;
}
```
### Using `AddRestaurantReview`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, addRestaurantReview, AddRestaurantReviewVariables } from '@dataconnect/generated';

// The `AddRestaurantReview` mutation requires an argument of type `AddRestaurantReviewVariables`:
const addRestaurantReviewVars: AddRestaurantReviewVariables = {
  restaurantId: ..., 
  rating: ..., 
  title: ..., // optional
  reviewText: ..., // optional
  visitDate: ..., // optional
  visitType: ..., // optional
  partySize: ..., // optional
  imageUrls: ..., // optional
};

// Call the `addRestaurantReview()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await addRestaurantReview(addRestaurantReviewVars);
// Variables can be defined inline as well.
const { data } = await addRestaurantReview({ restaurantId: ..., rating: ..., title: ..., reviewText: ..., visitDate: ..., visitType: ..., partySize: ..., imageUrls: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await addRestaurantReview(dataConnect, addRestaurantReviewVars);

console.log(data.restaurantReview_insert);

// Or, you can use the `Promise` API.
addRestaurantReview(addRestaurantReviewVars).then((response) => {
  const data = response.data;
  console.log(data.restaurantReview_insert);
});
```

### Using `AddRestaurantReview`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, addRestaurantReviewRef, AddRestaurantReviewVariables } from '@dataconnect/generated';

// The `AddRestaurantReview` mutation requires an argument of type `AddRestaurantReviewVariables`:
const addRestaurantReviewVars: AddRestaurantReviewVariables = {
  restaurantId: ..., 
  rating: ..., 
  title: ..., // optional
  reviewText: ..., // optional
  visitDate: ..., // optional
  visitType: ..., // optional
  partySize: ..., // optional
  imageUrls: ..., // optional
};

// Call the `addRestaurantReviewRef()` function to get a reference to the mutation.
const ref = addRestaurantReviewRef(addRestaurantReviewVars);
// Variables can be defined inline as well.
const ref = addRestaurantReviewRef({ restaurantId: ..., rating: ..., title: ..., reviewText: ..., visitDate: ..., visitType: ..., partySize: ..., imageUrls: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = addRestaurantReviewRef(dataConnect, addRestaurantReviewVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.restaurantReview_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.restaurantReview_insert);
});
```

## UpdateRestaurantReview
You can execute the `UpdateRestaurantReview` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateRestaurantReview(vars: UpdateRestaurantReviewVariables): MutationPromise<UpdateRestaurantReviewData, UpdateRestaurantReviewVariables>;

interface UpdateRestaurantReviewRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateRestaurantReviewVariables): MutationRef<UpdateRestaurantReviewData, UpdateRestaurantReviewVariables>;
}
export const updateRestaurantReviewRef: UpdateRestaurantReviewRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateRestaurantReview(dc: DataConnect, vars: UpdateRestaurantReviewVariables): MutationPromise<UpdateRestaurantReviewData, UpdateRestaurantReviewVariables>;

interface UpdateRestaurantReviewRef {
  ...
  (dc: DataConnect, vars: UpdateRestaurantReviewVariables): MutationRef<UpdateRestaurantReviewData, UpdateRestaurantReviewVariables>;
}
export const updateRestaurantReviewRef: UpdateRestaurantReviewRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateRestaurantReviewRef:
```typescript
const name = updateRestaurantReviewRef.operationName;
console.log(name);
```

### Variables
The `UpdateRestaurantReview` mutation requires an argument of type `UpdateRestaurantReviewVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `UpdateRestaurantReview` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateRestaurantReviewData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateRestaurantReviewData {
  restaurantReview_update?: RestaurantReview_Key | null;
}
```
### Using `UpdateRestaurantReview`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateRestaurantReview, UpdateRestaurantReviewVariables } from '@dataconnect/generated';

// The `UpdateRestaurantReview` mutation requires an argument of type `UpdateRestaurantReviewVariables`:
const updateRestaurantReviewVars: UpdateRestaurantReviewVariables = {
  id: ..., 
  rating: ..., // optional
  title: ..., // optional
  reviewText: ..., // optional
  visitDate: ..., // optional
  visitType: ..., // optional
  partySize: ..., // optional
  imageUrls: ..., // optional
};

// Call the `updateRestaurantReview()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateRestaurantReview(updateRestaurantReviewVars);
// Variables can be defined inline as well.
const { data } = await updateRestaurantReview({ id: ..., rating: ..., title: ..., reviewText: ..., visitDate: ..., visitType: ..., partySize: ..., imageUrls: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateRestaurantReview(dataConnect, updateRestaurantReviewVars);

console.log(data.restaurantReview_update);

// Or, you can use the `Promise` API.
updateRestaurantReview(updateRestaurantReviewVars).then((response) => {
  const data = response.data;
  console.log(data.restaurantReview_update);
});
```

### Using `UpdateRestaurantReview`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateRestaurantReviewRef, UpdateRestaurantReviewVariables } from '@dataconnect/generated';

// The `UpdateRestaurantReview` mutation requires an argument of type `UpdateRestaurantReviewVariables`:
const updateRestaurantReviewVars: UpdateRestaurantReviewVariables = {
  id: ..., 
  rating: ..., // optional
  title: ..., // optional
  reviewText: ..., // optional
  visitDate: ..., // optional
  visitType: ..., // optional
  partySize: ..., // optional
  imageUrls: ..., // optional
};

// Call the `updateRestaurantReviewRef()` function to get a reference to the mutation.
const ref = updateRestaurantReviewRef(updateRestaurantReviewVars);
// Variables can be defined inline as well.
const ref = updateRestaurantReviewRef({ id: ..., rating: ..., title: ..., reviewText: ..., visitDate: ..., visitType: ..., partySize: ..., imageUrls: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateRestaurantReviewRef(dataConnect, updateRestaurantReviewVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.restaurantReview_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.restaurantReview_update);
});
```

## DeleteRestaurantReview
You can execute the `DeleteRestaurantReview` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteRestaurantReview(vars: DeleteRestaurantReviewVariables): MutationPromise<DeleteRestaurantReviewData, DeleteRestaurantReviewVariables>;

interface DeleteRestaurantReviewRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteRestaurantReviewVariables): MutationRef<DeleteRestaurantReviewData, DeleteRestaurantReviewVariables>;
}
export const deleteRestaurantReviewRef: DeleteRestaurantReviewRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteRestaurantReview(dc: DataConnect, vars: DeleteRestaurantReviewVariables): MutationPromise<DeleteRestaurantReviewData, DeleteRestaurantReviewVariables>;

interface DeleteRestaurantReviewRef {
  ...
  (dc: DataConnect, vars: DeleteRestaurantReviewVariables): MutationRef<DeleteRestaurantReviewData, DeleteRestaurantReviewVariables>;
}
export const deleteRestaurantReviewRef: DeleteRestaurantReviewRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteRestaurantReviewRef:
```typescript
const name = deleteRestaurantReviewRef.operationName;
console.log(name);
```

### Variables
The `DeleteRestaurantReview` mutation requires an argument of type `DeleteRestaurantReviewVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteRestaurantReviewVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteRestaurantReview` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteRestaurantReviewData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteRestaurantReviewData {
  restaurantReview_delete?: RestaurantReview_Key | null;
}
```
### Using `DeleteRestaurantReview`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteRestaurantReview, DeleteRestaurantReviewVariables } from '@dataconnect/generated';

// The `DeleteRestaurantReview` mutation requires an argument of type `DeleteRestaurantReviewVariables`:
const deleteRestaurantReviewVars: DeleteRestaurantReviewVariables = {
  id: ..., 
};

// Call the `deleteRestaurantReview()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteRestaurantReview(deleteRestaurantReviewVars);
// Variables can be defined inline as well.
const { data } = await deleteRestaurantReview({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteRestaurantReview(dataConnect, deleteRestaurantReviewVars);

console.log(data.restaurantReview_delete);

// Or, you can use the `Promise` API.
deleteRestaurantReview(deleteRestaurantReviewVars).then((response) => {
  const data = response.data;
  console.log(data.restaurantReview_delete);
});
```

### Using `DeleteRestaurantReview`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteRestaurantReviewRef, DeleteRestaurantReviewVariables } from '@dataconnect/generated';

// The `DeleteRestaurantReview` mutation requires an argument of type `DeleteRestaurantReviewVariables`:
const deleteRestaurantReviewVars: DeleteRestaurantReviewVariables = {
  id: ..., 
};

// Call the `deleteRestaurantReviewRef()` function to get a reference to the mutation.
const ref = deleteRestaurantReviewRef(deleteRestaurantReviewVars);
// Variables can be defined inline as well.
const ref = deleteRestaurantReviewRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteRestaurantReviewRef(dataConnect, deleteRestaurantReviewVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.restaurantReview_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.restaurantReview_delete);
});
```

## CreateMarketReport
You can execute the `CreateMarketReport` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createMarketReport(vars: CreateMarketReportVariables): MutationPromise<CreateMarketReportData, CreateMarketReportVariables>;

interface CreateMarketReportRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateMarketReportVariables): MutationRef<CreateMarketReportData, CreateMarketReportVariables>;
}
export const createMarketReportRef: CreateMarketReportRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createMarketReport(dc: DataConnect, vars: CreateMarketReportVariables): MutationPromise<CreateMarketReportData, CreateMarketReportVariables>;

interface CreateMarketReportRef {
  ...
  (dc: DataConnect, vars: CreateMarketReportVariables): MutationRef<CreateMarketReportData, CreateMarketReportVariables>;
}
export const createMarketReportRef: CreateMarketReportRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createMarketReportRef:
```typescript
const name = createMarketReportRef.operationName;
console.log(name);
```

### Variables
The `CreateMarketReport` mutation requires an argument of type `CreateMarketReportVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateMarketReportVariables {
  title: string;
  query: string;
  reportType: string;
  targetLocation?: string | null;
  analysisRadius?: number | null;
  coordinates?: string | null;
}
```
### Return Type
Recall that executing the `CreateMarketReport` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateMarketReportData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateMarketReportData {
  marketReport_insert: MarketReport_Key;
}
```
### Using `CreateMarketReport`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createMarketReport, CreateMarketReportVariables } from '@dataconnect/generated';

// The `CreateMarketReport` mutation requires an argument of type `CreateMarketReportVariables`:
const createMarketReportVars: CreateMarketReportVariables = {
  title: ..., 
  query: ..., 
  reportType: ..., 
  targetLocation: ..., // optional
  analysisRadius: ..., // optional
  coordinates: ..., // optional
};

// Call the `createMarketReport()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createMarketReport(createMarketReportVars);
// Variables can be defined inline as well.
const { data } = await createMarketReport({ title: ..., query: ..., reportType: ..., targetLocation: ..., analysisRadius: ..., coordinates: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createMarketReport(dataConnect, createMarketReportVars);

console.log(data.marketReport_insert);

// Or, you can use the `Promise` API.
createMarketReport(createMarketReportVars).then((response) => {
  const data = response.data;
  console.log(data.marketReport_insert);
});
```

### Using `CreateMarketReport`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createMarketReportRef, CreateMarketReportVariables } from '@dataconnect/generated';

// The `CreateMarketReport` mutation requires an argument of type `CreateMarketReportVariables`:
const createMarketReportVars: CreateMarketReportVariables = {
  title: ..., 
  query: ..., 
  reportType: ..., 
  targetLocation: ..., // optional
  analysisRadius: ..., // optional
  coordinates: ..., // optional
};

// Call the `createMarketReportRef()` function to get a reference to the mutation.
const ref = createMarketReportRef(createMarketReportVars);
// Variables can be defined inline as well.
const ref = createMarketReportRef({ title: ..., query: ..., reportType: ..., targetLocation: ..., analysisRadius: ..., coordinates: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createMarketReportRef(dataConnect, createMarketReportVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.marketReport_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.marketReport_insert);
});
```

## UpdateMarketReport
You can execute the `UpdateMarketReport` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateMarketReport(vars: UpdateMarketReportVariables): MutationPromise<UpdateMarketReportData, UpdateMarketReportVariables>;

interface UpdateMarketReportRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateMarketReportVariables): MutationRef<UpdateMarketReportData, UpdateMarketReportVariables>;
}
export const updateMarketReportRef: UpdateMarketReportRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateMarketReport(dc: DataConnect, vars: UpdateMarketReportVariables): MutationPromise<UpdateMarketReportData, UpdateMarketReportVariables>;

interface UpdateMarketReportRef {
  ...
  (dc: DataConnect, vars: UpdateMarketReportVariables): MutationRef<UpdateMarketReportData, UpdateMarketReportVariables>;
}
export const updateMarketReportRef: UpdateMarketReportRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateMarketReportRef:
```typescript
const name = updateMarketReportRef.operationName;
console.log(name);
```

### Variables
The `UpdateMarketReport` mutation requires an argument of type `UpdateMarketReportVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `UpdateMarketReport` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateMarketReportData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateMarketReportData {
  marketReport_update?: MarketReport_Key | null;
}
```
### Using `UpdateMarketReport`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateMarketReport, UpdateMarketReportVariables } from '@dataconnect/generated';

// The `UpdateMarketReport` mutation requires an argument of type `UpdateMarketReportVariables`:
const updateMarketReportVars: UpdateMarketReportVariables = {
  id: ..., 
  status: ..., // optional
  executiveSummary: ..., // optional
  marketAnalysis: ..., // optional
  competitorAnalysis: ..., // optional
  demographicAnalysis: ..., // optional
  recommendations: ..., // optional
  riskAssessment: ..., // optional
  confidence: ..., // optional
  dataQuality: ..., // optional
  processingTime: ..., // optional
  completedAt: ..., // optional
  expiresAt: ..., // optional
  exportUrls: ..., // optional
};

// Call the `updateMarketReport()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateMarketReport(updateMarketReportVars);
// Variables can be defined inline as well.
const { data } = await updateMarketReport({ id: ..., status: ..., executiveSummary: ..., marketAnalysis: ..., competitorAnalysis: ..., demographicAnalysis: ..., recommendations: ..., riskAssessment: ..., confidence: ..., dataQuality: ..., processingTime: ..., completedAt: ..., expiresAt: ..., exportUrls: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateMarketReport(dataConnect, updateMarketReportVars);

console.log(data.marketReport_update);

// Or, you can use the `Promise` API.
updateMarketReport(updateMarketReportVars).then((response) => {
  const data = response.data;
  console.log(data.marketReport_update);
});
```

### Using `UpdateMarketReport`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateMarketReportRef, UpdateMarketReportVariables } from '@dataconnect/generated';

// The `UpdateMarketReport` mutation requires an argument of type `UpdateMarketReportVariables`:
const updateMarketReportVars: UpdateMarketReportVariables = {
  id: ..., 
  status: ..., // optional
  executiveSummary: ..., // optional
  marketAnalysis: ..., // optional
  competitorAnalysis: ..., // optional
  demographicAnalysis: ..., // optional
  recommendations: ..., // optional
  riskAssessment: ..., // optional
  confidence: ..., // optional
  dataQuality: ..., // optional
  processingTime: ..., // optional
  completedAt: ..., // optional
  expiresAt: ..., // optional
  exportUrls: ..., // optional
};

// Call the `updateMarketReportRef()` function to get a reference to the mutation.
const ref = updateMarketReportRef(updateMarketReportVars);
// Variables can be defined inline as well.
const ref = updateMarketReportRef({ id: ..., status: ..., executiveSummary: ..., marketAnalysis: ..., competitorAnalysis: ..., demographicAnalysis: ..., recommendations: ..., riskAssessment: ..., confidence: ..., dataQuality: ..., processingTime: ..., completedAt: ..., expiresAt: ..., exportUrls: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateMarketReportRef(dataConnect, updateMarketReportVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.marketReport_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.marketReport_update);
});
```

## DeleteMarketReport
You can execute the `DeleteMarketReport` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteMarketReport(vars: DeleteMarketReportVariables): MutationPromise<DeleteMarketReportData, DeleteMarketReportVariables>;

interface DeleteMarketReportRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteMarketReportVariables): MutationRef<DeleteMarketReportData, DeleteMarketReportVariables>;
}
export const deleteMarketReportRef: DeleteMarketReportRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteMarketReport(dc: DataConnect, vars: DeleteMarketReportVariables): MutationPromise<DeleteMarketReportData, DeleteMarketReportVariables>;

interface DeleteMarketReportRef {
  ...
  (dc: DataConnect, vars: DeleteMarketReportVariables): MutationRef<DeleteMarketReportData, DeleteMarketReportVariables>;
}
export const deleteMarketReportRef: DeleteMarketReportRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteMarketReportRef:
```typescript
const name = deleteMarketReportRef.operationName;
console.log(name);
```

### Variables
The `DeleteMarketReport` mutation requires an argument of type `DeleteMarketReportVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteMarketReportVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteMarketReport` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteMarketReportData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteMarketReportData {
  marketReport_delete?: MarketReport_Key | null;
}
```
### Using `DeleteMarketReport`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteMarketReport, DeleteMarketReportVariables } from '@dataconnect/generated';

// The `DeleteMarketReport` mutation requires an argument of type `DeleteMarketReportVariables`:
const deleteMarketReportVars: DeleteMarketReportVariables = {
  id: ..., 
};

// Call the `deleteMarketReport()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteMarketReport(deleteMarketReportVars);
// Variables can be defined inline as well.
const { data } = await deleteMarketReport({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteMarketReport(dataConnect, deleteMarketReportVars);

console.log(data.marketReport_delete);

// Or, you can use the `Promise` API.
deleteMarketReport(deleteMarketReportVars).then((response) => {
  const data = response.data;
  console.log(data.marketReport_delete);
});
```

### Using `DeleteMarketReport`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteMarketReportRef, DeleteMarketReportVariables } from '@dataconnect/generated';

// The `DeleteMarketReport` mutation requires an argument of type `DeleteMarketReportVariables`:
const deleteMarketReportVars: DeleteMarketReportVariables = {
  id: ..., 
};

// Call the `deleteMarketReportRef()` function to get a reference to the mutation.
const ref = deleteMarketReportRef(deleteMarketReportVars);
// Variables can be defined inline as well.
const ref = deleteMarketReportRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteMarketReportRef(dataConnect, deleteMarketReportVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.marketReport_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.marketReport_delete);
});
```

