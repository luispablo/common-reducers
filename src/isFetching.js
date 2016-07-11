const isFetching = function (store, functionName) {
	return store.fetchingFunctions[functionName] !== undefined;
};

module.exports = isFetching;
