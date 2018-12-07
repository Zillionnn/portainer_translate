angular.module('portainer.docker')
.controller('NetworksController', ['$rootScope', '$scope', '$state', 'NetworkService', 'Notifications', 'HttpRequestHelper', 'EndpointProvider',
function ($rootScope, $scope, $state, NetworkService, Notifications, HttpRequestHelper, EndpointProvider) {

  $scope.removeAction = function (selectedItems) {
    var actionCount = selectedItems.length;
    angular.forEach(selectedItems, function (network) {
      HttpRequestHelper.setPortainerAgentTargetHeader(network.NodeName);
      NetworkService.remove(network.Id)
      .then(function success() {
        if($rootScope.language==='en_US'){
        Notifications.success('Network successfully removed', network.Name);

        } else {
      Notifications.success('网络已成功删除', network.Name);

        }
        var index = $scope.networks.indexOf(network);
        $scope.networks.splice(index, 1);
      })
      .catch(function error(err) {
        if($rootScope.language==='en_US'){
        Notifications.error('Failure', err, 'Unable to remove network');

        } else {
         Notifications.error('失败', err, '无法删除网络');

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

  $scope.offlineMode = false;

  function initView() {
    NetworkService.networks(true, true, true)
    .then(function success(data) {
      $scope.networks = data;
      $scope.offlineMode = EndpointProvider.offlineMode();
    })
    .catch(function error(err) {
      $scope.networks = [];
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to retrieve networks');

      } else {
      Notifications.error('失败', err, '无法检索网络');
    
      }
    });
  }

  initView();
}]);
