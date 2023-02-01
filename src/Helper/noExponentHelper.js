// export
const noExponents = function (num) {
  try {
    var data = String(num).split(/[eE]/);
    if (data.length === 1) return data[0];
    console.log(data);
    let z = "";
    let sign = num < 0 ? "-" : "";
    let str = data[0].replace(".", "");
    let mag = Number(data[1]) + 1;

    if (mag < 0) {
      z = sign + "0.";
      while (mag++) z += "0";
      return z + str.replace(/^\-/, "");
    }
    mag -= str.length;
    while (mag--) z += "0";
    return str + z;
  } catch (error) {}
};

console.log(noExponents(249980.5198480515));
