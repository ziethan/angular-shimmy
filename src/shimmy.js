angular.module('angular-shimmy', [])

.factory('shimmyCenter', function() {
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
        };
    }
    return center;
})

.factory('shimmyGenerateId', function() {
    function generateId(length) {
        var i, l = length || 10,
            an = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWSXYZ',
            id = '';
    
        for(i=l;i--;) {
            id += an.charAt((Math.random()*an.length)+1);
        }
        return id;
    }
    
    return generateId;
})

.factory('shimmyTemplate', function(shimmyGenerateId) {
    function template(templateCache, contentTemplateUrl) {
        var temp = shimmyGenerateId(20);
        templateCache.put(temp, contentTemplateUrl);
        return temp;
    }
        
    return template;
})

.directive('shimmyButton', function($compile) {
    return {
        restrict: 'E'
      , scope: {
            shimmyClass:        '@'
          , shimmyContentClass: '@'
          , contentTemplate:    '@'
          , contentTemplateUrl: '@'
          , closeable:          '@'
        }
      , tranclude: true
      , link: function(scope, elem, attrs) {
            var contentTemplate = attrs.contentTemplate || ""
              , contentTemplateUrl = attrs.contentTemplateUrl || ""
              , shimmyClass = attrs.shimmyClass || ""
              , shimmyContentClass = attrs.shimmyContentClass || ""
              , closeable = attrs.closeable || false
              , el = '<shimmy class="'+shimmyClass+'" shimmy-content-class="'+shimmyContentClass+'" closeable='+closeable+' content-template="'+contentTemplate+'" content-template-url="'+contentTemplateUrl+'"></shimmy>';
            
            elem.on('click', function() {
                document.body.appendChild($compile(el)(scope)[0]);
            });
        }
    };
})

.directive('shimmy', function($compile) {
    return {
        restrict: 'E'
      , scope: {
            contentTemplate:    '@'
          , contentTemplateUrl: '@'
          , shimmyContentClass: '@'
          , closeable:          '@'
        }
      , controller: function($scope, $q) {
            $scope.defer = $q.defer();
            return $scope.defer;
        }
      , transclude: true
      , template: '<shimmy-content closeable="{{closeable}}" shimmy-content-class="{{shimmyContentClass}}" content-template="{{contentTemplate}}" content-template-url="{{contentTemplateUrl}}"></shimmy-content>'
      , link: function(scope, elem, attrs, ctrl) {
            ctrl.resolve(elem);
            
            if(attrs.closeable) {
                elem.on('click', function() {
                    document.body.removeChild(elem[0]);
                });
            }
        }
    };
})

.directive('shimmyContent', function($compile, $timeout, $templateCache, shimmyTemplate, shimmyCenter) {
    return {
        restrict: 'E'
      , scope: {
            contentTemplate:    '@'
          , contentTemplateUrl: '@'
          , shimmyContentClass: '@'
          , closeable:          '@'
        }
      , require: '^shimmy'
      , tranclude: true
      , link: function(scope, elem, attrs) {
            var template = attrs.contentTemplate || $templateCache.get(attrs.contentTemplateUrl) || $templateCache.get(shimmyTemplate($templateCache, attrs.contentTemplateUrl)) || '';
            
            if(attrs.closeable) {
                elem.append($compile('<shimmy-close></shimmy-close>')(scope));
            }
            elem.append($compile(template)(scope));
            elem.addClass(attrs.shimmyContentClass);
            $timeout(function() {
                var css = shimmyCenter(elem);
                elem.css(css); 
                elem.on('click', function(e) {
                    e.stopPropagation();
                });
            });
        }
    };
})

.directive('shimmyClose', function() {
    return {
        restrict: 'E'
      , translude: true
      , template: '<span>&times;</span>'
      , link: function(scope, elem, attrs, ctrl) {
            scope.$watch('$parent', function(nv, ov) {
                if(nv && nv.defer) {
                    nv.defer.promise.then(function(shimmy) {
                        elem.on('click', function() {
                            document.body.removeChild(shimmy[0]);
                        });
                    });
                }
            });
        }
    };
});




/*
    <shimmy-button shimmy-class="foo" shimmy-content-class="shim-test-class" content-template-url="foo.html">Shimmy on over</shimmy-button>
    <script type="text/ng-template" id="foo.html"><button class='btn btn-primary'>foo</button></script>
*/