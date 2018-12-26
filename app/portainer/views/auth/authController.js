angular.module('portainer.app')
.controller('AuthenticationController', ['$rootScope', '$q', '$scope', '$state', '$transition$', '$sanitize', 'Authentication', 'UserService', 'EndpointService', 'StateManager', 'Notifications', 'SettingsService',
function ($rootScope, $q, $scope, $state, $transition$, $sanitize, Authentication, UserService, EndpointService, StateManager, Notifications, SettingsService) {

  $scope.logo = StateManager.getState().application.logo;

  $scope.formValues = {
    Username: '',
    Password: ''
  };

  $scope.state = {
    AuthenticationError: ''
  };

  $scope.authenticateUser = function() {
    var username = $scope.formValues.Username;
    var password = $scope.formValues.Password;

    Authentication.login(username, password)
    .then(function success() {
      checkForEndpoints();
    })
    .catch(function error(err) {
      console.error('err', err);
      $state.go('portainer.home');
      checkForEndpoints();
      SettingsService.publicSettings()
      .then(function success(settings) {
        if (settings.AuthenticationMethod === 1) {
          return Authentication.login($sanitize(username), $sanitize(password));
        }
        return $q.reject();
      })
      .then(function success() {
        $state.go('portainer.updatePassword');
      })
      .catch(function error() {
        $scope.state.AuthenticationError = 'Invalid credentials';
      });
    });
  };

  function unauthenticatedFlow() {
    EndpointService.endpoints()
    .then(function success(endpoints) {
      if (endpoints.length === 0) {
        $state.go('portainer.init.endpoint');
      } else {
        $state.go('portainer.home');
      }
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to retrieve endpoints');

      } else {
        Notifications.error('失败', err, '无法检索端点');
    
      }
    });
  }

  function authenticatedFlow() {
    UserService.administratorExists()
    .then(function success(exists) {
      if (!exists) {
        $state.go('portainer.init.admin');
      }
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to verify administrator account existence');

      } else {
        Notifications.error('失败', err, '无法验证管理员帐户是否存在');
    
      }
    });
  }

  function checkForEndpoints() {
    EndpointService.endpoints()
    .then(function success(data) {
      var endpoints = data;
      var userDetails = Authentication.getUserDetails();

      if (endpoints.length === 0 && userDetails.role === 1) {
        $state.go('portainer.init.endpoint');
      } else {
        $state.go('portainer.home');
      }
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to retrieve endpoints');

      } else {
      Notifications.error('失败', err, '无法检索端点');
      
      }
    });
  }

  function initView() {
    if ($transition$.params().logout || $transition$.params().error) {
      Authentication.logout();
      $scope.state.AuthenticationError = $transition$.params().error;
      return;
    }

    if (Authentication.isAuthenticated()) {
      $state.go('portainer.home');
    }

    var authenticationEnabled = $scope.applicationState.application.authentication;
    if (!authenticationEnabled) {
      unauthenticatedFlow();
    } else {
      authenticatedFlow();
    }
  }

  initView();
}]);
