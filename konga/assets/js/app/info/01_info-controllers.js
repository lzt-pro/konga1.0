/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function() {
  'use strict';

  angular.module('frontend.info')
    .controller('InfoController', [
      '$scope', '$log', '$state','InfoService','I18N',
      function controller($scope, $log, $state,InfoService, I18N) {

          function _getInfo() {
             InfoService.getInfo()
                 .then(function(response){
                     $scope.info = response.data
                 })
          }

          _getInfo()
          $scope.name = I18N.T('name');
          $scope.$on('user.node.updated',function(node){
              _getInfo()
          })
      }
    ])
  ;
}());
