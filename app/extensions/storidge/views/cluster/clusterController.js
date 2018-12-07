angular.module('extension.storidge')
.controller('StoridgeClusterController', ['$rootScope', '$q', '$scope', '$state', 'Notifications', 'StoridgeClusterService', 'StoridgeNodeService', 'ModalService',
function ($rootScope, $q, $scope, $state, Notifications, StoridgeClusterService, StoridgeNodeService, ModalService) {

  $scope.state = {
    shutdownInProgress: false,
    rebootInProgress: false
  };

  $scope.rebootCluster = function() {
    ModalService.confirm({
      title: 'Are you sure?',
      message: 'All the nodes in the cluster will reboot during the process. Do you want to reboot the Storidge cluster?',
      buttons: {
        confirm: {
          label: 'Reboot',
          className: 'btn-danger'
        }
      },
      callback: function onConfirm(confirmed) {
        if(!confirmed) { return; }
        rebootCluster();
      }
    });
  };

  $scope.shutdownCluster = function() {
    ModalService.confirm({
      title: 'Are you sure?',
      message: 'All the nodes in the cluster will shutdown. Do you want to shutdown the Storidge cluster?',
      buttons: {
        confirm: {
          label: 'Shutdown',
          className: 'btn-danger'
        }
      },
      callback: function onConfirm(confirmed) {
        if(!confirmed) { return; }
        shutdownCluster();
      }
    });
  };

  function shutdownCluster() {
    $scope.state.shutdownInProgress = true;
    StoridgeClusterService.shutdown()
    .finally(function final() {
      $scope.state.shutdownInProgress = false;
      if($rootScope.language==='en_US'){
      Notifications.success('Cluster successfully shutdown');

      } else {
          Notifications.success('群集成功关闭');

      }
      $state.go('docker.dashboard');
    });
  }

  function rebootCluster() {
    $scope.state.rebootInProgress = true;
    StoridgeClusterService.reboot()
    .finally(function final() {
      $scope.state.rebootInProgress = false;
      if($rootScope.language==='en_US'){
      Notifications.success('Cluster successfully rebooted');

      } else {
      Notifications.success('群集已成功重新启动');

      }
      $state.reload();
    });
  }

  function initView() {
    $q.all({
      info: StoridgeClusterService.info(),
      version: StoridgeClusterService.version(),
      nodes: StoridgeNodeService.nodes()
    })
    .then(function success(data) {
      $scope.clusterInfo = data.info;
      $scope.clusterVersion = data.version;
      $scope.clusterNodes = data.nodes;
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to retrieve cluster information');

      } else {
          Notifications.error('失败', err, '无法检索群集信息');

      }
    });
  }

  initView();
}]);
