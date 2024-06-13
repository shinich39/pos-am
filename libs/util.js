'use strict';

let __uniq__ = 0;

/**
 * 
 * @param {*} obj 
 * @returns 
 */
function isBoolean(obj) {
  return typeof obj === "boolean";
}

/**
 * 
 * @param {*} obj 
 * @returns 
 */
function isNumber(obj) {
  return typeof obj === "number" && !Number.isNaN(obj) && Number.isFinite(obj);
}

/**
 * 
 * @param {*} obj 
 * @returns 
 */
function isNumeric(obj) {
  if (isString(obj)) {
    return !Number.isNaN(parseFloat(obj)) && Number.isFinite(parseFloat(obj));
  } else {
    return isNumber(obj);
  }
}

/**
 * 
 * @param {*} obj 
 * @returns 
 */
function isString(obj) {
  return typeof obj === "string";
}

/**
 * 
 * @param {*} obj 
 * @returns 
 */
function isEmptyString(obj) {
  return isString(obj) && obj.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "") === ""; // trim
}

/**
 * 
 * @param {*} obj 
 * @returns 
 */
function isObject(obj) {
  return typeof obj === "object" && obj !== null && obj.constructor === Object && Object.getPrototypeOf(obj) === Object.prototype;
}

/**
 * 
 * @param {*} obj 
 * @returns 
 */
function isEmptyObject(obj) {
  return isObject(obj) && Object.keys(obj).length === 0;
}

/**
 * 
 * @param {*} obj 
 * @returns 
 */
function isNull(obj) {
  return typeof obj === "object" && obj === null;
}

/**
 * 
 * @param {*} obj 
 * @returns 
 */
function isArray(obj) {
  if (Array && Array.isArray) {
    return Array.isArray(obj);
  } else {
    return Object.prototype.toString.call(obj) === "[object Array]";
  }
}

/**
 * 
 * @param {*} obj 
 * @returns 
 */
function isBooleanArray(obj) {
  if (!isArray(obj)) {
    return false;
  }
  for (const item of obj) {
    if (!isBoolean(item)) {
      return false;
    }
  }
  return true;
}

/**
 * 
 * @param {*} obj 
 * @returns 
 */
function isNumberArray(obj) {
  if (!isArray(obj)) {
    return false;
  }
  for (const item of obj) {
    if (!isNumber(item)) {
      return false;
    }
  }
  return true;
}

/**
 * 
 * @param {*} obj 
 * @returns 
 */
function isStringArray(obj) {
  if (!isArray(obj)) {
    return false;
  }
  for (const item of obj) {
    if (!isString(item)) {
      return false;
    }
  }
  return true;
}

/**
 * 
 * @param {*} obj 
 * @returns 
 */
function isObjectArray(obj) {
  if (!isArray(obj)) {
    return false;
  }
  for (const item of obj) {
    if (!isObject(item)) {
      return false;
    }
  }
  return true;
}

/**
 * 
 * @param {*} obj 
 * @returns 
 */
function isEmptyArray(obj) {
  return isArray(obj) && obj.length === 0;
}

/**
 * 
 * @param {*} obj 
 * @returns 
 */
function isFunction(obj) {
  return typeof obj === "function";
}

/**
 * 
 * @param {*} obj 
 * @returns 
 */
function isEmpty(obj) {
  return obj === undefined || isNull(obj);
}

/**
 * 
 * @param {*} obj 
 * @returns 
 */
function isUndefined(obj) {
  return obj === undefined;
}

/**
 * 
 * @param {*} objA 
 * @param {*} objB 
 * @returns 
 */
function isSameType(objA, objB) {
  return typeof objA === typeof objB && objA.constructor === objB.constructor;
}

/**
 * 
 * @param {number} min 
 * @param {number} max 
 * @returns 
 */
function random(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * 
 * @param {string} str 
 * @returns 
 */
function splitInt(str) {
  return str.split(/([0-9]+)/);
}

/**
 * 
 * @param {string} str 
 * @returns 
 */
function splitFloat(str) {
  return str.split(/([0-9]{0,}\.{0,1}[0-9]{1,})+/);
}

/**
 * 
 * @param {string} str 
 * @returns 
 */
function toHalfWidth(str) {
  return str
    .replace(/[！-～]/g, function(ch) {
      return String.fromCharCode(ch.charCodeAt(0) - 0xfee0);
    })
    .replace(/[^\S\r\n]/g, function(ch) {
      return " ";
    });
}

/**
 * 
 * @param {string} str 
 * @returns 
 */
function toFullWidth(str) {
  return str
    .replace(/[!-~]/g, function(ch) {
      return String.fromCharCode(ch.charCodeAt(0) + 0xfee0);
    })
    .replace(/[^\S\r\n]/g, function(ch) {
      return "　";
    });
}

/**
 * Get diff between two strings.
 * @param {string} strA 
 * @param {string} strB 
 * @returns {{ acc: number, result: { type: number, value: string }[] }}
 */
function compareStrings(strA, strB) {
  // create dp
  function C(a, b) {
    const dp = [];
    for (let i = 0; i < a.length + 1; i++) {
      dp.push([]);
      for (let j = 0; j < b.length + 1; j++) {
        dp[i][j] = 0;
      }
    }
    return dp;
  }

  // match a to b
  function M(dp, a, b) {
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        // 1 more characters in dp
        if (a[i-1] === b[j-1]) {
          dp[i][j] = dp[i-1][j-1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
        }
      }
    }
    return dp;
  }

  // write diffs
  function P(dp, a, b) {
    let MATCH = 0, 
        INSERT = 1, 
        DELETE = -1, 
        res = [],
        matches = 0,
        i = a.length, 
        j = b.length;
    while (i > 0 || j > 0) {
      const prev = res[res.length - 1];
      const itemA = a[i-1];
      const itemB = b[j-1];
      if (i > 0 && j > 0 && itemA === itemB) {
        // matched
        if (prev && prev.type === MATCH) {
          prev.value = itemA + prev.value; // add to prev
        } else {
          res.push({ type: MATCH, value: itemA });
        }
        matches++;
        i--;
        j--;
      } else if (j > 0 && (i === 0 || dp[i][j-1] >= dp[i-1][j])) {
        // inserted
        if (prev && prev.type === INSERT) {
          prev.value = itemB + prev.value; // add to prev
        } else {
          res.push({ type: INSERT, value: itemB });
        }
        j--;
      } else if (i > 0 && (j === 0 || dp[i][j-1] < dp[i-1][j])) {
        // deleted
        if (prev && prev.type === DELETE) {
          prev.value = itemA + prev.value; // add to prev
        } else {
          res.push({ type: DELETE, value: itemA });
        }
        i--;
      }
    }
    return {
      acc: matches * 2 / (a.length + b.length),
      result: res.reverse(),
    }
  }

  return P(M(C(strA, strB), strA, strB), strA, strB);
}

/**
 * Generate id mongodb objectId style.
 * @returns 
 */
function id() {
  return Math.floor(new Date().getTime() / 1000).toString(16) + "xxxxxx".replace(/x/g, function(v) {
    return Math.floor(Math.random() * 16).toString(16);
  }) + (__uniq__++).toString(16).padStart(6, "0");
}

/**
 * Encrypt string with XOR Cipher
 * @param {string} str 
 * @param {string} salt 
 * @returns 
 */
function xor(str, salt) {
  if (salt.length === 0) {
    return str;
  }
  let res = "", i = 0;
  while(salt.length < str.length) {
    salt += salt;
  }
  while(i < str.length) {
    res += String.fromCharCode(str.charCodeAt(i) ^ salt.charCodeAt(i));
    i++;
  }
  return res;
}

/**
 * Parse string command to array.
 * @param {string} str 
 * @returns 
 * @example
 * parseCommand("git commit -m \'update \\'many\\' features\' -f true")
 * // ['git', 'commit', '-m', "update \\'many\\' features", '-f', 'true']
 */
function parseCommand(str) {
  let result = [],
      i = 0,
      tmp = str.replace(/\\'|\\"/g, "00"),
      bracket = null,
      part = "";
  while(i < str.length) {
    if (!bracket) {
      if (tmp[i] === "\'" || tmp[i] === "\"") {
        bracket = str[i];
      } else if (tmp[i] === " ") {
        if (part !== "") {
          result.push(part);
          part = "";
        }
      } else {
        part += str[i];
      }
    } else {
      if (tmp[i] === bracket) {
        result.push(part);
        part = "";
        bracket = null;
      } else {
        part += str[i];
      }
    }
    i++;
  }
  if (part.trim() !== "") {
    result.push(part);
  }
  return result;
}

/**
 * Parse query string in url.
 * @param {string} str 
 * @returns 
 */
function parseQuery(str) {
  const qs = str.indexOf("?") > -1 ? str.split("?").pop() : str;
  let result = {};
  for (const [key, value] of new URLSearchParams(qs).entries()) {
    if (!result[key]) {
      result[key] = [value];
    } else {
      result[key].push(value);
    }
  }
  return result;
}

/**
 * Parse $ + key in string.
 * 
 * Dot notation supported.
 * @param {string} str 
 * @param {object} obj 
 * @example
 * const str = "${color.name} sky";
 * const obj = {color:{name:"blue"}};
 * parseTemplate(str, obj); // "blue sky"
 */
function parseTemplate(str, obj) {
  return str.replace(/\$\{[^}]+\}/g, function(item) {
    const key = item.substring(2, item.length - 1) ?? "";
    if (key.indexOf(".") > -1) {
      return parseTemplate("${"+key.split(".").slice(1).join(".")+"}", obj[key.split(".")[0]]);
    } else {
      return obj[key] ?? "";
    }
  });
}

/**
 * Fill array to deepcopied value.
 * @param {number} len 
 * @param {*} value 
 * @returns 
 */
function createArray(len, value) {
  let arr = new Array(len);
  if (isFunction(value)) {
    for (let i = 0; i < len; i++) {
      arr[i] = value(i);
    }
  } else if (isObject(value)) {
    for (let i = 0; i < len; i++) {
      arr[i] = clone(value);
    }
  } else if (isArray(value)) {
    for (let i = 0; i < len; i++) {
      arr[i] = clone(value);
    }
  } else if (typeof value !== "undefined") {
    for (let i = 0; i < len; i++) {
      arr[i] = value;
    }
  }
  return arr;
}

/**
 * Get minimum value in array.
 * @param {number[]} arr 
 * @returns 
 */
function getMinValue(arr) {
  return arr.reduce(function(prev, curr) {
    return curr < prev ? curr : prev;
  }, arr[0] || 0);
}

/**
 * Get maximum value in array.
 * @param {number[]} arr 
 * @returns 
 */
function getMaxValue(arr) {
  return arr.reduce(function(prev, curr) {
    return curr > prev ? curr : prev;
  }, arr[0] || 0);
}

/**
 * Get arithmetic mean.
 * @param {number[]} arr 
 * @returns 
 */
function getMeanValue(arr) {
  return arr.reduce(function(prev, curr) {
    return prev + curr;
  }, 0) / arr.length;
}

/**
 * Get most frequent value in array.
 * @param {any[]} arr 
 * @returns 
 */
function getModeValue(arr) {
  let seen = {}, 
      maxValue = arr[0], 
      maxCount = 1;
  for (let i = 0; i < arr.length; i++) {
    const value = arr[i];
    seen[value] = seen[value] ? seen[value] + 1 : 1;
    if (seen[value] > maxCount) {
      maxValue = value;
      maxCount = seen[value];
    }
  }
  return maxValue;
}

/**
 * Sort array ascending order.
 * 
 * Order of types: 
 * 
 * [undefined, null, boolean, number, string, object, array, function]
 * @param {any[]} arr 
 * @returns 
 */
function sortArray(arr) {
  const priorities = [
    isUndefined,
    isNull,
    isBoolean,
    isNumber,
    isString,
    isObject,
    isArray,
    isFunction,
  ];
  return arr.sort(function(a, b) {
    const aIdx = priorities.findIndex(function(fn) {
      return fn(a);
    });

    const bIdx = priorities.findIndex(function(fn) {
      return fn(b);
    });

    if (aIdx !== bIdx) {
      return aIdx - bIdx;
    } else if (aIdx === 0 || aIdx === 1) {
      // undefined, null
      return 0;
    } else if (aIdx === 2) {
      // boolean
      return a !== b ? (a ? 1 : -1) : 0;
    } else if (aIdx === 3) {
      // number
      return a - b;
    } else if (aIdx === 4) {
      // string
      return a.localeCompare(b, undefined, {
        numeric: true,
        sensitivity: 'base',
      });
    } else if (aIdx === 5) {
      // object
      return Object.keys(a).length - Object.keys(b).length;
    } else if (aIdx === 6) {
      // array
      return a.length - b.length;
    } else {
      // function, others
      return 0;
    }
  });
}

/**
 * Ref.
 * https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
 * @param {any[]} arr 
 * @returns 
 */
function shuffleArray(arr) {
  let i = arr.length;
  while (i > 0) {
    let j = Math.floor(Math.random() * i);
    i--;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Get random value in array.
 * @param {any[]} arr 
 * @returns 
 */
function getRandomValue(arr) {
  return arr[Math.floor(random(0, arr.length))];
}

/**
 * 
 * @param {any[][]} arr e.g. [[1,2,3],[4,5,6,7],[8,9,10]]
 * @returns {any[]}
 */
function getAllCases(arr) {
  
  function getFirstIndexes(a) {
    if (a.length < 1) {
      return;
    }
    const result = [];
    for (let i = 0; i < a.length; i++) {
      result.push(0);
    }
    return result;
  }
  
  function getNextIndexes(a, indexes) {
    for (let i = a.length - 1; i >= 0; i--) {
      // decrease current index
      if (indexes[i] < a[i].length - 1) {
        indexes[i] += 1;
        return indexes;
      }
      // reset current index
      indexes[i] = 0;
    }
    return;
  }

  function getValues(a, indexes) {
    const result = [];
    for (let i = 0; i < a.length; i++) {
      result.push(a[i][indexes[i]]);
    }
    return result;
  }

  const result = [];
  let indexes = getFirstIndexes(arr);
  while(indexes) {
    const values = getValues(arr, indexes);
    result.push(values);
    indexes = getNextIndexes(arr, indexes);
  }
  return result;
}

/**
 * Deepcopy object, array...
 * @param {*} obj 
 * @returns 
 */
function copyObject(obj) {
  const result = isArray(obj) ? [] : {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = isObject(value) && !isNull(value) ? copyObject(value) : value;
  }
  return result;
}

/**
 * 
 * @param {object[]} arr 
 * @param {string} key
 */
function groupByKey(arr, key) {
  const group = {};
  for (const obj of arr) {
    if (!group[String(obj[key])]) {
      group[String(obj[key])] = [obj];
    } else {
      group[String(obj[key])].push(obj);
    }
  }
  return group;
} 

/**
 * Query operator list:
 * 
 * $and, $nand, $or, $nor, $in, $nin, $gt, $gte, $lt, $lte, $eq, $ne, $fn, $re
 * 
 * https://www.mongodb.com/docs/manual/tutorial/query-documents/
 * @param {object} obj 
 * @param {object} qry 
 * @returns 
 */
function queryObject(obj, qry) {
  const QUERY_OPERATORS = {
    and: ["$and"],
    notAnd: ["$notAnd", "$nand"],
    or: ["$or"],
    notOr: ["$notOr", "$nor"],
    not: ["$not"],
    include: ["$include", "$in"],
    exclude: ["$exclude", "$nin"],
    greaterThan: ["$greaterThan", "$gt"],
    greaterThanOrEqual: ["$greaterThanOrEqual", "$gte"],
    lessThan: ["$lessThan", "$lt"],
    lessThanOrEqual: ["$lessThanOrEqual", "$lte"],
    equal: ["$equal", "$eq"],
    notEqual: ["$notEqual", "$neq", "$ne"],
    function: ["$function", "$func", "$fn"],
    regexp: ["$regexp", "$regex", "$re", "$reg"],
  }

  function A(d, q) {
    for (const [key, value] of Object.entries(q)) {
      if (!B(d, value, key.split("\."))) {
        return false;
      }
    }
    return true;
  }

  function B(d, q, k) {
    const o = k.shift();
    if (k.length > 0) {
      if (isObject(d)) {
        return B(d[o], q, k);
      } else {
        return false;
      }
    }
    return C(d, q, o);
  }

  function C(d, q, o) {
    if (QUERY_OPERATORS.and.indexOf(o) > -1) {
      for (const v of q) {
        if (!A(d, v)) {
          return false;
        }
      }
      return true;
    } else if (QUERY_OPERATORS.notAnd.indexOf(o) > -1) {
      return !C(d, q, "$and");
    } else if (QUERY_OPERATORS.or.indexOf(o) > -1) {
      for (const v of q) {
        if (A(d, v)) {
          return true;
        }
      }
      return false;
    } else if (QUERY_OPERATORS.notOr.indexOf(o) > -1) {
      return !C(d, q, "$or");
    } else if (QUERY_OPERATORS.not.indexOf(o) > -1) {
      return !A(d, q);
    } else if (QUERY_OPERATORS.include.indexOf(o) > -1) {
      if (isArray(d)) {
        for (const v of d) {
          if (!C(v, q, "$include")) {
            return false;
          }
        }
        return true;
      } else {
        for (const v  of q) {
          if (C(d, v, "$equal")) {
            return true;
          }
        }
        return false;
      }
    } else if (QUERY_OPERATORS.exclude.indexOf(o) > -1) {
      return !C(d, q, "$include");
    } else if (QUERY_OPERATORS.greaterThan.indexOf(o) > -1) {
      return d > q;
    } else if (QUERY_OPERATORS.greaterThanOrEqual.indexOf(o) > -1) {
      return d >= q;
    } else if (QUERY_OPERATORS.lessThan.indexOf(o) > -1) {
      return d < q;
    } else if (QUERY_OPERATORS.lessThanOrEqual.indexOf(o) > -1) {
      return d <= q;
    } else if (QUERY_OPERATORS.equal.indexOf(o) > -1) {
      if (isArray(d) && isArray(q)) {
        if (d.length !== q.length) {
          return false;
        }
        for (let i = 0; i < q.length; i++) {
          if (d[i] !== q[i]) {
            return false;
          }
        }
        return true;
      } else {
        return d === q;
      }
    } else if (QUERY_OPERATORS.notEqual.indexOf(o) > -1) {
      return !C(d, q, "$equal");
    } else if (QUERY_OPERATORS.function.indexOf(o) > -1) {
      return q(d);
    } else if (QUERY_OPERATORS.regexp.indexOf(o) > -1) {
      return q.test(d);
    } else if (!isObject(d)) {
      return false;
    } else if (isObject(q)) {
      return A(d[o], q);
    } else {
      return C(d[o], q, "$equal");
    }
  }
  
  return A(obj, qry);
}

/**
 * 
 * @param {{ width: number, height: number }} src source size
 * @param {{ width: number, height: number }} dst destination size
 * @returns 
 */
function getContainedSize(src, dst) {
  const aspectRatio = src.width / src.height;
  if (aspectRatio < dst.width / dst.height) {
    return {
      width: dst.height * aspectRatio,
      height: dst.height,
    }
  } else {
    return {
      width: dst.width,
      height: dst.width / aspectRatio,
    }
  }
}

/**
 * 
 * @param {{ width: number, height: number }} src source size
 * @param {{ width: number, height: number }} dst destination size
 * @returns 
 */
function getCoveredSize(src, dst) {
  const aspectRatio = src.width / src.height;
  if (aspectRatio < dst.width / dst.height) {
    return {
      width: dst.width,
      height: dst.width / aspectRatio,
    }
  } else {
    return {
      width: dst.height * aspectRatio,
      height: dst.height,
    }
  }
}

/**
 * 
 * @param {number} delay ms
 * @returns 
 */
function wait(delay) {
  return new Promise(function(resolve) {
    return setTimeout(resolve, delay);
  });
}

/**
 * Ref.
 * https://stackoverflow.com/questions/24586110/resolve-promises-one-after-another-i-e-in-sequence
 * @param {function[]} funcs The functions will return promise.
 * @returns 
 */
function promiseAll(funcs) {
  return funcs.reduce(function(prev, curr) {
    return prev.then(function(prevResult) {
      return curr().then(function(currResult) {
        return prevResult.concat([currResult]);
      });
    });
  }, Promise.resolve([]));
}

const __module__ = {
  isBoolean,
  isNumber,
  isNumeric,
  isString,
  isEmptyString,
  isObject,
  isEmptyObject,
  isNull,
  isArray,
  isBooleanArray,
  isNumberArray,
  isStringArray,
  isObjectArray,
  isEmptyArray,
  isFunction,
  isEmpty,
  isSameType,

  random,
  id,
  xor, // XOR

  splitInt,
  splitFloat,

  toHalfWidth,
  toFullWidth,

  diff: compareStrings,
  compare: compareStrings,

  parseCommand,
  parseQuery,
  parseTemplate,

  min: getMinValue,
  max: getMaxValue,
  avg: getMeanValue,
  mean: getMeanValue,
  mode: getModeValue,
  
  choose: getRandomValue,
  array: createArray,
  sort: sortArray,
  shuffle: shuffleArray,
  cases: getAllCases,

  copy: copyObject,
  clone: copyObject,
  group: groupByKey,
  query: queryObject,

  contain: getContainedSize,
  cover: getCoveredSize,
  
  wait,
  promiseAll,
}

// esm
export default __module__;

// cjs
// module.exports = __module__;

// browser
// window.jsu = __module__;