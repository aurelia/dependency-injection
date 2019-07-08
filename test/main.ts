let allTestFiles: string[] = [];
let TEST_REGEXP = /^\/base\/dist\/test\/test\/[^\/]+\.js$/i;

interface Window {
  __karma__: any;
  require: any;
}

// Get a list of all the test files to include
Object.keys(window.__karma__.files).forEach(file => {
  if (TEST_REGEXP.test(file) && file !== '/base/dist/test/test/main.js') {
    // Normalize paths to RequireJS module names.
    // If you require sub-dependencies of test files to be loaded as-is (requiring file extension)
    // then do not normalize the paths
    const normalizedTestModule = file.replace(/^\/base\/|\.js$/g, '');
    allTestFiles.push(normalizedTestModule);
  }
});

let started = false;

window.require.config({
  // Karma serves files under /base, which is the basePath from your config file
  baseUrl: '/base',

  deps: ['aurelia-pal-browser', 'aurelia-polyfills'],

  // we have to kickoff jasmine, as it is asynchronous
  callback: (pal: { initialize: () => void; }) => {
    if (started) {
      return;
    }
    started = true;
    pal.initialize();
    window.require(allTestFiles, () => window.__karma__.start());
  },
  paths: {
    /* tslint:disable:max-line-length */
    'aurelia-metadata': '/base/node_modules/aurelia-metadata/dist/amd/aurelia-metadata',
    'aurelia-pal': '/base/node_modules/aurelia-pal/dist/amd/aurelia-pal',
    'aurelia-pal-browser': '/base/node_modules/aurelia-pal-browser/dist/amd/aurelia-pal-browser',
    'aurelia-polyfills': '/base/node_modules/aurelia-polyfills/dist/amd/aurelia-polyfills',
    'tslib': '/base/node_modules/tslib/tslib',
    /* tslint:enable:max-line-length */
    /* tslint:disable */
    'text': '/base/node_modules/requirejs-text/text',
    /* tslint:enable */
  },
  packages: [  ]
});
