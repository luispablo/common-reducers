const ReduxAct = require("redux-act");
const createAction = ReduxAct.createAction;
const createReducer = ReduxAct.createReducer;
const addErrorMessage = require("./messages").addErrorMessage;
const application = require("./application");

const setFetchingFunction = application.setFetchingFunction;
const removeFetchingFunction = application.removeFetchingFunction;

const JWT_LOCAL_STORAGE_KEY = "JWT";

const initialState = { JWT: null, validatedJWT: false };

const clearInvalidLocalJWT = (storage) => {
	const stringJWT = storage.getItem(JWT_LOCAL_STORAGE_KEY);

	if (stringJWT !== null && (typeof(stringJWT) == "undefined" || stringJWT == "undefined")) {
		storage.removeItem(JWT_LOCAL_STORAGE_KEY);
	}
};

const getJWTFromLocalStorage = (storage) => {
	return (state) => {
		clearInvalidLocalJWT(storage);
		const stringJWT = storage.getItem(JWT_LOCAL_STORAGE_KEY);
		const JWT = (stringJWT !== null) ? JSON.parse(stringJWT) : null;
		return Object.assign({}, state, { JWT: JWT });
	};
};

const _storeJWT = (storage) => {
	return (state, payload) => {
		storage.setItem(JWT_LOCAL_STORAGE_KEY, JSON.stringify(payload));
		return Object.assign({}, state, {JWT: payload, validatedJWT: true});
	};
};

const clearJWT = createAction("clear JWT");
const restoreJWT = createAction("restore JWT");
const storeJWT = createAction("store JWT");
const validateJWT = createAction("validate JWT");

const requestJWTValidation = (JWT, fetcher, dispatch) => {
	return new Promise((resolve, reject) => {
		dispatch(setFetchingFunction({requestJWTValidation: 1}));
		const headers = {headers: {"x-access-token": JWT.token}};

		fetcher("api/auth/validate_token", headers).then(response => {
			dispatch(removeFetchingFunction("requestJWTValidation"));

			if (response.status === 200) {
				dispatch(validateJWT());
				resolve();
			} else {
				dispatch(clearJWT());
				reject();
			}
		});
	});
};

const requestJWTRevoke = (jwt, fetcher, dispatch) => {
	return new Promise((resolve, reject) => {
		dispatch(setFetchingFunction({requestJWTRevoke: 1}));

		const body = {
			method: "DELETE",
			headers: {"x-access-token": jwt.token}
		};

		fetcher("api/auth/token", body).then(response => {
			dispatch(removeFetchingFunction("requestJWTRevoke"));
			if (response.status === 200) {
				dispatch(clearJWT());
				resolve();
			} else {
				reject(response);
			}
		});
	});
};

const requestNewJWT = (username, password, fetcher, dispatch) => {
	return new Promise((resolve, reject) => {
		dispatch(setFetchingFunction({requestNewJWT: 1}));

		const body = {
			method: "POST",
			headers: {"Accept": "application/json", "Content-Type": "application/json"},
			body: JSON.stringify({username, password})
		};

		fetcher("api/auth/token", body).then(response => {
			dispatch(removeFetchingFunction("requestNewJWT"));
			if (response.status === 200) return response.json();
			else throw new Error("Usuario o contraseña inválidos");
		}).then(JWT => {
			dispatch(storeJWT(JWT));
			resolve(JWT);
		}).catch(err => {
			dispatch(removeFetchingFunction("requestNewJWT"));
			dispatch(error(err.message));
			reject(error);
		});
	});
};

const Security = function (_storage) {
	const storage = _storage || window.localStorage;

	return createReducer({
		[clearJWT]: (state) => Object.assign({}, state, { JWT: null }),
		[restoreJWT]: getJWTFromLocalStorage(storage),
		[storeJWT]: _storeJWT(storage),
		[validateJWT]: (state) => Object.assign({}, state, { validatedJWT: true })
	}, initialState);
};

Security.clearJWT = clearJWT;
Security.restoreJWT = restoreJWT;
Security.storeJWT = storeJWT;
Security.validateJWT = validateJWT;
Security.requestNewJWT = requestNewJWT;
Security.requestJWTRevoke = requestJWTRevoke;
Security.requestJWTValidation = requestJWTValidation;

module.exports = Security;
