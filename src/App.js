import { PiClockCounterClockwise } from "react-icons/pi";
import "./App.css";
import { useEffect, useRef, useState } from "react";
import { CalcButtons } from "./CalcButtons";
import { replaceExpression } from "./ExpressionParser";

function App() {
  const [inputValue, setInputValue] = useState("0");
  const [openBracketsCount, setOpenBracketsCount] = useState(0);
  const [isAllClearMode, setIsAllClearMode] = useState(false);
  const [isRadians, setIsRadians] = useState(true);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isInverseMode, setIsInverseMode] = useState(false);
  const [previousInput, setPreviousInput] = useState("");
  const [previousResult, setPreviousResult] = useState("");

  const historyRef = useRef(null);

  const handleFactorial = (prevValue) => {
    const factorial = (n) => {
      if (n < 0) return "Error";
      let result = 1;
      for (let i = 1; i <= n; i++) {
        result *= i;
      }
      return result;
    };

    return prevValue.replace(/(\d+)!/g, (num) => factorial(parseInt(num, 10)));
  };

  const handleExpression = (expression) => {
    try {
      expression = expression.replace(/(\d+)!/g, (num) => {
        return handleFactorial(parseInt(num, 10));
      });

      // eslint-disable-next-line no-eval
      const result = eval(expression);

      setPreviousResult(result.toString());
      setPreviousInput(`${inputValue} = ${result}`);

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
  };

  const handleButtonClick = (buttonText) => {
    if (inputValue === "Error" && buttonText !== "CE" && buttonText !== "AC") {
      setInputValue(buttonText);
      setIsAllClearMode(false);
      return;
    }

    switch (buttonText) {
      case "Rad":
        setIsRadians(true);
        break;
      case "Deg":
        setIsRadians(false);
        break;
      case "Inv":
        setIsInverseMode(!isInverseMode);
        return;
      case "CE":
        setInputValue((prevValue) =>
          prevValue.length > 1 ? prevValue.slice(0, -1) : "0"
        );
        setIsAllClearMode(false);
        break;
      case "AC":
        setInputValue("0");
        setIsAllClearMode(true);
        break;
      case "Ans":
        if (previousResult) {
          setInputValue(previousResult);
          setIsAllClearMode(false);
          setIsInverseMode(false);
        }
        break;
      case "(":
        setInputValue((prevValue) => prevValue + buttonText);
        setOpenBracketsCount((prevCount) => prevCount + 1);
        break;
      case ")":
        if (openBracketsCount > 0) {
          setInputValue((prevValue) => prevValue + buttonText);
          setOpenBracketsCount((prevCount) => prevCount - 1);
        }
        break;
      case "sin":
      case "cos":
      case "tan":
      case "log":
      case "ln":
      case "√":
      case "sin-1":
      case "cos-1":
      case "tan-1":
        setInputValue((prevValue) =>
          prevValue === "0"
            ? buttonText + "("
            : prevValue + "*" + buttonText + "("
        );
        setOpenBracketsCount(openBracketsCount + 1);
        break;
      case "π":
      case "e":
        setInputValue((prevValue) =>
          prevValue === "0" ? buttonText : prevValue + "*" + buttonText
        );
        break;
      case "x!":
        setInputValue((prevValue) => prevValue + "!");
        break;
      case "÷":
      case "×":
        const lastChar = inputValue.slice(-1);
        if (lastChar === "÷" || lastChar === "×") {
          setInputValue((prevValue) => prevValue.slice(0, -1) + buttonText);
        } else {
          setInputValue((prevValue) => prevValue + buttonText);
        }
        break;
      case "xy":
        setInputValue((prevValue) => prevValue + "**");
        break;
      case "x2":
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
        break;
      case "10x":
        setInputValue((prevValue) => {
          if (prevValue === "0") {
            return "10**";
          } else {
            const lastNumber = prevValue.match(/(\d+(\.\d+)?)$/);
            if (lastNumber) {
              return (
                prevValue.slice(0, -lastNumber[0].length) +
                "10**" +
                lastNumber[0]
              );
            } else {
              return prevValue + "10**";
            }
          }
        });
        break;
      case "y√x":
        setPreviousInput(inputValue);
        setInputValue((prevValue) => prevValue + "√");
        setIsAllClearMode(false);
        break;
      case "Rnd":
        const randomValue = Math.random();
        setInputValue(randomValue.toString());
        break;
      case "EXP":
        const lastDigit = inputValue.slice(-1);
        if (!isNaN(lastDigit) || lastDigit === "e") {
          setInputValue((prevValue) => prevValue);
        }
        break;
      case "ex":
        setInputValue((prevValue) =>
          prevValue === "0" ? "e**" : prevValue + "e**"
        );
        setIsAllClearMode(false);
        break;
      case "=":
        let expression = replaceExpression(
          inputValue,
          isRadians,
          previousInput
        );
        handleExpression(expression);
        break;
      default:
        if (inputValue === "0" && !isNaN(buttonText)) {
          setInputValue(buttonText);
        } else {
          setInputValue((prevValue) => prevValue + buttonText);
          setIsAllClearMode(false);
          setIsInverseMode(false);
          break;
        }
    }
  };

  const handleKeyPress = (event) => {
    const { key } = event;

    const functionMap = {
      t: "tan(",
      s: "sin(",
      c: "cos(",
      l: "ln(",
      g: "log(",
      r: "√(",
      p: "π",
      e: "e",
      x: "x!",
      z: "e**",
    };

    if (functionMap[key]) {
      handleButtonClick(functionMap[key]);
      return;
    }

    switch (event.key) {
      case "Backspace":
        event.preventDefault();
        handleButtonClick("CE");
        break;
      case "Enter":
        event.preventDefault();
        handleButtonClick("=");
        break;
      default:
        if (key >= "0" && key <= "9") {
          handleButtonClick(key);
        } else if (key === ".") {
          handleButtonClick(".");
        } else if (
          key === "+" ||
          key === "-" ||
          key === "*" ||
          key === "/" ||
          key === "^"
        ) {
          handleButtonClick(
            {
              "+": "+",
              "-": "-",
              "*": "×",
              "/": "÷",
              "^": "**",
            }[key]
          );
        }
        break;
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue, isRadians, isInverseMode, openBracketsCount, history]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (historyRef.current && !historyRef.current.contains(event.target)) {
        setShowHistory(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const handleIconClick = () => {
    setShowHistory((prevState) => !prevState);
  };

  const handleSearchChange = (e) => {
    setInputValue(e.target.value);
  };

  const buttons = CalcButtons(isInverseMode, isAllClearMode);

  return (
    <div className="calculator-container">
      <div className="search-container">
        <PiClockCounterClockwise
          onClick={handleIconClick}
          style={{ fontSize: "25px" }}
        />
        <textarea
          className="search-input"
          value={`${previousInput ? previousInput + "\n" : ""}${inputValue}`}
          onChange={handleSearchChange}
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
        <div ref={historyRef} className="history-box">
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
