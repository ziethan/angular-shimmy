function generateId(length) {
    var i, l = length || 10,
        an = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWSXYZ',
        id = '';
    
    for(i=l;i--;) {
        id += an.charAt((Math.random()*an.length)+1);
    }
    return id;
    
}

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

function template(templateCache, contentTemplateUrl) {
    var temp = generateId(20);
    templateCache.put(temp, contentTemplateUrl);
    return temp;
}

angular.module('angular-shimmy', [])

.directive('shimmyButton', function($compile) {
    return {
        restrict: 'E'
      , scope: {
            shimmyClass:        '@'
          , shimmyContentClass: '@'
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
    };
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
    };
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
            var template = attrs.contentTemplate || $templateCache.get(attrs.contentTemplateUrl) || $templateCache.get(template($templateCache, attrs.contentTemplateUrl)) || '';
            
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
    };
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
    };
});

// Eventually become an example


/*
    <shimmy-button shimmy-class="foo" shimmy-content-class="shim-test-class" content-template-url="foo.html">Shimmy on over</shimmy-button>
    <script type="text/ng-template" id="foo.html"><button class='btn btn-primary'>foo</button></script>
*/