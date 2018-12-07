angular.module('portainer.docker')
.controller('ImageController', ['$rootScope', '$q', '$scope', '$transition$', '$state', '$timeout', 'ImageService', 'RegistryService', 'Notifications', 'HttpRequestHelper', 'ModalService', 'FileSaver', 'Blob',
function ($rootScope, $q, $scope, $transition$, $state, $timeout, ImageService, RegistryService, Notifications, HttpRequestHelper, ModalService, FileSaver, Blob) {
	$scope.formValues = {
		Image: '',
		Registry: ''
	};

	$scope.state = {
		exportInProgress: false
	};

	$scope.sortType = 'Order';
	$scope.sortReverse = false;

	$scope.order = function(sortType) {
    $scope.sortReverse = ($scope.sortType === sortType) ? !$scope.sortReverse : false;
    $scope.sortType = sortType;
  };

	$scope.toggleLayerCommand = function(layerId) {
		$('#layer-command-expander'+layerId+' span').toggleClass('glyphicon-plus-sign glyphicon-minus-sign');
		$('#layer-command-'+layerId+'-short').toggle();
		$('#layer-command-'+layerId+'-full').toggle();
	};

	$scope.tagImage = function() {
		var image = $scope.formValues.Image;
		var registry = $scope.formValues.Registry;

		ImageService.tagImage($transition$.params().id, image, registry.URL)
		.then(function success() {
			if($rootScope.language==='en_US'){
			Notifications.success('Image successfully tagged');

			} else {
		 Notifications.success('图像已成功标记');
 
			}
			$state.go('docker.images.image', {id: $transition$.params().id}, {reload: true});
		})
		.catch(function error(err) {
			if($rootScope.language==='en_US'){
			Notifications.error('Failure', err, 'Unable to tag image');

			} else {
		 	Notifications.error('失败', err, '无法标记图片');
 
			}
		});
	};

	$scope.pushTag = function(repository) {
		$('#uploadResourceHint').show();
		RegistryService.retrieveRegistryFromRepository(repository)
		.then(function success(data) {
			var registry = data;
			return ImageService.pushImage(repository, registry);
		})
		.then(function success() {
			if($rootScope.language==='en_US'){
			Notifications.success('Image successfully pushed', repository);

			} else {
				Notifications.success('图像成功推送', repository);
	  
			}
		})
		.catch(function error(err) {
			if($rootScope.language==='en_US'){
			Notifications.error('Failure', err, 'Unable to push image to repository');

			} else {
					Notifications.error('失败', err, '无法将图像推送到存储库');
  
			}
		})
		.finally(function final() {
			$('#uploadResourceHint').hide();
		});
	};

	$scope.pullTag = function(repository) {
		$('#downloadResourceHint').show();
		RegistryService.retrieveRegistryFromRepository(repository)
		.then(function success(data) {
			var registry = data;
			return ImageService.pullImage(repository, registry, false);
		})
		.then(function success() {
			Notifications.success('Image successfully pulled', repository);
		})
		.catch(function error(err) {
			if($rootScope.language==='en_US'){
			Notifications.error('Failure', err, 'Unable to pull image');

			} else {
		  	Notifications.error('失败', err, '无法获取图像');

			}
		})
		.finally(function final() {
			$('#downloadResourceHint').hide();
		});
	};

	$scope.removeTag = function(repository) {
		ImageService.deleteImage(repository, false)
		.then(function success() {
			if ($scope.image.RepoTags.length === 1) {
				if($rootScope.language==='en_US'){
				Notifications.success('Image successfully deleted', repository);

				} else {
			Notifications.success('镜像删除成功', repository);

				}
				$state.go('docker.images', {}, {reload: true});
			} else {
				if($rootScope.language==='en_US'){
				Notifications.success('Tag successfully deleted', repository);

				} else {
			Notifications.success('标签删除成功', repository);

				}
				$state.go('docker.images.image', {id: $transition$.params().id}, {reload: true});
			}
		})
		.catch(function error(err) {
			if($rootScope.language==='en_US'){
			Notifications.error('Failure', err, 'Unable to remove image');

			} else {
			Notifications.error('失败', err, '无法移除镜像');
		  
			}
		});
	};

	$scope.removeImage = function (id) {
		ImageService.deleteImage(id, false)
		.then(function success() {
			if($rootScope.language==='en_US'){
			Notifications.success('Image successfully deleted', id);

			} else {
			Notifications.success('镜像已成功删除', id);

			}
			$state.go('docker.images', {}, {reload: true});
		})
		.catch(function error(err) {
			if($rootScope.language==='en_US'){
			Notifications.error('Failure', err, 'Unable to remove image');

			} else {
		 			Notifications.error('失败', err, '无法移除镜像');
 
			}
		});
	};

	function exportImage(image) {
		HttpRequestHelper.setPortainerAgentTargetHeader(image.NodeName);
		$scope.state.exportInProgress = true;
		ImageService.downloadImages([image])
		.then(function success(data) {
			var downloadData = new Blob([data.file], { type: 'application/x-tar' });
			FileSaver.saveAs(downloadData, 'images.tar');
			if($rootScope.language==='en_US'){
			Notifications.success('Image successfully downloaded');

			} else {
		  	Notifications.success('镜像下载成功');

			}
		})
		.catch(function error(err) {
			if($rootScope.language==='en_US'){
			Notifications.error('Failure', err, 'Unable to download image');

			} else {
			Notifications.error('失败', err, '无法下载镜像');
	  
			}
		})
		.finally(function final() {
			$scope.state.exportInProgress = false;
		});
	}

	$scope.exportImage = function (image) {
		if (image.RepoTags.length === 0 || _.includes(image.RepoTags, '<none>')) {
			if($rootScope.language==='en_US'){
			Notifications.warning('', 'Cannot download a untagged image');

			} else {
		  Notifications.warning('', '无法下载未标记的镜像');

			}
			return;
		}

		ModalService.confirmImageExport(function (confirmed) {
			if(!confirmed) { return; }
			exportImage(image);
		});
	};

	function initView() {
		HttpRequestHelper.setPortainerAgentTargetHeader($transition$.params().nodeName);
		var endpointProvider = $scope.applicationState.endpoint.mode.provider;
		$q.all({
			image: ImageService.image($transition$.params().id),
			history: endpointProvider !== 'VMWARE_VIC' ? ImageService.history($transition$.params().id) : []
		})
		.then(function success(data) {
			$scope.image = data.image;
			$scope.history = data.history;
		})
		.catch(function error(err) {
			if($rootScope.language==='en_US'){
			Notifications.error('Failure', err, 'Unable to retrieve image details');

			} else {
			Notifications.error('失败', err, '无法检索图像详细信息');
  
			}
			$state.go('docker.images');
		});
	}

	initView();
}]);
