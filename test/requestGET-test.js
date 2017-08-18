const test = require("tape");
const requestGET = require("../src/requestGET");

test("requestGET - Basic funcionality", function (assert) {
  assert.plan(3);
  const items = [{ id: 1 }, { id: 2 }];
  const res = { status: 200, json: () => items };
  const appendFunction = i => assert.equal(i, items, "Appends the given items");
  const dispatch = f => assert.equal(f, appendFunction(items), "Dispatch the reducer");
  const fetcher = function (url) {
    return new Promise(function (resolve, reject) {
      resolve(res);
    });
  };
  const requestHelper = requestGET("/api", "items", appendFunction);

  requestHelper(fetcher, dispatch);
});
