angular.module('portainer.app')
.controller('TagsController', ['$rootScope', '$scope', '$state', 'TagService', 'Notifications',
function ($rootScope, $scope, $state, TagService, Notifications) {

  $scope.state = {
    actionInProgress: false
  };

  $scope.formValues = {
    Name: ''
  };

  $scope.checkNameValidity = function(form) {
    var valid = true;
    for (var i = 0; i < $scope.tags.length; i++) {
      if ($scope.formValues.Name === $scope.tags[i].Name) {
        valid = false;
        break;
      }
    }
    form.name.$setValidity('validName', valid);
  };

  $scope.removeAction = function (selectedItems) {
    var actionCount = selectedItems.length;
    angular.forEach(selectedItems, function (tag) {
      TagService.deleteTag(tag.Id)
      .then(function success() {
        if($rootScope.language==='en_US'){
        Notifications.success('Tag successfully removed', tag.Name);

        } else {
             Notifications.success('标记已成功删除', tag.Name);
   
        }
        var index = $scope.tags.indexOf(tag);
        $scope.tags.splice(index, 1);
      })
      .catch(function error(err) {
        if($rootScope.language==='en_US'){
        Notifications.error('Failure', err, 'Unable to tag');

        } else {
         Notifications.error('失败', err, '无法标记');
       
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

  $scope.createTag = function() {
    var tagName = $scope.formValues.Name;
    TagService.createTag(tagName)
    .then(function success() {
      if($rootScope.language==='en_US'){
      Notifications.success('Tag successfully created', tagName);

      } else {
      Notifications.success('标签已成功创建', tagName);
      
      }
      $state.reload();
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to create tag');

      } else {
        Notifications.error('失败', err, '无法创建标记');
    
      }
    });
  };

  function initView() {
    TagService.tags()
    .then(function success(data) {
      $scope.tags = data;
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to retrieve tags');

      } else {
        Notifications.error('失败', err, '无法检索标签');
    
      }
      $scope.tags = [];
    });
  }

  initView();
}]);
