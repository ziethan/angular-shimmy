function center(el) {
    var wH = $(window).height(),
        wW = $(window).width(),
        elH = el.height(),
        elW = el.width(),
        top = (wH - elH)/2,
        left = (wW - elW)/2;
        
        return {
            top: top
          , left: left
        }
}

angular.module('binnj.shimmy', [])

.directive('shimmyButton', function($compile) {
    return {
        restrict: 'E'
      , scope: {
            shimmyClass:          '@'
          , shimmyContentClass:   '@'
          , contentTemplate:    '@'
          , contentTemplateUrl: '@'
        }
      , tranclude: true
      , link: function(scope, elem, attrs) {
            var contentTemplate = attrs.contentTemplate || ""
              , contentTemplateUrl = attrs.contentTemplateUrl || ""
              , shimmyClass = attrs.shimmyClass || ""
              , shimmyContentClass = attrs.shimmyContentClass || ""
              , el = '<shimmy class="'+shimmyClass+'" shimmy-content-class="'+shimmyContentClass+'" content-template="'+contentTemplate+'" content-template-url="'+contentTemplateUrl+'"></shimmy>';
            
            elem.on('click', function() {
                document.body.appendChild($compile(el)(scope)[0]);
            });
        }
    }
})

.directive('shimmy', function($compile) {
    return {
        restrict: 'E'
      , scope: {
            contentTemplate:    '@'
          , contentTemplateUrl: '@'
          , shimmyContentClass:   '@'
        }
      , controller: function($scope, $q) {
            $scope.defer = $q.defer();
            return $scope.defer.promise;
        }
      , transclude: true
      , template: '<shimmy-content shimmy-content-class="{{shimmyContentClass}}" content-template="{{contentTemplate}}" content-template-url="{{contentTemplateUrl}}"><shimmy-close></shimmy-close></shimmy-content>'
      , link: function(scope, elem, attrs, ctrl) {
            scope.defer.resolve(elem);
            
            elem.on('click', function() {
                document.body.removeChild(elem[0]);
            });
        }
    }
})

.directive('shimmyContent', function($compile, $timeout, $templateCache) {
    return {
        restrict: 'E'
      , scope: {
            contentTemplate:    '@'
          , contentTemplateUrl: '@'
          , shimmyContentClass:   '@'
        }
      , tranclude: true
      , link: function(scope, elem, attrs) {
            var template = attrs.shimmyTemplate || $templateCache.get(attrs.contentTemplateUrl);
            
            elem.append($compile(template)(scope));
            elem.toggleClass(attrs.shimmyContentClass);
            $timeout(function() {
                var css = center(elem);
                elem.css(css); 
                elem.on('click', function(e) {
                    e.stopPropagation();
                });
            });
        }
    }
})

.directive('shimmyClose', function() {
    return {
        restrict: 'E'
      , scope: {}
      , translude: true
      , require: '^shimmy'
      , template: '<span>&times;</span>'
      , link: function(scope, elem, attrs, ctrl) {
            ctrl.then(function(shimmy) {
                elem.on('click', function() {
                    document.body.removeChild(shimmy[0]);
                });
            });
        }
    }
});