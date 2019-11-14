var MarketService = {
    headers: function (isJSON) {
        var headers = {};
        if (isJSON) {
            headers = {'Content-Type': 'application/json'}
        }
        return headers;
    },
};
module.exports = MarketService;