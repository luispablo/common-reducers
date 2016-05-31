const ReduxAct = require("redux-act");
const createAction = ReduxAct.createAction;
const createReducer = ReduxAct.createReducer;

const isFetching = function (functionName) {
	return this.fetchingFunctions[functionName] !== undefined;
};

const initialState = { params: {}, fetchingFunctions: {}, isFetching };

const setParam = createAction("set param");
const setFetchingFunction = createAction("set fetching function");
const removeFetchingFunction = createAction("remove fetching function");

const application = ReduxAct.createReducer({
	[setParam]: (state, payload) => Object.assign({}, state, { params: Object.assign({}, state.params, payload) }),
	[setFetchingFunction]: (state, payload) => Object.assign({}, state, { fetchingFunctions: Object.assign({}, state.fetchingFunctions, payload) }),
	[removeFetchingFunction]: (state, payload) => Object.assign({}, state, { fetchingFunctions: Object.assign({}, state.fetchingFunctions, {[payload]: undefined}) })
}, initialState);

application.setParam = setParam;
application.setFetchingFunction = setFetchingFunction;
application.removeFetchingFunction = removeFetchingFunction;
application.isFetching = isFetching;

module.exports = application;
