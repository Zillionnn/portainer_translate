angular.module('extension.storidge')
.controller('StoridgeProfilesController', ['$rootScope', '$q', '$scope', '$state', 'Notifications', 'StoridgeProfileService',
function ($rootScope, $q, $scope, $state, Notifications, StoridgeProfileService) {

  $scope.state = {
    actionInProgress: false
  };

  $scope.formValues = {
    Name: ''
  };

  $scope.removeAction = function(selectedItems) {
    var actionCount = selectedItems.length;
    angular.forEach(selectedItems, function (profile) {
      StoridgeProfileService.delete(profile.Name)
      .then(function success() {
        if($rootScope.language==='en_US'){
        Notifications.success('Profile successfully removed', profile.Name);

        } else {
        Notifications.success('配置文件已成功删除', profile.Name);

        }
        var index = $scope.profiles.indexOf(profile);
        $scope.profiles.splice(index, 1);
      })
      .catch(function error(err) {
        if($rootScope.language==='en_US'){
        Notifications.error('Failure', err, 'Unable to remove profile');

        } else {
            Notifications.error('失败', err, '无法删除配置文件');
  
        }
      })
      .finally(function final() {
        --actionCount;
        if (actionCount === 0) {
          $state.reload();
        }
      });
    });
  };

  $scope.create = function() {
    var model = new StoridgeProfileDefaultModel();
    model.Name = $scope.formValues.Name;
    model.Directory = model.Directory + model.Name;

    $scope.state.actionInProgress = true;
    StoridgeProfileService.create(model)
    .then(function success() {
      if($rootScope.language==='en_US'){
      Notifications.success('Profile successfully created');

      } else {
          Notifications.success('配置文件成功创建');

      }
      $state.reload();
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to create profile');

      } else {
          Notifications.error('失败', err, '无法创建配置文件');

      }
    })
    .finally(function final() {
      $scope.state.actionInProgress = false;
    });
  };

  function initView() {
    StoridgeProfileService.profiles()
    .then(function success(data) {
      $scope.profiles = data;
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to retrieve profiles');

      } else {
          Notifications.error('失败', err, '无法检索配置文件');

      }
    });
  }

  initView();
}]);
