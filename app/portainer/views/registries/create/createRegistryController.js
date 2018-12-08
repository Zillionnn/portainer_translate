angular.module('portainer.app')
.controller('CreateRegistryController', ['$rootScope', '$scope', '$state', 'RegistryService', 'Notifications',
function ($rootScope, $scope, $state, RegistryService, Notifications) {

  $scope.state = {
    RegistryType: 'quay',
    actionInProgress: false
  };

  $scope.formValues = {
    Name: 'Quay',
    URL: 'quay.io',
    Authentication: true,
    Username: '',
    Password: ''
  };

  $scope.selectQuayRegistry = function() {
    $scope.formValues.Name = 'Quay';
    $scope.formValues.URL = 'quay.io';
    $scope.formValues.Authentication = true;
  };

  $scope.selectCustomRegistry = function() {
    $scope.formValues.Name = '';
    $scope.formValues.URL = '';
    $scope.formValues.Authentication = false;
  };

  $scope.addRegistry = function() {
    var registryName = $scope.formValues.Name;
    var registryURL = $scope.formValues.URL.replace(/^https?\:\/\//i, '');
    var authentication = $scope.formValues.Authentication;
    var username = $scope.formValues.Username;
    var password = $scope.formValues.Password;

    $scope.state.actionInProgress = true;
    RegistryService.createRegistry(registryName, registryURL, authentication, username, password)
    .then(function success() {
      if($rootScope.language==='en_US'){
      Notifications.success('Registry successfully created');

      } else {
      Notifications.success('Registry成功创建');
      
      }
      $state.go('portainer.registries');
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to create registry');

      } else {
      Notifications.error('失败', err, '无法创建registry');
      
      }
    })
    .finally(function final() {
      $scope.state.actionInProgress = false;
    });
  };
}]);
