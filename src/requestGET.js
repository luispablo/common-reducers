const requestGET = function (baseURL, name, reducer) {
  return function (fetcher, dispatch) {
    fetcher(baseURL +"/"+ name).then(function (res) {
      if (res.status === 200) return res.json();
      else throw new Error("Cannot GET "+ baseURL +"/"+ items +" - Error "+ res.status);
    }).then(function (items) {
      dispatch(reducer(items));
    });
  };
};

module.exports = requestGET;