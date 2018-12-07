angular.module('portainer.docker')
.controller('ServiceLogsController', ['$rootScope', '$scope', '$transition$', '$interval', 'ServiceService', 'Notifications',
function ($rootScope, $scope, $transition$, $interval, ServiceService, Notifications) {
  $scope.state = {
    refreshRate: 3,
    lineCount: 100,
    sinceTimestamp: '',
    displayTimestamps: false
  };

  $scope.changeLogCollection = function(logCollectionStatus) {
    if (!logCollectionStatus) {
      stopRepeater();
    } else {
      setUpdateRepeater();
    }
  };

  $scope.$on('$destroy', function() {
    stopRepeater();
  });

  function stopRepeater() {
    var repeater = $scope.repeater;
    if (angular.isDefined(repeater)) {
      $interval.cancel(repeater);
      repeater = null;
    }
  }

  function setUpdateRepeater() {
    var refreshRate = $scope.state.refreshRate;
    $scope.repeater = $interval(function() {
      ServiceService.logs($transition$.params().id, 1, 1, $scope.state.displayTimestamps ? 1 : 0, moment($scope.state.sinceTimestamp).unix(), $scope.state.lineCount)
      .then(function success(data) {
        $scope.logs = data;
      })
      .catch(function error(err) {
        stopRepeater();
        if($rootScope.language==='en_US'){
        Notifications.error('Failure', err, 'Unable to retrieve service logs');

        } else {
          Notifications.error('失败', err, '无法检索服务日志');
    
        }
      });
    }, refreshRate * 1000);
  }

  function startLogPolling() {
    ServiceService.logs($transition$.params().id, 1, 1, $scope.state.displayTimestamps ? 1 : 0, moment($scope.state.sinceTimestamp).unix(), $scope.state.lineCount)
    .then(function success(data) {
      $scope.logs = data;
      setUpdateRepeater();
    })
    .catch(function error(err) {
      stopRepeater();
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to retrieve service logs');

      } else {
        Notifications.error('失败', err, '无法检索服务日志');
  
      }
    });
  }

  function initView() {
    ServiceService.service($transition$.params().id)
    .then(function success(data) {
      $scope.service = data;
      startLogPolling();
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to retrieve service information');

      } else {
       Notifications.error('失败', err, '无法检索服务信息');

      }
    });

  }

  initView();
}]);
