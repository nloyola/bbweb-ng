// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

const path = require('path');

if (!process.env.CHROME_BIN || (process.env.CHROME_BIN === '')) {
  process.env.CHROME_BIN = require('puppeteer').executablePath();
}


module.exports = function (config) {
  config.set({
    basePath: '',
    client: {
      captureConsole: false,
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    coverageIstanbulReporter: {
      dir: path.join(__dirname, '../coverage'),
      reports: ['html', 'lcovonly'],
      fixWebpackSourcePaths: true
    },
    customLaunchers: {
      Chrome_with_debugging: {
        base: 'Chrome',
        chromeDataDir: path.resolve(__dirname, '../.chrome')
      }
    },
    reporters: ['dots', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    autoWatchBatchDelay: 1000,
    //browsers: ['Chrome'],
    browsers: ['ChromeHeadless'],
    singleRun: false
  });
};
