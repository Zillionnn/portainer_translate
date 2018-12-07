angular.module('portainer.docker')
.controller('ConfigsController', ['$rootScope', '$scope', '$state', 'ConfigService', 'Notifications',
function ($rootScope, $scope, $state, ConfigService, Notifications) {

  $scope.removeAction = function (selectedItems) {
    var actionCount = selectedItems.length;
    angular.forEach(selectedItems, function (config) {
      ConfigService.remove(config.Id)
      .then(function success() {
        if($rootScope.language==='en_US'){
        Notifications.success('Config successfully removed', config.Name);

        } else {
        Notifications.success('配置删除成功', config.Name);
      
        }
        var index = $scope.configs.indexOf(config);
        $scope.configs.splice(index, 1);
      })
      .catch(function error(err) {
        if($rootScope.language==='en_US'){
        Notifications.error('Failure', err, 'Unable to remove config');

        } else {
        Notifications.error('失败', err, '无法删除配置');
      
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
    ConfigService.configs()
    .then(function success(data) {
      $scope.configs = data;
    })
    .catch(function error(err) {
      $scope.configs = [];
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to retrieve configs');

      } else {
        Notifications.error('失败', err, '无法检索配置');
  
      }
    });
  }

  initView();
}]);
