if(!AJAMU) {
  var AJAMU = {};
}

if(!String.prototype.escapeRegExp) {
  String.prototype.escapeRegExp = function() {
    return this.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  };
}

AJAMU.initialize = function() {
  var ajas = document.querySelectorAll("aja");
  for(var i=0; i<ajas.length; ++i) {
    var aja = ajas[i];
    aja.style.display = "none";
    var src = aja.getAttribute("src");
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if(request.status === 200) {
        if(request.readyState === 4) {
          aja.value = request.response;
          var parent = aja.parentElement;
          var templateElements = aja.children;
          for(var j=templateElements.length-1; j>=0; --j) {
            var template = templateElements[j];
            AJAMU.replace(
              {
                template: template, 
                value: aja.value
              }
            );
            parent.insertBefore(template, aja.nextSibling);
          }
          parent.removeChild(aja);
        }
      } 
    };
    request.open("GET", src);
    request.responseType = "json";
    request.send();
  }
};

AJAMU.replace = function(spec) {
  var templateHtml = spec.template.innerHTML;
  var replace = function(spec) {
    for(var property in spec.value) {
      var value = spec.value[property];
      if(!spec.property) {
        spec.property = property;
        var qualified = property;
      } else {
        if(Array.isArray(spec.value)) {
          qualified = spec.property + "[" + property + "]";
        } else {
          qualified = spec.property + "." + property;
        }
      }
      if(typeof(value) !== "string" 
        && typeof(value) !== "number"
        && typeof(value) !== "boolean") {
        replace({value: value, property: qualified});
      } else {
        var pattern = new RegExp(("{"+ qualified + "}").escapeRegExp());
        templateHtml = templateHtml.replace(pattern, value);
      }
      spec.property = null;
    }
  };
  replace(spec);
  spec.template.innerHTML = templateHtml;
};
 
(function(){
  window.addEventListener("load", function() {
    AJAMU.initialize();
  });
}());