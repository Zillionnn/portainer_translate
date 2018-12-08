angular.module('portainer.app')
.controller('UserController', ['$rootScope', '$q', '$scope', '$state', '$transition$', 'UserService', 'ModalService', 'Notifications', 'SettingsService',
function ($rootScope, $q, $scope, $state, $transition$, UserService, ModalService, Notifications, SettingsService) {

  $scope.state = {
    updatePasswordError: ''
  };

  $scope.formValues = {
    newPassword: '',
    confirmPassword: '',
    Administrator: false
  };

  $scope.deleteUser = function() {
    ModalService.confirmDeletion(
      'Do you want to remove this user? This user will not be able to login into Portainer anymore.',
      function onConfirm(confirmed) {
        if(!confirmed) { return; }
        deleteUser();
      }
    );
  };

  $scope.updatePermissions = function() {
    var role = $scope.formValues.Administrator ? 1 : 2;
    UserService.updateUser($scope.user.Id, undefined, role)
    .then(function success() {
      var newRole = role === 1 ? 'administrator' : 'user';
      if($rootScope.language==='en_US'){
      Notifications.success('Permissions successfully updated', $scope.user.Username + ' is now ' + newRole);

      } else {
         Notifications.success('权限已成功更新', $scope.user.Username + ' is now ' + newRole);
   
      }
      $state.reload();
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to update user permissions');

      } else {
        Notifications.error('失败', err, '无法更新用户权限');
    
      }
    });
  };

  $scope.updatePassword = function() {
    UserService.updateUser($scope.user.Id, $scope.formValues.newPassword, undefined)
    .then(function success() {
      if($rootScope.language==='en_US'){
      Notifications.success('Password successfully updated');

      } else {
       Notifications.success('密码已成功更新');
     
      }
      $state.reload();
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to update user password');

      } else {
        Notifications.error('失败', err, '无法更新用户密码');
    
      }
    });
  };

  function deleteUser() {
    UserService.deleteUser($scope.user.Id)
    .then(function success() {
      if($rootScope.language==='en_US'){
      Notifications.success('User successfully deleted', $scope.user.Username);

      } else {
          Notifications.success('用户已成功删除', $scope.user.Username);
  
      }
      $state.go('portainer.users');
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to remove user');

      } else {
        Notifications.error('失败', err, '无法删除用户');
    
      }
    });
  }

  function initView() {
    $q.all({
      user: UserService.user($transition$.params().id),
      settings: SettingsService.publicSettings()
    })
    .then(function success(data) {
      var user = data.user;
      $scope.user = user;
      $scope.formValues.Administrator = user.Role === 1 ? true : false;
      $scope.AuthenticationMethod = data.settings.AuthenticationMethod;
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to retrieve user information');

      } else {
      Notifications.error('失败', err, '无法检索用户信息');
      
      }
    });
  }

  initView();
}]);
