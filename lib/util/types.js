export function isArray (test) {
  return Object.prototype.toString.call(test) === '[object Array]';
}

export function isFunction (test) {
  return Object.prototype.toString.call(test) === '[object Function]';
}

export function isString (test) {
  return Object.prototype.toString.call(test) === '[object String]';
}

export function isInstanceOf (test, clazz) {
  return test instanceof clazz;
}

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const hexRegex = /^[0-9A-Fa-f]+$/i;

export function checkConversion (value, type) {
  if (type.indexOf('bytes') > -1 && uuidRegex.test(value)) {
    return value.replace(new RegExp('-'.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1"), 'g'), '');
  }
  //replace date
  if (type.indexOf('uint') > -1 && typeof value == 'string' && Date.parse(value) != NaN ) {
    return new Date(value).getTime()  / 1000 | 0;
  }

  //taken care of leading '0x' for byte arrays and addresses
  if ((type.indexOf('bytes') > -1 || type == 'address') && value.indexOf('0x') == 0) {
    return value.replace('0x', '');
  }

  //manage strings that have been passed to byte arrays
  if (type.indexOf('bytes') > -1 && !hexRegex.test(value)) {
    var arr = [];
    for (var i = 0, l = value.length; i < l; i ++) {
      var hex = Number(value.charCodeAt(i)).toString(16);
      arr.push(hex);
    }
    return arr.join('');
  }
  return value;
}