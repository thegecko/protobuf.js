"use strict";
module.exports = server_module_target;

// - The default wrapper supports AMD, CommonJS and the global scope (as window.root), in this order.
// - You can specify a custom wrapper with the --wrap argument.
// - CommonJS modules depend on the minimal build for reduced package size with browserify.
// - AMD and global scope depend on the full library for now.

var util = require("../util");

var protobuf = require("../..");

server_module_target.description = "Static server code without reflection as a module";

function server_module_target(root, options, callback) {
    require("./server")(root, options, function(err, output) {
        if (err) {
            callback(err);
            return;
        }
        try {
            output = util.wrap(output, protobuf.util.merge({ dependency: "protobufjs/minimal" }, options));
        } catch (e) {
            callback(e);
            return;
        }
        callback(null, output);
    });
}
