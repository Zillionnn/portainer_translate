angular.module('portainer.docker')
.controller('TaskController', ['$rootScope', '$scope', '$transition$', 'TaskService', 'ServiceService', 'Notifications',
function ($rootScope, $scope, $transition$, TaskService, ServiceService, Notifications) {

  function initView() {
    TaskService.task($transition$.params().id)
    .then(function success(data) {
      var task = data;
      $scope.task = task;
      return ServiceService.service(task.ServiceId);
    })
    .then(function success(data) {
      var service = data;
      $scope.service = service;
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to retrieve task details');

      } else {
          Notifications.error('失败', err, '无法检索任务详细信息');

      }
    });
  }

  initView();
}]);
