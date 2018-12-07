angular.module('portainer.agent')
.controller('VolumeBrowserController', ['$rootScope', 'HttpRequestHelper', 'VolumeBrowserService', 'FileSaver', 'Blob', 'ModalService', 'Notifications',
function (HttpRequestHelper, VolumeBrowserService, FileSaver, Blob, ModalService, Notifications) {
  var ctrl = this;
  var language = $rootScope.language;

  this.state = {
    path: '/'
  };

  this.rename = function(file, newName) {
    var filePath = this.state.path === '/' ? file : this.state.path + '/' + file;
    var newFilePath = this.state.path === '/' ? newName : this.state.path + '/' + newName;

    VolumeBrowserService.rename(this.volumeId, filePath, newFilePath)
    .then(function success() {
      if(language==='en_US'){
        Notifications.success('File successfully renamed', newFilePath);
      } else {
        Notifications.success('文件重命名成功', newFilePath);
      }
      
      return VolumeBrowserService.ls(ctrl.volumeId, ctrl.state.path);
    })
    .then(function success(data) {
      ctrl.files = data;
    })
    .catch(function error(err) {
      if(language==='en_US'){
        Notifications.error('Failure', err, 'Unable to rename file');
      } else {
        Notifications.error('失败', err, '不能重命名文件');
      }
      
    });
  };

  this.delete = function(file) {
    var filePath = this.state.path === '/' ? file : this.state.path + '/' + file;

    ModalService.confirmDeletion(
      'Are you sure that you want to delete ' + filePath + ' ?',
      function onConfirm(confirmed) {
        if(!confirmed) { return; }
        deleteFile(filePath);
      }
    );
  };

  this.download = function(file) {
    var filePath = this.state.path === '/' ? file : this.state.path + '/' + file;
    VolumeBrowserService.get(this.volumeId, filePath)
    .then(function success(data) {
      var downloadData = new Blob([data.file], { type: 'text/plain;charset=utf-8' });
      FileSaver.saveAs(downloadData, file);
    })
    .catch(function error(err) {
      Notifications.error('Failure', err, 'Unable to download file');
    });
  };

  this.up = function() {
    var parentFolder = parentPath(this.state.path);
    browse(parentFolder);
  };

  this.browse = function(folder) {
    var path = buildPath(this.state.path, folder);
    browse(path);
  };

  function deleteFile(file) {
    VolumeBrowserService.delete(ctrl.volumeId, file)
    .then(function success() {
      if(language==='en_US'){
       Notifications.success('File successfully deleted', file);

      } else {
        Notifications.success('文件删除成功', file);

      }
      return VolumeBrowserService.ls(ctrl.volumeId, ctrl.state.path);
    })
    .then(function success(data) {
      ctrl.files = data;
    })
    .catch(function error(err) {
      if(language==='en_US'){
        Notifications.error('Failure', err, 'Unable to delete file');
      } else {
          Notifications.error('失败', err, '无法删除文件');
      }
      
    });
  }


  function browse(path) {
    VolumeBrowserService.ls(ctrl.volumeId, path)
    .then(function success(data) {
      ctrl.state.path = path;
      ctrl.files = data;
    })
    .catch(function error(err) {
      if(language==='en_US'){
        Notifications.error('Failure', err, 'Unable to browse volume');

      } else {
        Notifications.error('失败', err, '无法浏览volume');

      }
    });
  }

  this.onFileSelectedForUpload = function onFileSelectedForUpload(file) {
    VolumeBrowserService.upload(ctrl.state.path, file, ctrl.volumeId)
      .then(function onFileUpload() {
        onFileUploaded();
      })
      .catch(function onFileUpload(err) {
        if(language==='en_US'){
Notifications.error('Failure', err, 'Unable to upload file');
        } else {
            Notifications.error('失败', err, '无法上传文件');
        }
        
      });
  };

  function parentPath(path) {
    if (path.lastIndexOf('/') === 0) {
      return '/';
    }

    var split = _.split(path, '/');
    return _.join(_.slice(split, 0, split.length - 1), '/');
  }

  function buildPath(parent, file) {
    if (parent === '/') {
      return parent + file;
    }
    return parent + '/' + file;
  }


  this.$onInit = function() {
    HttpRequestHelper.setPortainerAgentTargetHeader(this.nodeName);
    VolumeBrowserService.ls(this.volumeId, this.state.path)
    .then(function success(data) {
      ctrl.files = data;
    })
    .catch(function error(err) {
      if(language==='en_US'){
      Notifications.error('Failure', err, 'Unable to browse volume');

      } else {
       Notifications.error('失败', err, '无法浏览volume');

      }
    });
  };

  function onFileUploaded() {
    refreshList();
  }

  function refreshList() {
    browse(ctrl.state.path);
  }

  

}]);
