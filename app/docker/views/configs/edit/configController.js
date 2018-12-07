angular.module('portainer.docker')
.controller('ConfigController', ['$rootScope', '$scope', '$transition$', '$state', 'ConfigService', 'Notifications',
function ($rootScope, $scope, $transition$, $state, ConfigService, Notifications) {

  $scope.removeConfig = function removeConfig(configId) {
    ConfigService.remove(configId)
    .then(function success() {
      if($rootScope.language==='en_US'){
        Notifications.success('Config successfully removed');

      } else {
        Notifications.success('配置已成功删除');

      }
      $state.go('docker.configs', {});
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to remove config');

      } else {
          Notifications.error('失败', err, '无法删除配置');

      }
    });
  };

  function initView() {
    ConfigService.config($transition$.params().id)
    .then(function success(data) {
      $scope.config = data;
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to retrieve config details');

      } else {
       Notifications.error('失败', err, '无法检索配置详细信息');

      }
    });
  }

  initView();
}]);
