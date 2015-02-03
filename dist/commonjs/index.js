"use strict";

var Metadata = require("aurelia-metadata").Metadata;
var _metadata = require("./metadata");

var Transient = _metadata.Transient;
var Singleton = _metadata.Singleton;
exports.Registration = _metadata.Registration;
exports.Transient = _metadata.Transient;
exports.Singleton = _metadata.Singleton;
exports.Resolver = _metadata.Resolver;
exports.Lazy = _metadata.Lazy;
exports.All = _metadata.All;
exports.Optional = _metadata.Optional;
exports.Parent = _metadata.Parent;
exports.Container = require("./container").Container;


Metadata.configure.classHelper("transient", Transient);
Metadata.configure.classHelper("singleton", Singleton);
exports.__esModule = true;