"use strict";

var Metadata = require("aurelia-metadata").Metadata;
var Transient = require("./metadata").Transient;
var Singleton = require("./metadata").Singleton;
exports.Registration = require("./metadata").Registration;
exports.Transient = require("./metadata").Transient;
exports.Singleton = require("./metadata").Singleton;
exports.Resolver = require("./metadata").Resolver;
exports.Lazy = require("./metadata").Lazy;
exports.All = require("./metadata").All;
exports.Optional = require("./metadata").Optional;
exports.Parent = require("./metadata").Parent;
exports.Container = require("./container").Container;


Metadata.configure.classHelper("transient", Transient);
Metadata.configure.classHelper("singleton", Singleton);