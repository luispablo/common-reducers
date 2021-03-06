# common-reducers
Redux reducers you'll probably need in any webapp.

# The package includes

## An 'application' reducer

This reducer builds the following object in your store:

```javascript
{ params: {}, fetchingFunctions: {} }
```

and you can use it like this:

```javascript
import { application } from "common-reducers";

const { setParam, setFetchingFunction, removeFetchingFunction } = application;

...
and then dispatch like any redux-act action:

dispatch(setParam({key: "value"}));
dispatch(setFetchingFunction({dummyFunc: 0.5})); // This could be a progress value, and 'dummyFunc' is the function that invoked the server
dispatch(removeFetchingFunction("dummyFunc")); // Use the exact same function name you provided when setting
```

and when you want to know if a certain function is fetching data, then you have the helper function isFetching:

```javascript
import { isFetching } from "common-reducers";

const isDummyFuncFetching = isFetching(store.application, "dummyFunc"); // here you know if dummyFunc is still fetching or has already ended.
```

Else, if you want to know if _anything_ is fetching, you can do:

```javascript
import { isFetching } from "common-reducers";

const isFetchingSomething = isFetching(store.application);
```

## A 'messages' reducer

This reducer builds the following object in your store:

```javascript
{ items: [] }
```

where 'items' is an array of messages, each one carryng a *type* and *text* properties.
And you can use it like this:

```javascript
import { messages } from "common-reducers";

const { addMessage, clearMessages, addErrorMessage, addInfoMessage, addWarnMessage } = messages;
```

*addMessage* receives an object with the type and text properties, is like a low -level function.
*clearMessages* takes no params and puts the items array back to zero.
and the other *add* actions take only text as param, and adds a message object to the items array.

## A 'Security' reducer

It builds the following object in your Redux store: 

```javascript
  { 
    JWT: null, // JSON Web Token (default null, null if invalid, [object] if present and valid)
    isValidatingJWT: false, // is it waiting server validation? (default false)
    validatedJWT: false // has the server responded if the JWT is valid? (default false)
  }
```

This reducer stores the JWT in your HTML5 local storage for persistence, and uses the *validatedJWT* value to know if the local stored JWT was validated by the server.

You get the following actions **to dispatch through Redux**:

```javascript
import { Security } from "common-reducers";

const { clearJWT, restoreJWT, storeJWT, validateJWT } = Security;
```

* ```clearJWT``` - sets the JWT property to null
* ```restoreJWT``` - get the JWT from the local storage and sets it in the Redux store
* ```storeJWT``` - set a JWT in the Redux store and in the local storage too
* ```validateJWT``` - sets the validatedJWT property to true

This object also gives you the following helper functions:

```javascript
import { Security } from "common-reducers";

const { requestNewJWT, requestJWTRevoke, requestJWTValidation, restoreValidatedLocalJWT } = Security;
```

#### requestNewJWT (username, password, fetcher, dispatch)

Takes 4 params, the first two are self explanatory, fetcher can be the 'fetch' function given by the runtime, and dispatch is the Redux function to dispatch actions.

It POSTs a request to 'api/auth/token' and, if everything went well, uses *storeJWT* to save it.

It returns a Promise; if everything is OK resolves with the JWT, if not, rejects with and error. The error is an instance of ```SecurityException```, that has code and message (401 authentication failed, 403 authorization failed, as in HTTP error codes)

#### requestJWTRevoke (jwt, fetcher, dispatch)

Issues a DELETE request to 'api/auth/token' and, if everything went OK, then triggers a clearJWT action.

#### requestJWTValidation (JWT, fetcher, dispatch)

With a GET request to 'api/auth/validate_token', and the 'token' property of the JSON web token in the 'x-access-token' header of the protocol, validates the JWT.
If the server responds with a 200 status, then a validateJWT action is triggered, if not, a clearJWT will be dispatched.

#### restoreValidatedLocalJWT (fetcher, dispatch)

Looks for a JWT in ```localStorage```. If it's not present, it resolves ```null``` and sets the ```validatedJWT``` property to ```true```, otherwise it sets ```isValidatingJWT``` to true and issues a server validation through ```requestJWTValidation```. When the server responds, it sets the ```isValidatingJWT``` to ```false``` and ```validatedJWT``` to ```true``` to indicate that this operation is done.

If the token is valid it stores it in the ```JWT``` property and resolves it; otherwise it will remove it from ```localStorage``` and resolve ```null```.

## commonReducersFetcher

This is a helper function to issue request through the 'fetch' function, but handling:

* setFetchingFunction when it begins
* removeFetchingFunction when it ends, OK or with error.
* Calling json() function on response if status is 200
* throwing new Error with HTTP code if response status is NOT 200
* Adding an error message through the messages reducer with any error

This function returns a Promise, so use it as such.

```javascript
import { commonReducersFetcher } from "common-reducers";

...
// First param is function name that requests, second is the URL, third are the fetch function options
// The last two params are the fetcher (you can use the new fetch function) and the dispatch function,
// provided by Redux
commonReducersFetcher("requestItems", "/api/items", { method: "GET" }, fetch, dispatch).then(items => {
	// Everything taken care for you, use it wisely :)
});
```

### requestGET

This helper simplifies even more the common case of using the ```commonReducersFetcher``` for when you need to ```GET``` some given resource, and dispatch an action with the result of such HTTP GET call.

```javascript
...
import { requestGET } from "common-reducers";
...

// You have an action
const appendItems = createAction("append items");
// Such action stores items in the Redux store
const reducer = createReducer({
  ...
  [appendItems]: (state, payload) => Object.assign({}, state, { items: payload }),
  ...
}, { items: [], ... });
// If you need to GET from /api/items and afterwards dispatch appendItems, then you simply do
const requestGETItems = requestGET("/api", "items", appendItems);

...

// Then, when you need to use it, invoke it with two params: the fetcher and the dispatch. i.e:
requestGETItems(fetch, dispatch);
```
