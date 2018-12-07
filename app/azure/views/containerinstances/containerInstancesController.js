angular.module('portainer.azure')
.controller('AzureContainerInstancesController', ['$rootScope', '$scope', '$state', 'AzureService', 'Notifications',
function ($rootScope, $scope, $state, AzureService, Notifications) {
  var language = $rootScope.language
  function initView() {
    AzureService.subscriptions()
    .then(function success(data) {
      var subscriptions = data;
      return AzureService.containerGroups(subscriptions);
    })
    .then(function success(data) {
      $scope.containerGroups = AzureService.aggregate(data);
    })
    .catch(function error(err) {
      if(language==='en_US'){
      Notifications.error('Failure', err, 'Unable to load container groups');

      } else {
        Notifications.error('失败', err, '无法加载容器组');

      }
    });
  }

  $scope.deleteAction = function (selectedItems) {
    var actionCount = selectedItems.length;
    angular.forEach(selectedItems, function (item) {
      AzureService.deleteContainerGroup(item.Id)
      .then(function success() {
        if(language==='en_US'){
          Notifications.success('Container group successfully removed', item.Name);
        } else {
          Notifications.success('容器组已成功删除', item.Name);
        }
        var index = $scope.containerGroups.indexOf(item);
        $scope.containerGroups.splice(index, 1);
      })
      .catch(function error(err) {
        if(language==='en_US'){
          Notifications.error('Failure', err, 'Unable to remove container group');
        } else {
          Notifications.error('失败', err, '无法删除容器组');
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

  initView();
}]);
