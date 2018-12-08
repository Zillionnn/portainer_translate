angular.module('portainer.app')
.controller('SchedulesController', ['$rootScope', '$scope', '$state', 'Notifications', 'ModalService', 'ScheduleService',
function ($rootScope, $scope, $state, Notifications, ModalService, ScheduleService) {

  $scope.removeAction = removeAction;

  function removeAction(selectedItems) {
    ModalService.confirmDeletion(
      'Do you want to remove the selected schedule(s) ?',
      function onConfirm(confirmed) {
        if(!confirmed) { return; }
        deleteSelectedSchedules(selectedItems);
      }
    );
  }

  function deleteSelectedSchedules(schedules) {
    var actionCount = schedules.length;
    angular.forEach(schedules, function (schedule) {
      ScheduleService.deleteSchedule(schedule.Id)
      .then(function success() {
        if($rootScope.language==='en_US'){
        Notifications.success('Schedule successfully removed', schedule.Name);

        } else {
            Notifications.success('计划成功删除', schedule.Name);
    
        }
        var index = $scope.schedules.indexOf(schedule);
        $scope.schedules.splice(index, 1);
      })
      .catch(function error(err) {
        if($rootScope.language==='en_US'){
        Notifications.error('Failure', err, 'Unable to remove schedule ' + schedule.Name);

        } else {
        Notifications.error('设备', err, '无法删除计划' + schedule.Name);
        
        }
      })
      .finally(function final() {
        --actionCount;
        if (actionCount === 0) {
          $state.reload();
        }
      });
    });
  }

  function initView() {
    ScheduleService.schedules()
    .then(function success(data) {
      $scope.schedules = data;
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to retrieve schedules');

      } else {
        Notifications.error('失败', err, '无法检索计划');
    
      }
      $scope.schedules = [];
    });
  }

  initView();
}]);
