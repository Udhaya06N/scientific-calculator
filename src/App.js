import { PiClockCounterClockwise } from "react-icons/pi";
import "./App.css";
import { useEffect, useRef, useState } from "react";
import { CalcButtons } from "./CalcButtons";
import { getButtonClassName, replaceExpression } from "./ExpressionParser";

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
  const [isInvButtonClicked, setIsInvButtonClicked] = useState(false);

  const historyRef = useRef(null);

  const handleFactorial = (n) => {
    if (n === 0 || n === 1) return 1;

    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  };

  const handleExpression = (expression) => {
    try {
      let openBrackets = (expression.match(/\(/g) || []).length;
      let closeBrackets = (expression.match(/\)/g) || []).length;
      let bracketsToAdd = openBrackets - closeBrackets;

      if (bracketsToAdd > 0) {
        expression += ")".repeat(bracketsToAdd);
      }

      expression = expression.replace(/√/g, "Math.pow(x, 1/2)");

      expression = expression.replace(/(\d+)!/g, (match, num) => {
        const factorialResult = handleFactorial(parseInt(num, match));
        return factorialResult;
      });

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
    const randomValue = Math.random();
    const lastDigit = inputValue.slice(-1);
    const lastChar = inputValue.slice(-1);

    let expression = replaceExpression(inputValue, isRadians, previousInput);

    const isLastCharacterOperatorOrDecimal = () => {
      const lastChar = inputValue.slice(-1);
      return ["+", "-", "*", "/", "."].includes(lastChar);
    };

    switch (buttonText) {
      case "Rad":
        setIsRadians(true);
        break;
      case "Deg":
        setIsRadians(false);
        break;
      case "Inv":
        setIsInverseMode(!isInverseMode);
        setIsInvButtonClicked(!isInvButtonClicked);
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
        if (lastChar === "÷" || lastChar === "×") {
          setInputValue((prevValue) => prevValue.slice(0, -1) + buttonText);
        } else {
          setInputValue((prevValue) => prevValue + buttonText);
        }
        break;
      case "+":
      case "-":
        if (lastChar === "+" || lastChar === "-") {
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
        setInputValue("√");
        break;
      case "Rnd":
        setInputValue(randomValue.toString());
        break;
      case "EXP":
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
        handleExpression(expression);
        break;
      default:
        if (["+", "-", "*", "/", "."].includes(buttonText)) {
          if (isLastCharacterOperatorOrDecimal()) {
            return;
          }
        }

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
        <div className="textarea-container" style={{ position: "relative" }}>
          <textarea
            className="search-input"
            value={inputValue}
            onChange={handleSearchChange}
            readOnly
          />
          <PiClockCounterClockwise
            className="search-icon"
            onClick={handleIconClick}
            style={{ fontSize: "22px", zIndex: 1000 }}
          />
          <div
            style={{
              position: "absolute",
              top: "10px",
              right: 12,
              color: "gray",
              fontSize: "13px",
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
              pointerEvents: "none",
              zIndex: "0",
            }}
          >
            {previousInput ? previousInput + "\n" : ""}
          </div>
        </div>
      </div>
      <div className="buttons">
        {buttons.map((row, rowIndex) => (
          <div key={rowIndex} className="Calc-inputs">
            {row.map((buttonText, buttonIndex) => (
              <button
                className={getButtonClassName(
                  buttonText,
                  isRadians,
                  isInvButtonClicked
                )}
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
          <PiClockCounterClockwise
            className="history-icon"
            onClick={handleIconClick}
            style={{ fontSize: "22px" }}
          />
          <div className="history-line"></div>
          <ul className="history-lists">
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
