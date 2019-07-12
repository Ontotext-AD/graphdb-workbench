//http://stamat.wordpress.com/2013/07/03/javascript-object-ordered-property-stringify/
//SORT WITH STRINGIFICATION

define([],
    function() {
		var stringify = {};
		
		
		stringify.orderedStringify = function(o, fn) {
			var props = [];
		    var res = '{';
			for(var i in o) {
				props.push(i);
			}
			props = props.sort(fn);
			
			for(var i = 0; i < props.length; i++) {
				var val = o[props[i]];
				var type = stringify.types[stringify.whatis(val)];
				if(type === 3) {
					val = stringify.orderedStringify(val, fn);
		        } else if(type === 2) {
		        	val = stringify.arrayStringify(val, fn);
		        } else if(type === 1) {
		        	val = '"'+val+'"';
		        }
		        
		        if(type !== 4)
		        	res += '"'+props[i]+'":'+ val+',';
			}
			
		    return res.substring(res, res.lastIndexOf(','))+'}';
		};

		//orderedStringify for array containing objects
		stringify.arrayStringify = function(a, fn) {
			var res = '[';
			for(var i = 0; i < a.length; i++) {
				var val = a[i];
				var type = stringify.types[stringify.whatis(val)];
				if(type === 3) {
					val = stringify.orderedStringify(val, fn);
		        } else if(type === 2) {
		        	val = stringify.arrayStringify(val);
		        } else if(type === 1) {
		        	val = '"'+val+'"';
		        }
		        
		        if(type !== 4)
		        	res += ''+ val+',';
			}
			
			return res.substring(res, res.lastIndexOf(','))+']';
		}

		//SORT WITHOUT STRINGIFICATION

		stringify.sortProperties = function(o, fn) {
			var props = [];
			var res = {};
			for(var i in o) {
				props.push(i);
			}
			props = props.sort(fn);
			
			for(var i = 0; i < props.length; i++) {
				var val = o[props[i]];
				var type = stringify.types[stringify.whatis(val)];
				
				if(type === 3) {
					val = stringify.sortProperties(val, fn);
		        } else if(type === 2) {
		        	val = stringify.sortProperiesInArray(val, fn);
		        } 
				res[props[i]] = val;
			}
			
			return res;
		};

		//sortProperties for array containing objects
		stringify.sortProperiesInArray = function(a, fn) {
			for(var i = 0; i < a.length; i++) {
				var val = a[i];
				var type = stringify.types[stringify.whatis(val)];
				if(type === 3) {
					val = stringify.sortProperties(val, fn);
		        } else if(type === 2) {
		        	val = stringify.sortProperiesInArray(val, fn);
		        }
		        a[i] = val;
			}
			
			return a;
		}

		//HELPER FUNCTIONS

		stringify.types = {
			'integer': 0,
			'float': 0,
			'string': 1,
			'array': 2,
			'object': 3,
			'function': 4,
			'regexp': 5,
			'date': 6,
			'null': 7,
			'undefined': 8,
			'boolean': 9
		}

		stringify.getClass = function(val) {
			return Object.prototype.toString.call(val)
				.match(/^\[object\s(.*)\]$/)[1];
		};

		stringify.whatis = function(val) {

			if (val === undefined)
				return 'undefined';
			if (val === null)
				return 'null';
				
			var type = typeof val;
			
			if (type === 'object')
				type = stringify.getClass(val).toLowerCase();
			
			if (type === 'number') {
				if (val.toString().indexOf('.') > 0)
					return 'float';
				else
					return 'integer';
			}
			
			return type;
		};
		
		return stringify;
	}
);

