'use strict';

var _ = require('lodash');

/**
 * Policy to check that request is done via authenticated user. This policy uses existing
 * JWT tokens to validate that user is authenticated. If use is not authenticate policy
 * sends 401 response back to client.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function
 *
 * @returns {*}
 */
module.exports = function authenticated(request, response, next) {
    sails.log.verbose(__filename + ':' + __line + ' [Policy.Authenticated() called]');

    if(process.env.NO_AUTH === 'true') {
        // // Store user id to request object
        request.token = 'noauth';

        // We delete the token from query and body to not mess with blueprints
        request.query && delete request.query.token;
        request.body && delete request.body.token;

        return next();
    }

    /**
     * Helper function to process possible error and actual token after it is decoded.
     *
     * @param request
     * @param   {{}}      error Possible error
     * @param decode
     * @returns {*}
     */
    var verify = function verify(request, error, decode) {
        if (error){
            return response.json(401, {message: 'Given authorization token is not valid', logout: true});
        }else {
            // Store user id to request object
            request.token = decode.data;

            // We delete the token from query and body to not mess with blueprints
            request.query && delete request.query.token;
            request.body && delete request.body.token;
            return next();
        }
    };

    // Get and verify JWT via service
    try {
        sails.services.markettoken.getToken(request, verify, true);
    } catch (error) {
        return response.json(401, {message: error.message, logout: true});
    }
};
