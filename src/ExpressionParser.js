export const replaceExpression = (inputValue, isRadians, previousInput) => {
  let expression = inputValue
    .replace(/sin-1\(/g, "Math.asin(")
    .replace(/cos-1\(/g, "Math.acos(")
    .replace(/tan-1\(/g, "Math.atan(")
    .replace(/ex\(/g, "Math.exp(")
    .replace(/10x/g, "Math.pow(10,")
    .replace(/y√x/g, "Math.pow(")
    .replace(
      /y√(\d+(\.\d+)?)/g,
      (match, p1) => `Math.pow(${p1}, 1/${previousInput})`
    )
    .replace(/sin\(/g, isRadians ? "Math.sin(" : "Math.sin(degToRad(")
    .replace(/cos\(/g, isRadians ? "Math.cos(" : "Math.cos(degToRad(")
    .replace(/tan\(/g, isRadians ? "Math.tan(" : "Math.tan(degToRad(")
    .replace(/log\(/g, "Math.log10(")
    .replace(/ln\(/g, "Math.log(")
    .replace(/√\(/g, "Math.sqrt(")
    .replace(/π/g, "Math.PI")
    .replace(/e/g, "Math.E")
    .replace(/÷/g, "/")
    .replace(/×/g, "*")
    .replace(/√(\d+(\.\d+)?)/g, "Math.sqrt($1)");

  expression = expression.replace(/(\d)(\()/g, "$1*$2");

  return expression;
};
