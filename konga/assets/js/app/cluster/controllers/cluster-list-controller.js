(function() {
    'use strict';

    /**
     * Model for Author API, this is used to wrap all Author objects specified actions and data change actions.
     */
    angular.module('frontend.cluster')
        .controller('ClusterListController', [
            '$scope','Cluster', 'ListConfig','$state','Semver','$rootScope','I18N',
            function($scope,Cluster,ListConfig, $state, Semver, $rootScope,I18N) {

                Cluster.setScope($scope, false, 'items', 'itemCount');
                $scope = angular.extend($scope, angular.copy(ListConfig.getConfig('cluster.nodes',Cluster)));

                $scope.name = I18N.T('name');
                function _fetchData() {
                    $scope.loading = true;
                    Cluster.load({
                        size : $scope.itemsFetchSize
                    }).then(function(response){
                        $scope.items = response;
                        $scope.loading= false;
                    })
                }

                _fetchData();


                $scope.$on('user.node.updated',function(node){
                    _fetchData();
                })

            }
        ])
    ;
}());