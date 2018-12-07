angular.module('portainer.docker')
.controller('SecretController', ['$rootScope', '$scope', '$transition$', '$state', 'SecretService', 'Notifications',
function ($rootScope, $scope, $transition$, $state, SecretService, Notifications) {

  $scope.removeSecret = function removeSecret(secretId) {
    SecretService.remove(secretId)
    .then(function success() {
      if($rootScope.language==='en_US'){
      Notifications.success('Secret successfully removed');

      } else {
      Notifications.success('Secret删除成功');

      }
      $state.go('docker.secrets', {});
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to remove secret');

      } else {
      Notifications.error('失败', err, '无法删除secret');
    
      }
    });
  };

  function initView() {
    SecretService.secret($transition$.params().id)
    .then(function success(data) {
      $scope.secret = data;
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to retrieve secret details');

      } else {
          Notifications.error('失败', err, '无法检索secret详细信息');

      }
    });
  }

  initView();
}]);
