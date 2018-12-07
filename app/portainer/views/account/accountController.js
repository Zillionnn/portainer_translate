angular.module('portainer.app')
.controller('AccountController', ['$rootScope', '$scope', '$state', 'Authentication', 'UserService', 'Notifications', 'SettingsService',
function ($rootScope, $scope, $state, Authentication, UserService, Notifications, SettingsService) {
  $scope.formValues = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  $scope.updatePassword = function() {
    UserService.updateUserPassword($scope.userID, $scope.formValues.currentPassword, $scope.formValues.newPassword)
    .then(function success() {
      if($rootScope.language==='en_US'){
      Notifications.success('Success', 'Password successfully updated');

      } else {
            Notifications.success('成功', '密码已成功更新');

      }
      $state.reload();
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, err.msg);

      } else {
  Notifications.error('失败', err, err.msg);

      }
    });
  };

  function initView() {
    $scope.userID = Authentication.getUserDetails().ID;
    SettingsService.publicSettings()
    .then(function success(data) {
      $scope.AuthenticationMethod = data.AuthenticationMethod;
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to retrieve application settings');

      } else {
            Notifications.error('失败', err, '无法检索应用程序设置');

      }
    });
  }

  initView();
}]);
