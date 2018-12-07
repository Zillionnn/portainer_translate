angular.module('portainer.docker')
.controller('SecretsController', ['$rootScope', '$scope', '$state', 'SecretService', 'Notifications',
function ($rootScope, $scope, $state, SecretService, Notifications) {

  $scope.removeAction = function (selectedItems) {
    var actionCount = selectedItems.length;
    angular.forEach(selectedItems, function (secret) {
      SecretService.remove(secret.Id)
      .then(function success() {
        if($rootScope.language==='en_US'){
        Notifications.success('Secret successfully removed', secret.Name);

        } else {
            Notifications.success('Secret删除成功', secret.Name);
  
        }
        var index = $scope.secrets.indexOf(secret);
        $scope.secrets.splice(index, 1);
      })
      .catch(function error(err) {
        if($rootScope.language==='en_US'){
        Notifications.error('Failure', err, 'Unable to remove secret');

        } else {
              Notifications.error('失败', err, '无法删除secret');

        }
      })
      .finally(function final() {
        --actionCount;
        if (actionCount === 0) {
          $state.reload();
        }
      });
    });
  };

  function initView() {
    SecretService.secrets()
    .then(function success(data) {
      $scope.secrets = data;
    })
    .catch(function error(err) {
      $scope.secrets = [];
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to retrieve secrets');

      } else {
          Notifications.error('失败', err, '无法检索secret');

      }
    });
  }

  initView();
}]);
