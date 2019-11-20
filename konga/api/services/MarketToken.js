'use strict';

/**
 * Token.js
 *
 * JWT token service which handles issuing and verifying tokens.
 */
var jwt = require('jsonwebtoken');
var moment = require('moment');

/**
 * Service method to generate a new token based on payload we want to put on it.
 *
 * @param   {String}    payload
 *
 * @returns {*}
 */
module.exports.issue = function issue(payload) {
    sails.log.verbose(__filename + ':' + __line + ' [Service.Token.issue() called]');

    return jwt.sign(
        payload, // This is the payload we want to put inside the token
        process.env.TOKEN_SECRET || "oursecret" // Secret string which will be used to sign the token
    );
};

/**
 * Service method to generate a new token for Kongs JWT auth, based on the connection settings.
 *
 * @param   {Object}    connection
 *
 * @returns {*}
 */
module.exports.issueKongConnectionToken = function issueKong(connection) {
    sails.log.verbose(__filename + ':' + __line + ' [Service.Token.issueKongConnectionToken() called]');


    var payload = {
        iss: connection.jwt_key,
        nbf : moment().subtract(1, 'm').unix(),
        exp : moment().add(2, 'm').unix()
    }

    return jwt.sign(
        payload, // This is the payload we want to put inside the token
        connection.jwt_secret // Secret string which will be used to sign the token
    );
};

/**
 * Service method to verify that the token we received on a request hasn't be tampered with.
 *
 * @param request
 * @param   {String}    token   Token to validate
 * @param   {Function}  next    Callback function
 *
 * @returns {*}
 */
module.exports.verify = function verify(request ,token, next) {
    sails.log.verbose(__filename + ':' + __line + ' [Service.Token.verify() called]');

    return jwt.verify(
        token, // The token to be verified
        process.env.TOKEN_SECRET || "oursecret", // The secret we used to sign it.
        function(error, decode){
            if (error){
                sails.log.error("验证出错！" + error.message);
               next({
                   code:"403",
                   msg: "登录信息验证有误，请重新登录！"
               },decode)
            }else {
                sails.log.debug(decode);
                if (decode.data){
                    if (decode.exp > Date.now()){
                        next({
                            code:"403",
                            msg:"登录已超时，请重新登录"
                        },decode)
                    }
                    next(request, error,decode)
                }else {
                    next({
                        code:"404",
                        msg: "没有找到Token数据"
                    },decode)
                }
            }
        }
    );
};

/**
 * Service method to get current user token. Note that this will also verify actual token value.
 *
 * @param   {Request}   request     Request object
 * @param   {Function}  next        Callback function
 * @param   {Boolean}   throwError  Throw error from invalid token specification
 *
 * @return  {*}
 */
module.exports.getToken = function getToken(request, next, throwError) {
    sails.log.verbose(__filename + ':' + __line + ' [Service.Token.getToken() called]');

    var token = '';
    if (request.cookies['User-token']){
        token = request.cookies['User-token'].token;
    }
    // Yeah we got required 'authorization' header
    else if (request.headers && request.headers.authorization) {
        var parts = request.headers.authorization.split(' ');

        if (parts.length === 2) {
            var scheme = parts[0];
            var credentials = parts[1];

            if (/^Bearer$/i.test(scheme)) {
                token = credentials;
            }
        } else if (throwError) {
            throw new Error('Invalid authorization header format. Format is Authorization: Bearer [token]');
        }
    } else if (request.param('token')) { // JWT token sent by parameter
        token = request.param('token');
    } else if (throwError) { // Otherwise request didn't contain required JWT token
        throw new Error('No authorization header was found');
    }
    return sails.services.markettoken.verify(request, token, next);
};
