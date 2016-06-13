const application = require("./application");

const addErrorMessage = require("./messages").addErrorMessage;
const setFetchingFunction = application.setFetchingFunction;
const removeFetchingFunction = application.removeFetchingFunction;

const commonReducersFetcher = function (fetchFunctionName, URL, options, fetcher, dispatch) {
	return new Promise(resolve => {
		dispatch(setFetchingFunction({[fetchFunctionName]: 1}));

		fetcher(URL, options).then(res => {
			dispatch(removeFetchingFunction(fetchFunctionName));
			if(res.status === 200) return res.json();
			else throw new Error(`${URL}: HTTP ${res.status}`);
		}).then(jsonRes => resolve(jsonRes)).catch(err => {
			dispatch(removeFetchingFunction(fetchFunctionName));
			dispatch(addErrorMessage(err.message));
		});
	});
};

module.exports = commonReducersFetcher;
