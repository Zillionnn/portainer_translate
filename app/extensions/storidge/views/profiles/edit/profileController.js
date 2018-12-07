angular.module('extension.storidge')
.controller('StoridgeProfileController', ['$rootScope', '$scope', '$state', '$transition$', 'Notifications', 'StoridgeProfileService', 'ModalService',
function ($rootScope, $scope, $state, $transition$, Notifications, StoridgeProfileService, ModalService) {

  $scope.state = {
    NoLimit: false,
    LimitIOPS: false,
    LimitBandwidth: false,
    updateInProgress: false,
    deleteInProgress: false
  };

  $scope.RedundancyOptions = [
    { value: 2, label: '2-copy' },
    { value: 3, label: '3-copy' }
  ];

  $scope.update = function() {

    var profile = $scope.profile;

    if (!$scope.state.LimitIOPS) {
      delete profile.MinIOPS;
      delete profile.MaxIOPS;
    }

    if (!$scope.state.LimitBandwidth) {
      delete profile.MinBandwidth;
      delete profile.MaxBandwidth;
    }

    $scope.state.updateInProgress = true;
    StoridgeProfileService.update(profile)
    .then(function success() {
      if($rootScope.language==='en_US'){
      Notifications.success('Profile successfully updated');

      } else {
          Notifications.success('档案已成功更新');

      }
      $state.go('storidge.profiles');
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to update profile');

      } else {
          Notifications.error('失败', err, '无法更新资料');

      }
    })
    .finally(function final() {
      $scope.state.updateInProgress = false;
    });
  };

  $scope.delete = function() {
    ModalService.confirmDeletion(
      'Do you want to remove this profile?',
      function onConfirm(confirmed) {
        if(!confirmed) { return; }
        deleteProfile();
      }
    );
  };

  function deleteProfile() {
    var profile = $scope.profile;

    $scope.state.deleteInProgress = true;
    StoridgeProfileService.delete(profile.Name)
    .then(function success() {
      if($rootScope.language==='en_US'){
      Notifications.success('Profile successfully deleted');

      } else {
          Notifications.success('配置文件已成功删除');

      }
      $state.go('storidge.profiles');
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to delete profile');

      } else {
          Notifications.error('失败', err, '无法删除个人资料');

      }
    })
    .finally(function final() {
      $scope.state.deleteInProgress = false;
    });
  }

  function initView() {
    StoridgeProfileService.profile($transition$.params().id)
    .then(function success(data) {
      var profile = data;
      if ((profile.MinIOPS && profile.MinIOPS !== 0) || (profile.MaxIOPS && profile.MaxIOPS !== 0)) {
        $scope.state.LimitIOPS = true;
      } else if ((profile.MinBandwidth && profile.MinBandwidth !== 0) || (profile.MaxBandwidth && profile.MaxBandwidth !== 0)) {
        $scope.state.LimitBandwidth = true;
      } else {
        $scope.state.NoLimit = true;
      }
      $scope.profile = profile;
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to retrieve profile details');

      } else {
          Notifications.error('失败', err, '无法检索个人资料详细信息');

      }
    });
  }

  initView();

}]);
