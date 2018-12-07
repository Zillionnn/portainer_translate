angular.module('portainer.agent').controller('HostBrowserController', ['$rootScope',
  'HostBrowserService', 'Notifications', 'FileSaver', 'ModalService',
  function HostBrowserController($rootScope, HostBrowserService, Notifications, FileSaver, ModalService) {
    var ctrl = this;
    var ROOT_PATH = '/host';
    
    var language = $rootScope.language

    ctrl.state = {
      path: ROOT_PATH
    };

    ctrl.goToParent = goToParent;
    ctrl.browse = browse;
    ctrl.renameFile = renameFile;
    ctrl.downloadFile = downloadFile;
    ctrl.deleteFile = confirmDeleteFile;
    ctrl.isRoot = isRoot;
    ctrl.onFileSelectedForUpload = onFileSelectedForUpload;
    ctrl.$onInit = $onInit;
    ctrl.getRelativePath = getRelativePath;

    function getRelativePath(path) {
      path = path || ctrl.state.path;
      var rootPathRegex = new RegExp('^' + ROOT_PATH + '\/?');
      var relativePath = path.replace(rootPathRegex, '/');
      return relativePath;
    }

    function goToParent() {
      getFilesForPath(parentPath(this.state.path));
    }

    function isRoot() {
      return ctrl.state.path === ROOT_PATH;
    }

    function browse(folder) {
      getFilesForPath(buildPath(ctrl.state.path, folder));
    }

    function getFilesForPath(path) {
      HostBrowserService.ls(path)
        .then(function onFilesLoaded(files) {
          ctrl.state.path = path;
          ctrl.files = files;
        })
        .catch(function onLoadingFailed(err) {
          if(language==='en_US'){
            Notifications.error('Failure', err, 'Unable to browse');
          } else {
            Notifications.error('失败', err, '无法浏览');
          }
        });
    }

    function renameFile(name, newName) {
      var filePath = buildPath(ctrl.state.path, name);
      var newFilePath = buildPath(ctrl.state.path, newName);

      HostBrowserService.rename(filePath, newFilePath)
        .then(function onRenameSuccess() {
          if(language==='en_US'){
            Notifications.success('File successfully renamed', getRelativePath(newFilePath));

          } else {
            Notifications.success('文件重命名成功', getRelativePath(newFilePath));
          }
          return HostBrowserService.ls(ctrl.state.path);
        })
        .then(function onFilesLoaded(files) {
          ctrl.files = files;
        })
        .catch(function notifyOnError(err) {
          if(language==='en_US'){
            Notifications.error('Failure', err, 'Unable to rename file');
          } else {
            Notifications.error('失败', err, '无法重命名文件');
          }
          
        });
    }

    function downloadFile(file) {
      var filePath = buildPath(ctrl.state.path, file);
      HostBrowserService.get(filePath)
        .then(function onFileReceived(data) {
          var downloadData = new Blob([data.file], {
            type: 'text/plain;charset=utf-8'
          });
          FileSaver.saveAs(downloadData, file);
        })
        .catch(function notifyOnError(err) {
          if(language==='en_US'){
            Notifications.error('Failure', err, 'Unable to download file');
          } else {
            Notifications.error('失败', err, '无法下载文件');
          }
          
        });
    }

    function confirmDeleteFile(name) {
      var filePath = buildPath(ctrl.state.path, name);

      ModalService.confirmDeletion(
        'Are you sure that you want to delete ' + getRelativePath(filePath) + ' ?',
        function onConfirm(confirmed) {
          if (!confirmed) {
            return;
          }
          return deleteFile(filePath);
        }
      );
    }

    function deleteFile(path) {
      HostBrowserService.delete(path)
        .then(function onDeleteSuccess() {
          if(language==='en_US'){
            Notifications.success('File successfully deleted', getRelativePath(path));

          } else {
            Notifications.success('文件删除成功', getRelativePath(path));
          }
          return HostBrowserService.ls(ctrl.state.path);
        })
        .then(function onFilesLoaded(data) {
          ctrl.files = data;
        })
        .catch(function notifyOnError(err) {
          if(language==='en_US'){
            Notifications.error('Failure', err, 'Unable to delete file');
          } else {
            Notifications.error('失败', err, '无法删除文件');
          }
          
        });
    }

    function $onInit() {
      getFilesForPath(ROOT_PATH);
    }

    function parentPath(path) {
      if (path === ROOT_PATH) {
        return ROOT_PATH;
      }

      var split = _.split(path, '/');
      return _.join(_.slice(split, 0, split.length - 1), '/');
    }

    function buildPath(parent, file) {
      if (parent.lastIndexOf('/') === parent.length - 1) {
        return parent + file;
      }
      return parent + '/' + file;
    }

    function onFileSelectedForUpload(file) {
      HostBrowserService.upload(ctrl.state.path, file)
        .then(function onFileUpload() {
          onFileUploaded();
        })
        .catch(function onFileUpload(err) {
          Notifications.error('Failure', err, 'Unable to upload file');
        });
    }

    function onFileUploaded() {
      refreshList();
    }

    function refreshList() {
      getFilesForPath(ctrl.state.path);
    }
  }
]);
