angular.module('portainer.app')
.controller('RegistryController', ['$rootScope', '$scope', '$state', '$transition$', '$filter', 'RegistryService', 'Notifications',
function ($rootScope, $scope, $state, $transition$, $filter, RegistryService, Notifications) {

  $scope.state = {
    actionInProgress: false
  };

  $scope.formValues = {
    Password: ''
  };

  $scope.updateRegistry = function() {
    var registry = $scope.registry;
    registry.Password = $scope.formValues.Password;
    $scope.state.actionInProgress = true;
    RegistryService.updateRegistry(registry)
    .then(function success() {
      if($rootScope.language==='en_US'){
      Notifications.success('Registry successfully updated');

      } else {
        Notifications.success('Registry已成功更新');
    
      }
      $state.go('portainer.registries');
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to update registry');

      } else {
        Notifications.error('失败', err, '无法更新registry');
    
      }
    })
    .finally(function final() {
      $scope.state.actionInProgress = false;
    });
  };

  function initView() {
    var registryID = $transition$.params().id;
    RegistryService.registry(registryID)
    .then(function success(data) {
      $scope.registry = data;
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to retrieve registry details');

      } else {
      Notifications.error('失败', err, '无法检索registry详细信息');
      
      }
    });
  }

  initView();
}]);
