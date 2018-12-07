angular.module('extension.storidge')
.controller('StoridgeCreateProfileController', ['$rootScope', '$scope', '$state', '$transition$', 'Notifications', 'StoridgeProfileService',
function ($rootScope, $scope, $state, $transition$, Notifications, StoridgeProfileService) {

  $scope.state = {
    NoLimit: true,
    LimitIOPS: false,
    LimitBandwidth: false,
    ManualInputDirectory: false,
    actionInProgress: false
  };

  $scope.RedundancyOptions = [
    { value: 2, label: '2-copy' },
    { value: 3, label: '3-copy' }
  ];

  $scope.create = function () {
    var profile = $scope.model;

    if (!$scope.state.LimitIOPS) {
      delete profile.MinIOPS;
      delete profile.MaxIOPS;
    }

    if (!$scope.state.LimitBandwidth) {
      delete profile.MinBandwidth;
      delete profile.MaxBandwidth;
    }

    $scope.state.actionInProgress = true;
    StoridgeProfileService.create(profile)
    .then(function success() {
      if($rootScope.language==='en_US'){
      Notifications.success('Profile successfully created');

      } else {
          Notifications.success('配置文件成功创建');

      }
      $state.go('storidge.profiles');
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to create profile');

      } else {
      Notifications.error('失败', err, '无法创建个人资料');
    
      }
    })
    .finally(function final() {
      $scope.state.actionInProgress = false;
    });
  };

  $scope.updatedName = function() {
    if (!$scope.state.ManualInputDirectory) {
      var profile = $scope.model;
      profile.Directory = '/cio/' + profile.Name;
    }
  };

  $scope.updatedDirectory = function() {
    if (!$scope.state.ManualInputDirectory) {
      $scope.state.ManualInputDirectory = true;
    }
  };

  function initView() {
    var profile = new StoridgeProfileDefaultModel();
    profile.Name = $transition$.params().profileName;
    profile.Directory = '/cio/' + profile.Name;
    $scope.model = profile;
  }

  initView();
}]);
