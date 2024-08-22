export const CalcButtons = (isInverseMode, isAllClearMode) => [
  ["Rad", "Deg", "x!", "(", ")", "%", isAllClearMode ? "AC" : "CE"],
  [
    "Inv",
    isInverseMode ? "sin-1" : "sin",
    isInverseMode ? "ex" : "ln",
    "7",
    "8",
    "9",
    "÷",
  ],
  [
    "π",
    isInverseMode ? "cos-1" : "cos",
    isInverseMode ? "10x" : "log",
    "4",
    "5",
    "6",
    "×",
  ],
  [
    "e",
    isInverseMode ? "tan-1" : "tan",
    isInverseMode ? "x2" : "√",
    "1",
    "2",
    "3",
    "-",
  ],
  [
    isInverseMode ? "Rnd" : "Ans",
    "EXP",
    isInverseMode ? "y√x" : "xy",
    "0",
    ".",
    "=",
    "+",
  ],
];
