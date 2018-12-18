<a name="1.4.2"></a>
## [1.4.2](https://github.com/aurelia/dependency-injection/compare/1.4.1...1.4.2) (2018-12-18)


### Bug Fixes

* **dependency-injection:** add more tests using cases suggested by [@fkleuver](https://github.com/fkleuver) ([ac4e6f9](https://github.com/aurelia/dependency-injection/commit/ac4e6f9)), closes [#171](https://github.com/aurelia/dependency-injection/issues/171)
* **dependency-injection:** adjust based on review ([dc756f4](https://github.com/aurelia/dependency-injection/commit/dc756f4)), closes [#171](https://github.com/aurelia/dependency-injection/issues/171)
* **dependency-injection:** ignore ...rest TypeScript metadata ([c093756](https://github.com/aurelia/dependency-injection/commit/c093756)), closes [#171](https://github.com/aurelia/dependency-injection/issues/171)



<a name="1.4.0"></a>
# [1.4.0](https://github.com/aurelia/dependency-injection/compare/1.3.2...1.4.0) (2018-06-18)


### Bug Fixes

* **injection:** fail with autoinject and own static inject ([e230bda](https://github.com/aurelia/dependency-injection/commit/e230bda))
* **resolver:** use own property 'inject' in autoinject and parameter decorators ([724ff08](https://github.com/aurelia/dependency-injection/commit/724ff08))
* **resolvers:** remove unusable asValue option of the factory decorator ([5739152](https://github.com/aurelia/dependency-injection/commit/5739152))


### Features

* **resolvers:** allow using Factory.of and NewInstance.of with registered handlers ([991cbb5](https://github.com/aurelia/dependency-injection/commit/991cbb5))



<a name="1.3.2"></a>
## [1.3.2](https://github.com/aurelia/dependency-injection/compare/1.3.1...v1.3.2) (2017-08-22)


### Performance Improvements

* **container:** improve dynamic construction of static depencies ([01b2988](https://github.com/aurelia/dependency-injection/commit/01b2988))



<a name="1.3.1"></a>
## [1.3.1](https://github.com/aurelia/dependency-injection/compare/1.3.0...v1.3.1) (2017-04-05)

* Documentation update.

<a name="1.3.0"></a>
# [1.3.0](https://github.com/aurelia/dependency-injection/compare/1.2.1...v1.3.0) (2017-01-12)


### Bug Fixes

* **registrations:** incorrect behavior for auto resolution when... ([708b5fd](https://github.com/aurelia/dependency-injection/commit/708b5fd))



<a name="1.2.1"></a>
## [1.2.1](https://github.com/aurelia/dependency-injection/compare/1.2.0...v1.2.1) (2016-12-13)


### Bug Fixes

* **autoinject:** prevent changing inject of parent classes ([aa38a34](https://github.com/aurelia/dependency-injection/commit/aa38a34))
* **container:** check for custom registration before bubbling ([98739f2](https://github.com/aurelia/dependency-injection/commit/98739f2))



# 1.2.0

## Bug Fixes

* **autoinject**: merge issue caused incorrect branching logic
* **invokers:** remove duplicate export name

<a name="1.1.0"></a>
# [1.1.0](https://github.com/aurelia/dependency-injection/compare/1.0.0...v1.1.0) (2016-10-05)

### Bug Fixes

* **injection:** correct internal loop error and enable inheritence with autoinject

### Features

* **resolvers:** let NewInstance have resolved dynamics dependencies ([0fcda8b](https://github.com/aurelia/dependency-injection/commit/0fcda8b))
* **resolvers:** let NewInstance resolver have dynamics dependencies ([c6275a5](https://github.com/aurelia/dependency-injection/commit/c6275a5))



<a name="1.0.0"></a>
# [1.0.0](https://github.com/aurelia/dependency-injection/compare/1.0.0-rc.1.0.1...v1.0.0) (2016-07-27)


### Bug Fixes

* **injection:** allow combining with [@autoinject](https://github.com/autoinject) ([7219579](https://github.com/aurelia/dependency-injection/commit/7219579))


### Features

* **resolver:** added decorators for lazy, all, optional, parent, factory and newInstance ([24e19a2](https://github.com/aurelia/dependency-injection/commit/24e19a2))
* **resolvers:** add asValue to factory argument decorator ([28db168](https://github.com/aurelia/dependency-injection/commit/28db168))



<a name="1.0.0-rc.1.0.1"></a>
# [1.0.0-rc.1.0.1](https://github.com/aurelia/dependency-injection/compare/1.0.0-rc.1.0.0...v1.0.0-rc.1.0.1) (2016-07-12)


### Bug Fixes

* **Optional:** change checkParent default to true ([a8a8620](https://github.com/aurelia/dependency-injection/commit/a8a8620)), closes [#94](https://github.com/aurelia/dependency-injection/issues/94)


### Features

* **container:** return Resolvers from registration methods ([3fc10cb](https://github.com/aurelia/dependency-injection/commit/3fc10cb)), closes [#82](https://github.com/aurelia/dependency-injection/issues/82)



<a name="1.0.0-rc.1.0.0"></a>
# [1.0.0-rc.1.0.0](https://github.com/aurelia/dependency-injection/compare/1.0.0-beta.2.1.1...v1.0.0-rc.1.0.0) (2016-06-22)



### 1.0.0-beta.1.2.3 (2016-05-10)


### 1.0.0-beta.1.2.2 (2016-04-29)

* docs update

### 1.0.0-beta.1.2.1 (2016-04-29)

* docs release

### 1.0.0-beta.1.2.0 (2016-03-22)


#### Features

* **inheritence:** allow injection w/ inheritence ([0615ac1d](http://github.com/aurelia/dependency-injection/commit/0615ac1db4c2f2e91fc1bb028217cc3540a8e6c7))


### 1.0.0-beta.1.1.5 (2016-03-04)


#### Features

* **resolver:** add factory resolver ([0d59042d](http://github.com/aurelia/dependency-injection/commit/0d59042dff1d4987c67be789e0688b6e85ce587a))


### 1.0.0-beta.1.1.4 (2016-03-01)


#### Bug Fixes

* **all:** remove core-js dependency ([4dff5f15](http://github.com/aurelia/dependency-injection/commit/4dff5f15761485ca744f82b950f9b6e9e719350e))


### 1.0.0-beta.1.1.3 (2016-02-08)


### 1.0.0-beta.1.1.1 (2016-01-28)

* fix package metadata for jspm

### 1.0.0-beta.1.1.0 (2016-01-28)


#### Bug Fixes

* **container:** correct inconsistent return type from getAll ([bbbef9e5](http://github.com/aurelia/dependency-injection/commit/bbbef9e582e4a81497db5655c7a7e9d2d1e5c10a), closes [#71](http://github.com/aurelia/dependency-injection/issues/71))


#### Features

* **all:** update for jspm; update core-js; update aurelia deps ([11d16867](http://github.com/aurelia/dependency-injection/commit/11d1686765c626896dbb3d5edb7f5b40da9dd5ca))


### 1.0.0-beta.1.0.1 (2016-01-08)

* minor perf work

### 1.0.0-beta.1 (2015-11-16)


### 0.12.1 (2015-11-11)


#### Bug Fixes

* **all:** TS fixes for decorators ([04257368](http://github.com/aurelia/dependency-injection/commit/0425736875302f80c0216c7caaa9421182f4184d))


## 0.12.0 (2015-11-09)


#### Bug Fixes

* **container:** bug with build combining and renamed imports ([090c041a](http://github.com/aurelia/dependency-injection/commit/090c041a53cd7d653cf034aa753ce90e9c0b3df1))
* **resolvers:** typo in resolver protocol name ([befe9668](http://github.com/aurelia/dependency-injection/commit/befe966899781d3c54710e75b901ebf0ebaa8d34))


#### Features

* **all:**
  * further refining of data structures and hooks; api lockdown and docs complete ([0ee0c34c](http://github.com/aurelia/dependency-injection/commit/0ee0c34cb0b63f5ca89a5ddca9c2a34cf6ed6ebc))
  * new resolver marker, fixed registrations, onActivate hook, invokers ([ca5ccf7d](http://github.com/aurelia/dependency-injection/commit/ca5ccf7d03e907ce9fb794dcbe9f0065ceba3c43))


### 0.11.2 (2015-10-15)


#### Bug Fixes

* **registrations:** move configuration to correct instance ([e6d4b542](http://github.com/aurelia/dependency-injection/commit/e6d4b5420aec12940fbce21852a44c248deb4340))


### 0.11.1 (2015-10-15)


#### Bug Fixes

* **registrations:** properly handle registrations that want to target different containers ([b60c1039](http://github.com/aurelia/dependency-injection/commit/b60c10392588b49b6b3ea2fb20c75c27c2a73bb5))


## 0.11.0 (2015-10-13)


#### Bug Fixes

* repair error msg for broken view model ([60880447](http://github.com/aurelia/dependency-injection/commit/60880447d758ebe2ce003bee4a5714557957045e))
* **Container:** remove new in function call ([08cd06fd](http://github.com/aurelia/dependency-injection/commit/08cd06fd6393e8941a2a2a0df012df3a209eedda))
* **all:**
  * update to latest metadata api ([bfa78327](http://github.com/aurelia/dependency-injection/commit/bfa78327ffd2992f18214ab6da0e25f37559cfc0))
  * address lint errors ([d2e36a57](http://github.com/aurelia/dependency-injection/commit/d2e36a5704a0f890142021fba4d2f0bc9d9dc67a))
  * improve some type info ([2aa55dea](http://github.com/aurelia/dependency-injection/commit/2aa55deaedee4fbc2a948df1547449cae7d49bd5))
  * switch to new metadata abstraction ([05f3bfde](http://github.com/aurelia/dependency-injection/commit/05f3bfde7b032d83df14eb7b23b6292534c91c02))
  * update compiler to latest version ([b6a3dd03](http://github.com/aurelia/dependency-injection/commit/b6a3dd034ce3b55a08770b969af2f113803cbd0e))
  * explicit import of core-js and switch to Reflect.construct ([5ebe60be](http://github.com/aurelia/dependency-injection/commit/5ebe60be9170dd8ecf34b19dc9b6e88144dfc13b))
  * switch to metadata api ([19c60ad9](http://github.com/aurelia/dependency-injection/commit/19c60ad976a6bd8216dfbddbe8f7ac12ca1325d2))
* **bower:** correct semver range ([3b7670c3](http://github.com/aurelia/dependency-injection/commit/3b7670c3ead8cc1b5e41874029f1e6fef86ed187))
* **build:**
  * update linting, testing and tools ([97d032c8](http://github.com/aurelia/dependency-injection/commit/97d032c85c747e25eb1bcd87d46f211916d2f239))
  * add missing bower bump ([39ab3d07](http://github.com/aurelia/dependency-injection/commit/39ab3d07d0c0d893206f61ebfe4f658a66303895))
* **container:**
  * improved alias handling ([a2eb66c3](http://github.com/aurelia/dependency-injection/commit/a2eb66c34ec05112ab9d702d2ee211b6a7f7714d))
  * prevent a breaking api change ([9198b164](http://github.com/aurelia/dependency-injection/commit/9198b1649d0e2405da32600e5aca3960f7bd1834))
  * add generics to Map type info ([072262ef](http://github.com/aurelia/dependency-injection/commit/072262ef7ca9656739e9bbda49fd3d75ba6c113c))
  * dry out bad key error message ([58a1036f](http://github.com/aurelia/dependency-injection/commit/58a1036f5e52eadfc1b3bd65a22ebaebf94d715c))
  * Improve error message on bad key for DI ([6495ad3b](http://github.com/aurelia/dependency-injection/commit/6495ad3b84938ea66749e07f8c271b87e0a53074), closes [#36](http://github.com/aurelia/dependency-injection/issues/36))
  * enable autoregister of non-functions ([c40ac432](http://github.com/aurelia/dependency-injection/commit/c40ac432ca6c3d63ccddb6c6c5bcaa2ffa6c5ba9), closes [#31](http://github.com/aurelia/dependency-injection/issues/31))
  * remove initialize hack ([5c9fdd09](http://github.com/aurelia/dependency-injection/commit/5c9fdd09dd1d0848da0b24c694c95e20ca82c01c))
  * better errors for instantiation failures ([8c5e3a64](http://github.com/aurelia/dependency-injection/commit/8c5e3a647bb4354f2c420d37e405792b9cc8601f))
  * factories are explicit ([667a16e4](http://github.com/aurelia/dependency-injection/commit/667a16e4dbd07b75493e0690ac4232d8c0cb508c), closes [#13](http://github.com/aurelia/dependency-injection/issues/13))
  * remove bogus createTypedChild api ([42b2ae2a](http://github.com/aurelia/dependency-injection/commit/42b2ae2a1507672f95503c0bc9257c755324a520))
  * discover registration attributes on base classes ([b7af69d1](http://github.com/aurelia/dependency-injection/commit/b7af69d101bad032acaf41e37140e57e52b6c07f))
* **decorators:** remove unnecessary returns ([150607d1](http://github.com/aurelia/dependency-injection/commit/150607d1cde449b8065440d5ca90b1a0a8e07721))
* **dependency-injection:** Use correct import for core-js We were previously using `import core from core-j ([625c1eea](http://github.com/aurelia/dependency-injection/commit/625c1eea4d2b90b7fbb22ebb75fb9feec3676829))
* **emptyParameters:** import from ./container ([7d4cfc92](http://github.com/aurelia/dependency-injection/commit/7d4cfc929514519138cc1af36661951dd5ff42c8))
* **optional:** add Optional annotation to public api ([1d688334](http://github.com/aurelia/dependency-injection/commit/1d688334ac5fe16ec692fe8a4bb09d63a7698632))
* **package:**
  * update aurelia tools and dts generator ([83c1e2cb](http://github.com/aurelia/dependency-injection/commit/83c1e2cb096ce8f6802d78419a5e9f0afb895776))
  * change jspm directories ([cef0da35](http://github.com/aurelia/dependency-injection/commit/cef0da351e26aa549e45b48dc6cd98e3e6b6fcaa))
  * update dependencies ([25e924ca](http://github.com/aurelia/dependency-injection/commit/25e924caccdfd033657047a22b93428b90363700))
  * update dependencies ([247d9ff9](http://github.com/aurelia/dependency-injection/commit/247d9ff925af07488d9ce6337e64e977370ab43a))
  * update Aurelia dependencies ([ccf09589](http://github.com/aurelia/dependency-injection/commit/ccf09589cfdd76ac77df12fad7e4ae6383000f48))
  * change doc json media type ([b82feb82](http://github.com/aurelia/dependency-injection/commit/b82feb82f758ddc820039d7e32b1079908706020))
  * update dependencies to latest ([54a0bda1](http://github.com/aurelia/dependency-injection/commit/54a0bda1a217200c07cbee81193b044038b2b09a))
  * add es6-shim polyfill ([4732acee](http://github.com/aurelia/dependency-injection/commit/4732acee560080be01ea579ac5124e63079e8571))
* **singleton:** alway register in the root container ([186b573e](http://github.com/aurelia/dependency-injection/commit/186b573e0e3d09f57bedf8fd7c37ab862dc2f5d1), closes [#22](http://github.com/aurelia/dependency-injection/issues/22))
* **util:**
  * fix ridiculously dumb error ([8cfe89f0](http://github.com/aurelia/dependency-injection/commit/8cfe89f0de5d2d6101f5421bf941dc84352bba9d))
  * function name polyfill should minify correctly ([85358c53](http://github.com/aurelia/dependency-injection/commit/85358c5359ddc0a069c4d049fd28d760052cb437))


#### Features

* **all:**
  * add pal dependency ([e2e1b6f9](http://github.com/aurelia/dependency-injection/commit/e2e1b6f9654ea26223a3ab5a7a9d5ca884e0e927))
  * new implementation ([481b29b9](http://github.com/aurelia/dependency-injection/commit/481b29b9a15518c82915c5f5a19a9958762e1b3e))
  * update to using the new metadata api ([51bfdd1e](http://github.com/aurelia/dependency-injection/commit/51bfdd1e1042178a301346a263b642e14aa5f394))
  * add decorator support ([120e61a3](http://github.com/aurelia/dependency-injection/commit/120e61a3aa686cee4a2cb7008a59d3b0eab8fb1c))
  * update to fluent metadata and add helpers ([8e3b7576](http://github.com/aurelia/dependency-injection/commit/8e3b7576bd7fda89bec4b2c79154c6a7a296a6aa))
* **annotations:** add optional resolver ([27a580d3](http://github.com/aurelia/dependency-injection/commit/27a580d38d1ea899fd10ba4dbe80639dda1422e0))
* **build:** update compiler and switch to register module format ([e959d7bb](http://github.com/aurelia/dependency-injection/commit/e959d7bb8f06cdc4bee5ee48afa5bdb62ed79ab3))
* **container:**
  * add ability to register aliases for any DI key ([d4451482](http://github.com/aurelia/dependency-injection/commit/d4451482ea8c9f48000e40cf7cdbdc850ec3c09e))
  * enable the invoke helper to take additional deps ([eec36d2a](http://github.com/aurelia/dependency-injection/commit/eec36d2a69e3ca35eef4798d91e66192dcb103d6))
  * turn a container instance into a globally reachable singleton instance ([3c02164b](http://github.com/aurelia/dependency-injection/commit/3c02164bdb04c2e0b9f3927f20cec453e67e6833))
  * improve helpfulness of activation errors ([47aa4871](http://github.com/aurelia/dependency-injection/commit/47aa48711a905101b83452daa5ded82242c186bd))
  * remove AtScript support ([6ed8891a](http://github.com/aurelia/dependency-injection/commit/6ed8891a3543d800475674343869c2e34e66107f))
  * use new logging AggregateError ([6e2548ef](http://github.com/aurelia/dependency-injection/commit/6e2548ef6f6b0e339f53793db1c76dc81ef6650c))
  * add unregister method ([2755688c](http://github.com/aurelia/dependency-injection/commit/2755688ce0a2bd13ef71adcda5ed7fa05092d3b4), closes [#19](http://github.com/aurelia/dependency-injection/issues/19))
  * consume atscript annotation parameters as arrays ([7303cb36](http://github.com/aurelia/dependency-injection/commit/7303cb36599873ec14fac9dd020b7aafe1e7d756), closes [#15](http://github.com/aurelia/dependency-injection/issues/15))
  * enable custom class init before constructor ([33b4cc1c](http://github.com/aurelia/dependency-injection/commit/33b4cc1c48502d5a321aced22111b4f5251f648d))
  * enable simple registration when key and value are the same ([9f1f502c](http://github.com/aurelia/dependency-injection/commit/9f1f502c9fa67d832b9b28397cbc1e3b5edc7082))
* **cotainer:** add InstanceActivator abstraction ([0fc2a317](http://github.com/aurelia/dependency-injection/commit/0fc2a3178183169ebb2c067c142e9cc7b3645e02))
* **docs:** generate api.json from .d.ts file ([c6acb7cf](http://github.com/aurelia/dependency-injection/commit/c6acb7cf6cca87343217aafdcea82321ec39ea71))
* **metadata:**  singleton metadata can now indicate root container target ([4a99d4f5](http://github.com/aurelia/dependency-injection/commit/4a99d4f5694ddeeba89a63331f1fb651b7df4b8c))
* **package:** switch from es6-shim to core-js ([90a501d4](http://github.com/aurelia/dependency-injection/commit/90a501d42409e50703c869e98ed8431b8ccb54d8))
* **resolver:** add parent resolver ([f035f1f5](http://github.com/aurelia/dependency-injection/commit/f035f1f5dece5c0316f18500e28ad37bdf9ac066))


#### Breaking Changes

* Removed base classes for registrations and instance
activators since metadata now uses key/value pairs rather than
inheritance.

 ([51bfdd1e](http://github.com/aurelia/dependency-injection/commit/51bfdd1e1042178a301346a263b642e14aa5f394))


### 0.10.1 (2015-09-06)


#### Bug Fixes

* repair error msg for broken view model ([60880447](http://github.com/aurelia/dependency-injection/commit/60880447d758ebe2ce003bee4a5714557957045e))


## 0.10.0 (2015-09-04)


#### Bug Fixes

* **all:** address lint errors ([d2e36a57](http://github.com/aurelia/dependency-injection/commit/d2e36a5704a0f890142021fba4d2f0bc9d9dc67a))
* **build:** update linting, testing and tools ([97d032c8](http://github.com/aurelia/dependency-injection/commit/97d032c85c747e25eb1bcd87d46f211916d2f239))


#### Features

* **docs:** generate api.json from .d.ts file ([c6acb7cf](http://github.com/aurelia/dependency-injection/commit/c6acb7cf6cca87343217aafdcea82321ec39ea71))


### 0.9.2 (2015-08-14)


#### Bug Fixes

* **all:** improve some type info ([2aa55dea](http://github.com/aurelia/dependency-injection/commit/2aa55deaedee4fbc2a948df1547449cae7d49bd5))
* **dependency-injection:** Use correct import for core-js We were previously using `import core from core-j ([625c1eea](http://github.com/aurelia/dependency-injection/commit/625c1eea4d2b90b7fbb22ebb75fb9feec3676829))


### 0.9.1 (2015-07-29)

* improve output file name

## 0.9.0 (2015-07-01)


#### Bug Fixes

* **all:** switch to new metadata abstraction ([05f3bfde](http://github.com/aurelia/dependency-injection/commit/05f3bfde7b032d83df14eb7b23b6292534c91c02))
* **container:**
  * add generics to Map type info ([072262ef](http://github.com/aurelia/dependency-injection/commit/072262ef7ca9656739e9bbda49fd3d75ba6c113c))
  * dry out bad key error message ([58a1036f](http://github.com/aurelia/dependency-injection/commit/58a1036f5e52eadfc1b3bd65a22ebaebf94d715c))
  * Improve error message on bad key for DI ([6495ad3b](http://github.com/aurelia/dependency-injection/commit/6495ad3b84938ea66749e07f8c271b87e0a53074), closes [#36](http://github.com/aurelia/dependency-injection/issues/36))
* **package:** update aurelia tools and dts generator ([83c1e2cb](http://github.com/aurelia/dependency-injection/commit/83c1e2cb096ce8f6802d78419a5e9f0afb895776))


#### Features

* **container:**
  * enable the invoke helper to take additional deps ([eec36d2a](http://github.com/aurelia/dependency-injection/commit/eec36d2a69e3ca35eef4798d91e66192dcb103d6))
  * turn a container instance into a globally reachable singleton instance ([3c02164b](http://github.com/aurelia/dependency-injection/commit/3c02164bdb04c2e0b9f3927f20cec453e67e6833))


## 0.8.0 (2015-06-08)


#### Bug Fixes

* **container:** enable autoregister of non-functions ([c40ac432](http://github.com/aurelia/dependency-injection/commit/c40ac432ca6c3d63ccddb6c6c5bcaa2ffa6c5ba9), closes [#31](http://github.com/aurelia/dependency-injection/issues/31))


#### Features

* **container:** improve helpfulness of activation errors ([47aa4871](http://github.com/aurelia/dependency-injection/commit/47aa48711a905101b83452daa5ded82242c186bd))


### 0.7.1 (2015-05-06)


#### Bug Fixes

* **emptyParameters:** import from ./container ([7d4cfc92](http://github.com/aurelia/dependency-injection/commit/7d4cfc929514519138cc1af36661951dd5ff42c8))


## 0.7.0 (2015-04-30)


#### Features

* **all:** update to using the new metadata api ([51bfdd1e](http://github.com/aurelia/dependency-injection/commit/51bfdd1e1042178a301346a263b642e14aa5f394))


#### Breaking Changes

* Removed base classes for registrations and instance
activators since metadata now uses key/value pairs rather than
inheritance.

 ([51bfdd1e](http://github.com/aurelia/dependency-injection/commit/51bfdd1e1042178a301346a263b642e14aa5f394))


## 0.6.0 (2015-04-09)


#### Bug Fixes

* **Container:** remove new in function call ([08cd06fd](http://github.com/aurelia/dependency-injection/commit/08cd06fd6393e8941a2a2a0df012df3a209eedda))
* **all:**
  * update compiler to latest version ([b6a3dd03](http://github.com/aurelia/dependency-injection/commit/b6a3dd034ce3b55a08770b969af2f113803cbd0e))
  * explicit import of core-js and switch to Reflect.construct ([5ebe60be](http://github.com/aurelia/dependency-injection/commit/5ebe60be9170dd8ecf34b19dc9b6e88144dfc13b))
* **container:** remove initialize hack ([5c9fdd09](http://github.com/aurelia/dependency-injection/commit/5c9fdd09dd1d0848da0b24c694c95e20ca82c01c))
* **decorators:** remove unnecessary returns ([150607d1](http://github.com/aurelia/dependency-injection/commit/150607d1cde449b8065440d5ca90b1a0a8e07721))


#### Features

* **all:** add decorator support ([120e61a3](http://github.com/aurelia/dependency-injection/commit/120e61a3aa686cee4a2cb7008a59d3b0eab8fb1c))
* **container:** remove AtScript support ([6ed8891a](http://github.com/aurelia/dependency-injection/commit/6ed8891a3543d800475674343869c2e34e66107f))
* **cotainer:** add InstanceActivator abstraction ([0fc2a317](http://github.com/aurelia/dependency-injection/commit/0fc2a3178183169ebb2c067c142e9cc7b3645e02))


### 0.5.1 (2015-03-27)


#### Bug Fixes

* **container:** better errors for instantiation failures ([8c5e3a64](http://github.com/aurelia/dependency-injection/commit/8c5e3a647bb4354f2c420d37e405792b9cc8601f))


## 0.5.0 (2015-03-24)


#### Bug Fixes

* **container:** factories are explicit ([667a16e4](http://github.com/aurelia/dependency-injection/commit/667a16e4dbd07b75493e0690ac4232d8c0cb508c), closes [#13](http://github.com/aurelia/dependency-injection/issues/13))
* **singleton:** always register in the root container ([186b573e](http://github.com/aurelia/dependency-injection/commit/186b573e0e3d09f57bedf8fd7c37ab862dc2f5d1), closes [#22](http://github.com/aurelia/dependency-injection/issues/22))


#### Features

* **container:**
  * use new logging AggregateError ([6e2548ef](http://github.com/aurelia/dependency-injection/commit/6e2548ef6f6b0e339f53793db1c76dc81ef6650c))
  * add unregister method ([2755688c](http://github.com/aurelia/dependency-injection/commit/2755688ce0a2bd13ef71adcda5ed7fa05092d3b4), closes [#19](http://github.com/aurelia/dependency-injection/issues/19))


### 0.4.5 (2015-02-28)


#### Bug Fixes

* **package:** change jspm directories ([cef0da35](http://github.com/aurelia/dependency-injection/commit/cef0da351e26aa549e45b48dc6cd98e3e6b6fcaa))


### 0.4.4 (2015-02-27)


#### Bug Fixes

* **package:** update dependencies ([25e924ca](http://github.com/aurelia/dependency-injection/commit/25e924caccdfd033657047a22b93428b90363700))


### 0.4.3 (2015-02-18)


#### Bug Fixes

* **build:** add missing bower bump ([39ab3d07](http://github.com/aurelia/dependency-injection/commit/39ab3d07d0c0d893206f61ebfe4f658a66303895))


#### Features

* **metadata:**  singleton metadata can now indicate root container target ([4a99d4f5](http://github.com/aurelia/dependency-injection/commit/4a99d4f5694ddeeba89a63331f1fb651b7df4b8c))


### 0.4.2 (2015-02-03)


#### Bug Fixes

* **util:**
  * fix ridiculously dumb error ([8cfe89f0](http://github.com/aurelia/dependency-injection/commit/8cfe89f0de5d2d6101f5421bf941dc84352bba9d))
  * function name polyfill should minify correctly ([85358c53](http://github.com/aurelia/dependency-injection/commit/85358c5359ddc0a069c4d049fd28d760052cb437))


#### Features

* **container:** consume atscript annotation parameters as arrays ([7303cb36](http://github.com/aurelia/dependency-injection/commit/7303cb36599873ec14fac9dd020b7aafe1e7d756), closes [#15](http://github.com/aurelia/dependency-injection/issues/15))


### 0.4.1 (2015-01-24)


#### Bug Fixes

* **bower:** correct semver range ([3b7670c3](http://github.com/aurelia/dependency-injection/commit/3b7670c3ead8cc1b5e41874029f1e6fef86ed187))


## 0.4.0 (2015-01-22)


#### Bug Fixes

* **all:** switch to metadata api ([19c60ad9](http://github.com/aurelia/dependency-injection/commit/19c60ad976a6bd8216dfbddbe8f7ac12ca1325d2))
* **package:** update dependencies ([247d9ff9](http://github.com/aurelia/dependency-injection/commit/247d9ff925af07488d9ce6337e64e977370ab43a))


#### Features

* **all:** update to fluent metadata and add helpers ([8e3b7576](http://github.com/aurelia/dependency-injection/commit/8e3b7576bd7fda89bec4b2c79154c6a7a296a6aa))
* **container:** enable custom class init before constructor ([33b4cc1c](http://github.com/aurelia/dependency-injection/commit/33b4cc1c48502d5a321aced22111b4f5251f648d))


### 0.3.1 (2015-01-12)

* Update compiled output.


## 0.3.0 (2015-01-12)


#### Bug Fixes

* **container:** remove bogus createTypedChild api ([42b2ae2a](http://github.com/aurelia/dependency-injection/commit/42b2ae2a1507672f95503c0bc9257c755324a520))
* **package:** update Aurelia dependencies ([ccf09589](http://github.com/aurelia/dependency-injection/commit/ccf09589cfdd76ac77df12fad7e4ae6383000f48))


#### Features

* **resolver:** add parent resolver ([f035f1f5](http://github.com/aurelia/dependency-injection/commit/f035f1f5dece5c0316f18500e28ad37bdf9ac066))


### 0.2.1 (2015-01-06)


#### Bug Fixes

* **package:** change doc json media type ([b82feb82](http://github.com/aurelia/dependency-injection/commit/b82feb82f758ddc820039d7e32b1079908706020))


## 0.2.0 (2015-01-06)


#### Bug Fixes

* **container:** discover registration attributes on base classes ([b7af69d1](http://github.com/aurelia/dependency-injection/commit/b7af69d101bad032acaf41e37140e57e52b6c07f))
* **optional:** add Optional annotation to public api ([1d688334](http://github.com/aurelia/dependency-injection/commit/1d688334ac5fe16ec692fe8a4bb09d63a7698632))


#### Features

* **annotations:** add optional resolver ([27a580d3](http://github.com/aurelia/dependency-injection/commit/27a580d38d1ea899fd10ba4dbe80639dda1422e0))
* **build:** update compiler and switch to register module format ([e959d7bb](http://github.com/aurelia/dependency-injection/commit/e959d7bb8f06cdc4bee5ee48afa5bdb62ed79ab3))
* **container:** enable simple registration when key and value are the same ([9f1f502c](http://github.com/aurelia/dependency-injection/commit/9f1f502c9fa67d832b9b28397cbc1e3b5edc7082))
* **package:** switch from es6-shim to core-js ([90a501d4](http://github.com/aurelia/dependency-injection/commit/90a501d42409e50703c869e98ed8431b8ccb54d8))


### 0.1.1 (2014-12-17)


#### Bug Fixes

* **package:** update dependencies to latest ([54a0bda1](http://github.com/aurelia/dependency-injection/commit/54a0bda1a217200c07cbee81193b044038b2b09a))


## 0.1.0 (2014-12-11)


#### Bug Fixes

* **package:** add es6-shim polyfill ([4732acee](http://github.com/aurelia/dependency-injection/commit/4732acee560080be01ea579ac5124e63079e8571))
