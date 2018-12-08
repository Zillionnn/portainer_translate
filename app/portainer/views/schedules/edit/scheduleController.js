angular.module('portainer.app')
.controller('ScheduleController', ['$rootScope', '$q', '$scope', '$transition$', '$state', 'Notifications', 'EndpointService', 'GroupService', 'ScheduleService', 'EndpointProvider',
function ($rootScope, $q, $scope, $transition$, $state, Notifications, EndpointService, GroupService, ScheduleService, EndpointProvider) {

  $scope.state = {
    actionInProgress: false
  };

  $scope.update = update;
  $scope.goToContainerLogs = goToContainerLogs;

  function update() {
    var model = $scope.schedule;

    $scope.state.actionInProgress = true;
    ScheduleService.updateSchedule(model)
    .then(function success() {
      if($rootScope.language==='en_US'){
      Notifications.success('Schedule successfully updated');

      } else {
       Notifications.success('计划成功更新');
     
      }
      $state.go('portainer.schedules', {}, {reload: true});
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to update schedule');

      } else {
      Notifications.error('失败', err, '无法更新计划');
      
      }
    })
    .finally(function final() {
      $scope.state.actionInProgress = false;
    });
  }

  function goToContainerLogs(endpointId, containerId) {
    EndpointProvider.setEndpointID(endpointId);
    $state.go('docker.containers.container.logs', { id: containerId });
  }

  function associateEndpointsToTasks(tasks, endpoints) {
    for (var i = 0; i < tasks.length; i++) {
      var task = tasks[i];

      for (var j = 0; j < endpoints.length; j++) {
        var endpoint = endpoints[j];

        if (task.EndpointId === endpoint.Id) {
          task.Endpoint = endpoint;
          break;
        }
      }
    }
  }

  function initView() {
    var id = $transition$.params().id;

    $q.all({
      schedule: ScheduleService.schedule(id),
      file: ScheduleService.getScriptFile(id),
      tasks: ScheduleService.scriptExecutionTasks(id),
      endpoints: EndpointService.endpoints(),
      groups: GroupService.groups()
    })
    .then(function success(data) {
      var schedule = data.schedule;
      schedule.Job.FileContent = data.file.ScheduleFileContent;

      var endpoints = data.endpoints;
      var tasks = data.tasks;
      associateEndpointsToTasks(tasks, endpoints);

      $scope.schedule = schedule;
      $scope.tasks = data.tasks;
      $scope.endpoints = data.endpoints;
      $scope.groups = data.groups;
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to retrieve endpoint list');

      } else {
      Notifications.error('失败', err, '无法检索终端列表');
      
      }
    });
  }

  initView();
}]);
