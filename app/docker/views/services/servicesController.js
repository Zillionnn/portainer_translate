angular.module('portainer.docker')
.controller('ServicesController', ['$rootScope', '$q', '$scope', 'ServiceService', 'ServiceHelper', 'Notifications', 'TaskService', 'TaskHelper', 'NodeService', 'ContainerService',
function ($rootScope, $q, $scope, ServiceService, ServiceHelper, Notifications, TaskService, TaskHelper, NodeService, ContainerService) {

  function initView() {
    var agentProxy = $scope.applicationState.endpoint.mode.agentProxy;

    $q.all({
      services: ServiceService.services(),
      tasks: TaskService.tasks(),
      containers: agentProxy ? ContainerService.containers(1) : [],
      nodes: NodeService.nodes()
    })
    .then(function success(data) {
      var services = data.services;
      var tasks = data.tasks;

      if (agentProxy) {
        var containers = data.containers;
        for (var j = 0; j < tasks.length; j++) {
          var task = tasks[j];
          TaskHelper.associateContainerToTask(task, containers);
        }
      }

      for (var i = 0; i < services.length; i++) {
        var service = services[i];
        ServiceHelper.associateTasksToService(service, tasks);
      }

      $scope.nodes = data.nodes;
      $scope.tasks = tasks;
      $scope.services = services;
    })
    .catch(function error(err) {
      $scope.services = [];
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to retrieve services');

      } else {
          Notifications.error('失败', err, '无法检索服务');

      }
    });
  }

  initView();
}]);
