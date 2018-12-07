angular.module('portainer.docker')
.controller('VolumesController', ['$rootScope', '$q', '$scope', '$state', 'VolumeService', 'ServiceService', 'VolumeHelper', 'Notifications', 'HttpRequestHelper', 'EndpointProvider',
function ($rootScope, $q, $scope, $state, VolumeService, ServiceService, VolumeHelper, Notifications, HttpRequestHelper, EndpointProvider) {

  $scope.removeAction = function (selectedItems) {
    var actionCount = selectedItems.length;
    angular.forEach(selectedItems, function (volume) {
      HttpRequestHelper.setPortainerAgentTargetHeader(volume.NodeName);
      VolumeService.remove(volume)
      .then(function success() {
        if($rootScope.language==='en_US'){
        Notifications.success('Volume successfully removed', volume.Id);

        } else {
        Notifications.success('删除Volume成功', volume.Id);

        }
        var index = $scope.volumes.indexOf(volume);
        $scope.volumes.splice(index, 1);
      })
      .catch(function error(err) {
        if($rootScope.language==='en_US'){
        Notifications.error('Failure', err, 'Unable to remove volume');

        } else {
      Notifications.error('失败', err, '无法删除volume');

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
    var endpointProvider = $scope.applicationState.endpoint.mode.provider;
    var endpointRole = $scope.applicationState.endpoint.mode.role;

    $q.all({
      attached: VolumeService.volumes({ filters: { 'dangling': ['false'] } }),
      dangling: VolumeService.volumes({ filters: { 'dangling': ['true'] } }),
      services: endpointProvider === 'DOCKER_SWARM_MODE' && endpointRole === 'MANAGER' ? ServiceService.services() : []
    })
    .then(function success(data) {
      var services = data.services;
      $scope.offlineMode = EndpointProvider.offlineMode();
      $scope.volumes = data.attached.map(function(volume) {
        volume.dangling = false;
        return volume;
      }).concat(data.dangling.map(function(volume) {
        volume.dangling = true;
        if (VolumeHelper.isVolumeUsedByAService(volume, services)) {
          volume.dangling = false;
        }
        return volume;
      }));
    }).catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to retrieve volumes');

      } else {
          Notifications.error('失败', err, '无法检索volumes');

      }
    });
  }

  initView();
}]);
