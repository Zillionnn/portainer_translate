angular.module('portainer')
  .config(['$translateProvider','$urlRouterProvider', '$httpProvider', 'localStorageServiceProvider', 'jwtOptionsProvider', 'AnalyticsProvider', '$uibTooltipProvider', '$compileProvider', 'cfpLoadingBarProvider',
  function ($translateProvider, $urlRouterProvider, $httpProvider, localStorageServiceProvider, jwtOptionsProvider, AnalyticsProvider, $uibTooltipProvider, $compileProvider, cfpLoadingBarProvider) {
    'use strict';

    var environment = '@@ENVIRONMENT';
    if (environment === 'production') {
      $compileProvider.debugInfoEnabled(false);
    }
    // var translations = {
    //   CAT: 'cat',
    //   PARAGRAPH: 'Srsly!'
    // };
    // var translationsZH = {
    //   CAT: '猫',
    //   PARAGRAPH: 'Srsly!'
    // };
    ////////////////////
    // $translateProvider.translations('en', translations);
   
    // $translateProvider.translations('zh', translationsZH);
    $translateProvider.useStaticFilesLoader({
      prefix: 'l10n/',
      suffix: '.json'
    });

    $translateProvider.preferredLanguage('en_US');
    /////////////////////



    localStorageServiceProvider
    .setPrefix('portainer');

    jwtOptionsProvider.config({
      tokenGetter: ['LocalStorage', function(LocalStorage) {
        return LocalStorage.getJWT();
      }]
    });
    $httpProvider.interceptors.push('jwtInterceptor');
    $httpProvider.interceptors.push('EndpointStatusInterceptor');
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/json';
    $httpProvider.defaults.headers.put['Content-Type'] = 'application/json';
    $httpProvider.defaults.headers.patch['Content-Type'] = 'application/json';

    $httpProvider.interceptors.push(['HttpRequestHelper', function(HttpRequestHelper) {
      return {
        request: function(config) {
          if (config.url.indexOf('/docker/') > -1) {
            config.headers['X-PortainerAgent-Target'] = HttpRequestHelper.portainerAgentTargetHeader();
          }
          return config;
        }
      };
    }]);

    AnalyticsProvider.setAccount('@@CONFIG_GA_ID');
    AnalyticsProvider.startOffline(true);

    toastr.options.timeOut = 3000;

    Terminal.applyAddon(fit);

    $uibTooltipProvider.setTriggers({
      'mouseenter': 'mouseleave',
      'click': 'click',
      'focus': 'blur',
      'outsideClick': 'outsideClick'
    });

    cfpLoadingBarProvider.includeSpinner = false;
    cfpLoadingBarProvider.parentSelector = '#loadingbar-placeholder';
    cfpLoadingBarProvider.latencyThreshold = 600;

    $urlRouterProvider.otherwise('/auth');
  }]);
