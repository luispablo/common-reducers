const isFetching = function (store, functionName) {
	if (functionName) {
		return store.fetchingFunctions[functionName] !== undefined;
	} else {
		return Object.getOwnPropertyNames(store.fetchingFunctions).length > 0;
	}
};

module.exports = isFetching;
