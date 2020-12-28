'use strict';

window.SwaggerUi.utils = {
    parseSecurityDefinitions: function (security, securityDefinitions) {
        var auths = Object.assign({}, securityDefinitions);
        var oauth2Arr = [];
        var authsArr = [];
        var scopes = [];
        var utils = window.SwaggerUi.utils;

        if (!Array.isArray(security)) { return null; }

        security.forEach(function (item) {
            var singleSecurity = {};
            var singleOauth2Security = {};

            for (var key in item) {
                if (Array.isArray(item[key])) {
                    if (!auths[key]) { continue; }
                    auths[key] = auths[key] || {};
                    if (auths[key].type === 'oauth2') {
                        singleOauth2Security[key] = Object.assign({}, auths[key]);
                        singleOauth2Security[key].scopes = Object.assign({}, auths[key].scopes);
                        for (var i in singleOauth2Security[key].scopes) {
                            if (item[key].indexOf(i) < 0) {
                                delete singleOauth2Security[key].scopes[i];
                            }
                        }
                        singleOauth2Security[key].scopes = utils.parseOauth2Scopes(singleOauth2Security[key].scopes);
                        scopes = _.merge(scopes, singleOauth2Security[key].scopes);
                    } else {
                        singleSecurity[key] = Object.assign({}, auths[key]);
                    }
                } else {
                    if (item[key].type === 'oauth2') {
                        singleOauth2Security[key] = Object.assign({}, item[key]);
                        singleOauth2Security[key].scopes = utils.parseOauth2Scopes(singleOauth2Security[key].scopes);
                        scopes = _.merge(scopes, singleOauth2Security[key].scopes);
                    } else {
                        singleSecurity[key] = item[key];
                    }
                }
            }

            if (!_.isEmpty(singleSecurity)) {
                authsArr.push(singleSecurity);
            }

            if (!_.isEmpty(singleOauth2Security)){
                oauth2Arr.push(singleOauth2Security);
            }
        });

        return {
            auths : authsArr,
            oauth2: oauth2Arr,
            scopes: scopes
        };
    },

    parseOauth2Scopes: function (data) {
        var scopes = Object.assign({}, data);
        var result = [];
        var key;

        for (key in scopes) {
            result.push({scope: key, description: scopes[key]});
        }

        return result;
    },

    sanitize: function(html) {
        // Strip the script tags from the html and inline evenhandlers
        html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        html = html.replace(/(on\w+="[^"]*")*(on\w+='[^']*')*(on\w+=\w*\(\w*\))*/gi, '');

        return html;
    },
		//首字母转大写
		firstUpperCase: function(str){
			str = str.replace(str[0],str[0].toUpperCase());
			return str;
		},
		//下划线转驼峰
		underLineToCamel: function(str){
			return str.replace(/\_(\w)/g, function(all, letter){
				return letter.toUpperCase();
			});
		},
		//对象转规范
		objectToAPISpec: function(obj){
    	if(obj && (typeof obj == 'object' || obj instanceof Object)){
		    var newProperties = {};
		    for(var key in obj){
			    var value = obj[key];
			    if(value && (typeof value == 'array' || value instanceof Array)){
			    	value = SwaggerUi.utils.arrayToAPISpec(value);
			    }
			    key = SwaggerUi.utils.underLineToCamel(key);
			    key = SwaggerUi.utils.firstUpperCase(key);
			    newProperties[key] = value;
		    }
		    return newProperties;
	    }else{
    		return obj;
	    }
		},
		//数组转规范
		arrayToAPISpec: function(array){
    	if(array && array.length > 0){
    		var newArray = [];
    		for (var i=0; i < array.length; i++){
    			var item = array[i];
			    if(item && (typeof item == 'object' || item instanceof Object)){
				    item = SwaggerUi.utils.objectToAPISpec(item);
			    }
			    newArray.push(item);
		    }
		    return newArray;
	    }else{
    		return array;
	    }
		}
};