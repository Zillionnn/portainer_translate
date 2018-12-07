angular.module('portainer')
.run(['$translate', '$rootScope', '$state', 'Authentication', 'authManager', 'StateManager', 'EndpointProvider', 'Notifications', 'Analytics', 'cfpLoadingBar', '$transitions', 'HttpRequestHelper',
function ($translate, $rootScope, $state, Authentication, authManager, StateManager, EndpointProvider, Notifications, Analytics, cfpLoadingBar, $transitions, HttpRequestHelper) {
  // config function
  'use strict';

  EndpointProvider.initialize();
  $rootScope.last_name = 'Cat';
  $rootScope.language = '';
  $rootScope.changeLanguage = function (key) {
    $rootScope.language = key;
    $translate.use(key);
  };

  StateManager.initialize()
  .then(function success(state) {
    if (state.application.authentication) {
      initAuthentication(authManager, Authentication, $rootScope, $state);
    }
    if (state.application.analytics) {
      initAnalytics(Analytics, $rootScope);
    }
  })
  .catch(function error(err) {
    if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to retrieve application settings');

    } else {
      Notifications.error('失败', err, '无法检索应用程序设置');

    }
  });

  $rootScope.$state = $state;

  // Workaround to prevent the loading bar from going backward
  // https://github.com/chieffancypants/angular-loading-bar/issues/273
  var originalSet = cfpLoadingBar.set;
  cfpLoadingBar.set = function overrideSet(n) {
    if (n > cfpLoadingBar.status()) {
      originalSet.apply(cfpLoadingBar, arguments);
    }
  };

  $transitions.onBefore({ to: 'docker.**' }, function() {
    HttpRequestHelper.resetAgentTargetQueue();
  });
}]);


function initAuthentication(authManager, Authentication, $rootScope, $state) {
  authManager.checkAuthOnRefresh();
  Authentication.init();

  // The unauthenticated event is broadcasted by the jwtInterceptor when
  // hitting a 401. We're using this instead of the usual combination of
  // authManager.redirectWhenUnauthenticated() + unauthenticatedRedirector
  // to have more controls on which URL should trigger the unauthenticated state.
  $rootScope.$on('unauthenticated', function () {
    $state.go('portainer.auth', {error: 'Your session has expired'});
  });
}

function initAnalytics(Analytics, $rootScope) {
  Analytics.offline(false);
  Analytics.registerScriptTags();
  Analytics.registerTrackers();
  $rootScope.$on('$stateChangeSuccess', function (event, toState) {
    Analytics.trackPage(toState.url);
    Analytics.pageView();
  });
}
