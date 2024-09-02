export const replaceExpression = (inputValue, isRadians, previousInput) => {
  let expression = inputValue
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
    .replace(/sin-1\(/g, isRadians ? "Math.asin(" : "Math.asin(degToRad(")
    .replace(/cos-1\(/g, isRadians ? "Math.acos(" : "Math.acos(degToRad(")
    .replace(/tan-1\(/g, isRadians ? "Math.atan(" : "Math.atan(degToRad(")
    .replace(/log\(/g, "Math.log(")
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

export const getButtonClassName = (
  buttonText,
  isRadians,
  isInvButtonClicked
) => {
  if (buttonText === "Rad") {
    return !isRadians ? "button-inactive rad" : "button-active rad";
  }
  if (buttonText === "Deg") {
    return isRadians ? "button-inactive deg" : "button-active deg";
  }

  if (buttonText === "=") {
    return "button-equal";
  }

  if (/^[7896541230.]+$/.test(buttonText)) {
    return "button-special";
  }

  const baseClass = `CalcButton`;
  if (buttonText === "Inv") {
    return isInvButtonClicked ? `${baseClass} InvActive` : baseClass;
  }

  return "";
};
