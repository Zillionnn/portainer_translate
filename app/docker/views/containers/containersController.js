angular.module('portainer.docker')
.controller('ContainersController', ['$rootScope', '$scope', 'ContainerService', 'Notifications', 'EndpointProvider',
function ($rootScope, $scope, ContainerService, Notifications, EndpointProvider) {

  $scope.offlineMode = false;

  function initView() {
    ContainerService.containers(1)
    .then(function success(data) {
      $scope.containers = data;
      $scope.offlineMode = EndpointProvider.offlineMode();
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to retrieve containers');

      } else {
          Notifications.error('失败', err, '无法检索容器');

      }
      $scope.containers = [];
    });
  }

  initView();
}]);
