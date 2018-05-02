"use strict";
module.exports = Server;

var util = require("../util/minimal");

// Extends EventEmitter
(Server.prototype = Object.create(util.EventEmitter.prototype)).constructor = Server;

/**
 * Constructs a new RPC server instance.
 * @classdesc An RPC server as returned by {@link Server#create}.
 * @exports rpc.Server
 * @extends util.EventEmitter
 * @constructor
 * @param {boolean} [requestDelimited=false] Whether requests are length-delimited
 * @param {boolean} [responseDelimited=false] Whether responses are length-delimited
 */
function Server(requestDelimited, responseDelimited) {

    util.EventEmitter.call(this);

    /**
     * RPC methods. Will be populated in inherited class.
     * @type {boolean}
     */
    this.methods = {};

    /**
     * Whether requests are length-delimited.
     * @type {boolean}
     */
    this.requestDelimited = Boolean(requestDelimited);

    /**
     * Whether responses are length-delimited.
     * @type {boolean}
     */
    this.responseDelimited = Boolean(responseDelimited);
}

/**
 * Calls the correct implementation for a given method
 * @param {string} methodName
 * @param {Uint8Array} requestData
 * @param {RPCImplCallback} callback Callback function
 * @returns {undefined}
 */
Server.prototype.rpcHandler = function rpcCall(methodName, requestData, callback) {

    if (!request)
        throw TypeError("requestData must be specified");

    if (!callback)
        throw TypeError("callback must be specified");
    
    var self = this;
    var method = self.methods[methodName];

    if (!method)
        throw TypeError("method not found");

    try {
        var requestCtor = method.req;
        var responseCtor = method.res;

        self[method](requestCtor[self.requestDelimited ? "encodeDelimited" : "encode"](requestData).finish(),
        function (err, response) {
            if (err) {
                self.emit("error", err, methodName);
                return callback(err);
            }

            if (response === null) {
                return undefined;
            }

            try {
                response = responseCtor[self.responseDelimited ? "decodeDelimited" : "decode"](response);
            } catch (err) {
                self.emit("error", err, method);
                return callback(err);
            }

            self.emit("data", response, methodName);
            return callback(null, response);
        });
    } catch (err) {
        self.emit("error", err, method);
        setTimeout(function() { callback(err); }, 0);
        return undefined;
    }
};
