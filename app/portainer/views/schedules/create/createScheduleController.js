angular.module('portainer.app')
.controller('CreateScheduleController', ['$rootScope', '$q', '$scope', '$state', 'Notifications', 'EndpointService', 'GroupService', 'ScheduleService',
function ($rootScope, $q, $scope, $state, Notifications, EndpointService, GroupService, ScheduleService) {

  $scope.state = {
    actionInProgress: false
  };

  $scope.create = create;

  function create() {
    var model = $scope.model;

    $scope.state.actionInProgress = true;
    createSchedule(model)
    .then(function success() {
      if($rootScope.language==='en_US'){
      Notifications.success('Schedule successfully created');

      } else {
      Notifications.success('计划成功创建');
      
      }
      $state.go('portainer.schedules', {}, {reload: true});
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to create schedule');

      } else {
       Notifications.error('失败', err, '无法创建计划');
     
      }
    })
    .finally(function final() {
      $scope.state.actionInProgress = false;
    });
  }

  function createSchedule(model) {
    if (model.Job.Method === 'editor') {
      return ScheduleService.createScheduleFromFileContent(model);
    }
    return ScheduleService.createScheduleFromFileUpload(model);
  }

  function initView() {
    $scope.model = new ScheduleDefaultModel();

    $q.all({
      endpoints: EndpointService.endpoints(),
      groups: GroupService.groups()
    })
    .then(function success(data) {
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
