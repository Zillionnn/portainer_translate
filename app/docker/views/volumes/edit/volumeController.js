angular.module('portainer.docker')
.controller('VolumeController', ['$rootScope', '$scope', '$state', '$transition$', 'VolumeService', 'ContainerService', 'Notifications', 'HttpRequestHelper',
function ($rootScope, $scope, $state, $transition$, VolumeService, ContainerService, Notifications, HttpRequestHelper) {

  $scope.removeVolume = function removeVolume() {
    VolumeService.remove($scope.volume)
    .then(function success() {
      if($rootScope.language==='en_US'){
      Notifications.success('Volume successfully removed', $transition$.params().id);

      } else {
       Notifications.success('删除Volume成功', $transition$.params().id);
   
      }
      $state.go('docker.volumes', {});
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to remove volume');

      } else {
          Notifications.error('失败', err, '无法删除volume');

      }
    });
  };

  function getVolumeDataFromContainer(container, volumeId) {
    return container.Mounts.find(function(volume) {
      return volume.Name === volumeId;
    });
  }

  function initView() {
    HttpRequestHelper.setPortainerAgentTargetHeader($transition$.params().nodeName);
    VolumeService.volume($transition$.params().id)
    .then(function success(data) {
      var volume = data;
      $scope.volume = volume;
      var containerFilter = { volume: [volume.Id] };
      return ContainerService.containers(1, containerFilter);
    })
    .then(function success(data) {
      var containers = data.map(function(container) {
        container.volumeData = getVolumeDataFromContainer(container, $scope.volume.Id);
        return container;
      });
      $scope.containersUsingVolume = containers;
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to retrieve volume details');

      } else {
       Notifications.error('失败', err, '无法检索volume详细信息');
   
      }
    });
  }

  initView();
}]);
