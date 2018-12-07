angular.module('portainer.docker')
.controller('ImportImageController', ['$rootScope', '$scope', '$state', 'ImageService', 'Notifications', 'HttpRequestHelper',
function ($rootScope, $scope, $state, ImageService, Notifications, HttpRequestHelper) {

	$scope.state = {
		actionInProgress: false
	};

	$scope.formValues = {
		UploadFile: null,
		NodeName: null
	};

	$scope.uploadImage = function() {
		$scope.state.actionInProgress = true;

		var nodeName = $scope.formValues.NodeName;
		HttpRequestHelper.setPortainerAgentTargetHeader(nodeName);
		var file = $scope.formValues.UploadFile;
		ImageService.uploadImage(file)
		.then(function success() {
			if($rootScope.language==='en_US'){
			Notifications.success('Images successfully uploaded');

			} else {
		 	Notifications.success('镜像已成功上传');
 
			}
		})
		.catch(function error(err) {
			if($rootScope.language==='en_US'){
			Notifications.error('Failure', err.message, 'Unable to upload image');

			} else {
	Notifications.error('失败', err.message, '无法上传镜像');

			}
		})
		.finally(function final() {
			$scope.state.actionInProgress = false;
		});
	};
}]);
