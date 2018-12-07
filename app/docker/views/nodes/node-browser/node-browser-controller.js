angular.module('portainer.docker').controller('NodeBrowserController', ['$rootScope',
  '$stateParams', 'NodeService', 'HttpRequestHelper', 'Notifications',
  function NodeBrowserController($rootScope, $stateParams, NodeService, HttpRequestHelper, Notifications) {
    var ctrl = this;
    ctrl.$onInit = $onInit;

    function $onInit() {
      ctrl.nodeId = $stateParams.id;

      NodeService.node(ctrl.nodeId)
      .then(function onNodeLoaded(node) {
        HttpRequestHelper.setPortainerAgentTargetHeader(node.Hostname);
        ctrl.node = node;
      })
      .catch(function onError(err) {
        if($rootScope.language==='en_US'){
        Notifications.error('Unable to retrieve host information', err);

        } else {
            Notifications.error('无法检索主机信息', err);
  
        }
      });
    }
  }
]);
