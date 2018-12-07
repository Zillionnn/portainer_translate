angular.module('portainer.docker')
.controller('ImagesController', ['$rootScope', '$scope', '$state', 'ImageService', 'Notifications', 'ModalService', 'HttpRequestHelper', 'FileSaver', 'Blob', 'EndpointProvider',
function ($rootScope, $scope, $state, ImageService, Notifications, ModalService, HttpRequestHelper, FileSaver, Blob, EndpointProvider) {
  $scope.state = {
    actionInProgress: false,
    exportInProgress: false
  };

  $scope.formValues = {
    Image: '',
    Registry: '',
    NodeName: null
  };

  $scope.pullImage = function() {
    var image = $scope.formValues.Image;
    var registry = $scope.formValues.Registry;

    var nodeName = $scope.formValues.NodeName;
    HttpRequestHelper.setPortainerAgentTargetHeader(nodeName);

    $scope.state.actionInProgress = true;
    ImageService.pullImage(image, registry, false)
    .then(function success() {
      if($rootScope.language==='en_US'){
      Notifications.success('Image successfully pulled', image);

      } else {
        Notifications.success('镜像下载成功', image);
  
      }
      $state.reload();
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to pull image');

      } else {
          Notifications.error('失败', err, '无法下载镜像');

      }
    })
    .finally(function final() {
      $scope.state.actionInProgress = false;
    });
  };

  $scope.confirmRemovalAction = function (selectedItems, force) {
    ModalService.confirmImageForceRemoval(function (confirmed) {
      if(!confirmed) { return; }
      $scope.removeAction(selectedItems, force);
    });
  };

  function isAuthorizedToDownload(selectedItems) {

    for (var i = 0; i < selectedItems.length; i++) {
      var image = selectedItems[i];

      var untagged = _.find(image.RepoTags, function (item) {
        return item.indexOf('<none>') > -1;
      });

      if (untagged) {
        if($rootScope.language==='en_US'){
        Notifications.warning('', 'Cannot download a untagged image');

        } else {
           Notifications.warning('', '无法下载未标记的图像');
   
        }
  			return false;
      }
    }

    if (_.uniqBy(selectedItems, 'NodeName').length > 1) {
      if($rootScope.language==='en_US'){
Notifications.warning('', 'Cannot download images from different nodes at the same time');
      } else {
    Notifications.warning('', '无法同时从不同节点下载图像');
      }
      
       return false;
    }

    return true;
  }

  function exportImages(images) {
    HttpRequestHelper.setPortainerAgentTargetHeader(images[0].NodeName);
    $scope.state.exportInProgress = true;
    ImageService.downloadImages(images)
    .then(function success(data) {
      var downloadData = new Blob([data.file], { type: 'application/x-tar' });
      FileSaver.saveAs(downloadData, 'images.tar');
      if($rootScope.language==='en_US'){
      Notifications.success('Image(s) successfully downloaded');

      } else {
          Notifications.success('镜像已成功下载');

      }
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to download image(s)');

      } else {
        Notifications.error('失败', err, '无法下载镜像');
  
      }
    })
    .finally(function final() {
      $scope.state.exportInProgress = false;
    });
  }

  $scope.downloadAction = function (selectedItems) {
    if (!isAuthorizedToDownload(selectedItems)) {
      return;
    }

    ModalService.confirmImageExport(function (confirmed) {
      if(!confirmed) { return; }
      exportImages(selectedItems);
    });
  };

  $scope.removeAction = function (selectedItems, force) {
    var actionCount = selectedItems.length;
    angular.forEach(selectedItems, function (image) {
      HttpRequestHelper.setPortainerAgentTargetHeader(image.NodeName);
      ImageService.deleteImage(image.Id, force)
      .then(function success() {
        if($rootScope.language==='en_US'){
        Notifications.success('Image successfully removed', image.Id);

        } else {
            Notifications.success('镜像已成功删除', image.Id);
  
        }
        var index = $scope.images.indexOf(image);
        $scope.images.splice(index, 1);
      })
      .catch(function error(err) {
        if($rootScope.language==='en_US'){
        Notifications.error('Failure', err, 'Unable to remove image');

        } else {
           Notifications.error('失败', err, '无法删除镜像');
   
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

  $scope.offlineMode = false;

  function initView() {
    ImageService.images(true)
    .then(function success(data) {
      $scope.images = data;
      $scope.offlineMode = EndpointProvider.offlineMode();
    })
    .catch(function error(err) {
      if($rootScope.language==='en_US'){
      Notifications.error('Failure', err, 'Unable to retrieve images');

      } else {
          Notifications.error('失败', err, '无法检索图像');

      }
      $scope.images = [];
    });
  }

  initView();
}]);
