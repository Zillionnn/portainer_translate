angular.module('portainer.app')
.controller('InitAdminController', ['$rootScope', '$scope', '$state', 'Notifications', 'Authentication', 'StateManager', 'UserService', 'EndpointService',
function ($rootScope, $scope, $state, Notifications, Authentication, StateManager, UserService, EndpointService) {

  $scope.logo = StateManager.getState().application.logo;

  $scope.formValues = {
    Username: 'admin',
    Password: '',
    ConfirmPassword: ''
  };

  $scope.state = {
    actionInProgress: false
  };

  $scope.createAdminUser = function() {
    var username = $scope.formValues.Username;
    var password = $scope.formValues.Password;

    $scope.state.actionInProgress = true;
    UserService.initAdministrator(username, password)
    .then(function success() {
      return Authentication.login(username, password);
    })
    .then(function success() {
      return EndpointService.endpoints();
    })
    .then(function success(data) {
      if (data.length === 0) {
        $state.go('portainer.init.endpoint');
      } else {
        $state.go('portainer.home');
      }
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to create administrator user');

      } else {
        Notifications.error('失败', err, '无法创建管理员用户');
    
      }
    })
    .finally(function final() {
      $scope.state.actionInProgress = false;
    });
  };

  function createAdministratorFlow() {
    UserService.administratorExists()
    .then(function success(exists) {
      if (exists) {
        $state.go('portainer.home');
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
  createAdministratorFlow();
}]);
