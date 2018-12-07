angular.module('portainer.app').controller('InformationPanelOfflineController', ['$rootScope', '$state', 'EndpointProvider', 'EndpointService', 'Authentication', 'Notifications',
function StackDuplicationFormController($rootScope, $state, EndpointProvider, EndpointService, Authentication, Notifications) {
  var ctrl = this;

  this.$onInit = onInit;
  this.triggerSnapshot = triggerSnapshot;

  function triggerSnapshot() {
    var endpointId = EndpointProvider.endpointID();

    EndpointService.snapshotEndpoint(endpointId)
    .then(function onSuccess() {
      $state.reload();
    })
    .catch(function onError(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'An error occured during endpoint snapshot');

      } else {
        Notifications.error('失败', err, '终端快照期间发生错误');
  
      }
    });
  }

  function onInit() {
    var endpointId = EndpointProvider.endpointID();
    ctrl.showRefreshButton = Authentication.getUserDetails().role === 1;


    EndpointService.endpoint(endpointId)
    .then(function onSuccess(data) {
      ctrl.snapshotTime = data.Snapshots[0].Time;
    })
    .catch(function onError(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to retrieve endpoint information');

      } else {
      Notifications.error('失败', err, '无法检索终端信息');

      }
    });
  }

}]);
