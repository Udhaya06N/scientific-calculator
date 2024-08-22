import { PiClockCounterClockwise } from "react-icons/pi";
import "./App.css";
import { useState } from "react";

function App() {
  const [inputValue, setInputValue] = useState("0");
  const [openBracketsCount, setOpenBracketsCount] = useState(0);
  const [isAllClearMode, setIsAllClearMode] = useState(false);
  const [isRadians, setIsRadians] = useState(true);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isInverseMode, setIsInverseMode] = useState(false);

  const handleButtonClick = (buttonText) => {
    // Need to refractor the code//

    const factorial = (n) => {
      if (n < 0) return "Error";
      let result = 1;
      for (let i = 1; i <= n; i++) {
        result *= i;
      }
      return result;
    };

    if (inputValue === "Error" && buttonText !== "CE" && buttonText !== "AC") {
      setInputValue(buttonText);
      setIsAllClearMode(false);
      return;
    }

    if (buttonText === "Rad") {
      setIsRadians(true);
      return;
    } else if (buttonText === "Deg") {
      setIsRadians(false);
      return;
    }

    if (buttonText === "Inv") {
      setIsInverseMode(!isInverseMode);
      return;
    }

    if (buttonText === "CE") {
      setInputValue((prevValue) =>
        prevValue.length > 1 ? prevValue.slice(0, -1) : "0"
      );
      setIsAllClearMode(false);
    } else if (buttonText === "AC") {
      setInputValue("0");
      setIsAllClearMode(true);
    } else if (buttonText === "(") {
      setInputValue((prevValue) => prevValue + buttonText);
      setOpenBracketsCount(openBracketsCount + 1);
    } else if (buttonText === ")") {
      if (openBracketsCount >= 0) {
        setInputValue((prevValue) => prevValue + buttonText);
        setOpenBracketsCount(openBracketsCount - 1);
      }
    } else if (
      [
        "sin",
        "cos",
        "log",
        "tan",
        "ln",
        "√",
        "sin-1",
        "cos-1",
        "tan-1",
        "ex",
        "y√x",
      ].includes(buttonText)
    ) {
      setInputValue((prevValue) =>
        prevValue === "0"
          ? buttonText + "("
          : prevValue + "*" + buttonText + "("
      );
      setOpenBracketsCount(openBracketsCount + 1);
    } else if (buttonText === "π" || buttonText === "e") {
      setInputValue((prevValue) =>
        prevValue === "0" ? buttonText : prevValue + "*" + buttonText
      );
    } else if (buttonText === "x!") {
      setInputValue((prevValue) => prevValue + "!");
    } else if (buttonText === "÷" || buttonText === "×") {
      const lastChar = inputValue.slice(-1);
      if (lastChar === "÷" || lastChar === "×") {
        setInputValue((prevValue) => prevValue.slice(0, -1) + buttonText);
      } else {
        setInputValue((prevValue) => prevValue + buttonText);
      }
    } else if (buttonText === "xy") {
      setInputValue((prevValue) => prevValue + "**");
    } else if (buttonText === "x2") {
      setInputValue((prevValue) => {
        const lastNumber = prevValue.match(/(\d+(\.\d+)?)$/);
        if (lastNumber) {
          return (
            prevValue.slice(0, -lastNumber[0].length) + lastNumber[0] + "**2"
          );
        } else {
          return prevValue + "**2";
        }
      });
    } else if (buttonText === "10x") {
      setInputValue((prevValue) => {
        if (prevValue === "0") {
          return "10**";
        } else {
          const lastNumber = prevValue.match(/(\d+(\.\d+)?)$/);
          if (lastNumber) {
            return (
              prevValue.slice(0, -lastNumber[0].length) + "10**" + lastNumber[0]
            );
          } else {
            return prevValue + "10**";
          }
        }
      });
    } else if (buttonText === "Rnd") {
      const randomValue = Math.random();
      setInputValue(randomValue.toString());
    } else if (buttonText === "EXP") {
      const lastChar = inputValue.slice(-1);
      if (!isNaN(lastChar) || lastChar === "e") {
        setInputValue((prevValue) => prevValue);
      }
    } else if (buttonText === "=") {
      try {
        let expression = inputValue
          .replace(/sin-1\(/g, "Math.asin(")
          .replace(/cos-1\(/g, "Math.acos(")
          .replace(/tan-1\(/g, "Math.atan(")
          .replace(/ex\(/g, "Math.exp(")
          .replace(/10x/g, "Math.pow(10,")
          .replace(/y√x/g, "Math.pow(")
          .replace(/sin\(/g, isRadians ? "Math.sin(" : "Math.sin(degToRad(")
          .replace(/cos\(/g, isRadians ? "Math.cos(" : "Math.cos(degToRad(")
          .replace(/tan\(/g, isRadians ? "Math.tan(" : "Math.tan(degToRad(")
          .replace(/log\(/g, "Math.log10(")
          .replace(/ln\(/g, "Math.log(")
          .replace(/√\(/g, "Math.sqrt(")
          .replace(/π/g, "Math.PI")
          .replace(/e/g, "Math.E")
          .replace(/÷/g, "/")
          .replace(/×/g, "*");
        expression = expression.replace(/(\d+)!/g, (num) => {
          return factorial(parseInt(num, 10));
        });

        const result = eval(expression);
        setInputValue(result.toString());
        setHistory((prevHistory) => [
          ...prevHistory,
          `${inputValue} = ${result}`,
        ]);

        setIsAllClearMode(true);
        setIsInverseMode(false);
      } catch (error) {
        setInputValue("Error");
      }
    } else if (inputValue === "0" && !isNaN(buttonText)) {
      setInputValue(buttonText);
    } else {
      setInputValue((prevValue) => prevValue + buttonText);
      setIsAllClearMode(false);
      setIsInverseMode(false);
    }
  };

  const handleIconClick = () => {
    setShowHistory((prevState) => !prevState);
  };

  const handleSearchChange = (e) => {
    setInputValue(e.target.value);
  };

  const buttons = [
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

  return (
    <div className="calculator-container">
      <div className="search-container">
        <PiClockCounterClockwise
          onClick={handleIconClick}
          style={{ fontSize: "25px" }}
        />

        <input
          type="text"
          value={inputValue}
          onChange={handleSearchChange}
          id="input"
          className="search-input"
          readOnly
        />
      </div>
      <div className="buttons">
        {buttons.map((row, rowIndex) => (
          <div key={rowIndex} className="Calc-inputs">
            {row.map((buttonText, buttonIndex) => (
              <button
                className={
                  buttonText === "Rad" && !isRadians
                    ? "button-inactive"
                    : buttonText === "Deg" && isRadians
                    ? "button-inactive"
                    : ""
                }
                key={buttonIndex}
                onClick={() => handleButtonClick(buttonText)}
              >
                {buttonText}
              </button>
            ))}
          </div>
        ))}
      </div>
      {showHistory && (
        <div className="history-box">
          <ul>
            {history.map((entry, index) => (
              <li key={index}>{entry}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
