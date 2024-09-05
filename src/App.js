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
  const [storedAns, setStoredAns] = useState("");
  const [isPowerBoxVisible, setIsPowerBoxVisible] = useState(false);
  const [placeholderValue, setPlaceholderValue] = useState("");
  const [powerStack, setPowerStack] = useState([]);

  const historyRef = useRef(null);

  const maxPowerLimit = 4;

  const handleFactorial = (n) => {
    if (n === 0 || n === 1) return 1;

    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  };

  const replaceAnsInExpression = (expression, ans) => {
    return expression.replace(/Ans/g, ans);
  };

  const handleExpression = (expression) => {
    try {
      let openBrackets = (expression.match(/\(/g) || []).length;
      let closeBrackets = (expression.match(/\)/g) || []).length;
      let bracketsToAdd = openBrackets - closeBrackets;

      if (bracketsToAdd > 0) {
        expression += ")".repeat(bracketsToAdd);
      }

      expression = expression.replace(
        /(\d+(\.\d+)?)E(\d+)/g,
        (match, base, decimal, exponent) => {
          return `${base}e${exponent}`;
        }
      );

      expression = expression.replace(
        /(\d+(\.\d+)?)E(?![\d])/g,
        (match, base) => {
          return base;
        }
      );

      if (powerStack.length > 0 && inputValue !== "") {
        expression = powerStack.reduce((acc, power) => {
          return `Math.pow(${acc}, ${power})`;
        }, inputValue);
      }

      expression = replaceAnsInExpression(expression, storedAns);
      expression = expression.replace(/√/g, "Math.pow(x, 1/2)");

      expression = expression.replace(/(\d+)!/g, (match, num) => {
        const factorialResult = handleFactorial(parseInt(num, match));
        return factorialResult;
      });

      const result = eval(expression);

      setStoredAns(result.toString());

      setIsPowerBoxVisible(false);

      setPreviousResult(result.toString());
      setPreviousInput(`${inputValue} = ${result}`);

      setInputValue(result.toString());

      setHistory((prevHistory) => [
        ...prevHistory,
        `${inputValue} = ${result}`,
      ]);

      setPowerStack([]);
      setPlaceholderValue("");
      setIsPowerBoxVisible(false);
      setIsAllClearMode(true);
      setIsInverseMode(false);
      setIsInvButtonClicked(false);
    } catch (error) {
      setInputValue("Error");
      setIsAllClearMode(true);
      setPowerStack([]);
      setPlaceholderValue("");
      setIsPowerBoxVisible(false);
    }
  };

  const handleButtonClick = (buttonText) => {
    const randomValue = Math.random();
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
        if (powerStack.length > 0) {
          setPowerStack((prevStack) => {
            const updatedStack = [...prevStack];
            const currentPlaceholder = updatedStack[updatedStack.length - 1];

            if (currentPlaceholder.length > 0) {
              updatedStack[updatedStack.length - 1] = currentPlaceholder.slice(
                0,
                -1
              );
            } else {
              updatedStack.pop();
            }

            setIsPowerBoxVisible(updatedStack.length > 0);
            return updatedStack;
          });
        } else {
          setInputValue((prevValue) => {
            if (prevValue === "0") return "0";

            if (prevValue.length > 1) {
              return prevValue.slice(0, -1);
            } else {
              return "0";
            }
          });
        }
        setIsAllClearMode(false);
        break;
      case "AC":
        if (previousResult) {
          setPreviousInput(`Ans = ${previousResult}`);
        }
        setInputValue("0");
        setPowerStack([]);
        setPlaceholderValue("");
        setIsPowerBoxVisible(false);
        setIsAllClearMode(false);
        break;
      case "Ans":
        if (isPowerBoxVisible) {
          setPlaceholderValue((prevValue) => prevValue + buttonText);
        } else if (storedAns) {
          if (inputValue === "0") {
            setInputValue("Ans");
          } else if (/\d|\)|!/.test(lastChar)) {
            setInputValue((prevValue) => prevValue + "*Ans");
          } else if (inputValue.endsWith("Ans")) {
            setInputValue((prevValue) => prevValue);
          } else {
            setInputValue((prevValue) => prevValue + "Ans");
          }

          setIsAllClearMode(false);
          setIsInverseMode(false);
        }
        break;
      case "(":
        if (isPowerBoxVisible) {
          setPlaceholderValue((prevValue) => prevValue + buttonText);
        } else {
          setInputValue((prevValue) => prevValue + buttonText);
          setOpenBracketsCount((prevCount) => prevCount + 1);
        }
        break;
      case ")":
        if (isPowerBoxVisible && openBracketsCount > 0) {
          setPlaceholderValue((prevValue) => prevValue + buttonText);
        } else if (openBracketsCount > 0) {
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
        if (isPowerBoxVisible) {
          setPowerStack((prevStack) => {
            const newStack = [...prevStack];
            newStack[newStack.length - 1] += buttonText + "(";
            return newStack;
          });
          setIsPowerBoxVisible(true);
        } else {
          setInputValue((prevValue) =>
            prevValue === "0"
              ? buttonText + "("
              : prevValue + "*" + buttonText + "("
          );
        }
        setOpenBracketsCount(openBracketsCount + 1);
        setIsInvButtonClicked(false);
        setIsInverseMode(false);
        break;
      case "π":
      case "e":
        if (isPowerBoxVisible) {
          setPlaceholderValue(buttonText);
        } else {
          setInputValue((prevValue) =>
            prevValue === "0" ? buttonText : prevValue + "*" + buttonText
          );
        }
        setIsInvButtonClicked(false);
        setIsInverseMode(false);
        break;
      case "x!":
        setInputValue((prevValue) => prevValue + "!");
        setIsPowerBoxVisible(false);
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
        if (powerStack.length < maxPowerLimit) {
          setPowerStack([...powerStack, ""]);
          setIsPowerBoxVisible(true);
          setPlaceholderValue("");
        }
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
        setIsInvButtonClicked(false);
        setIsInverseMode(false);
        setIsPowerBoxVisible(false);
        break;
      case "10x":
        if (isPowerBoxVisible) {
          setPlaceholderValue((prevValue) => {
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
        } else {
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
        }
        setIsInverseMode(false);
        break;
      case "y√x":
        setInputValue((prevValue) => "√" + prevValue);
        setIsInverseMode(false);
        setIsInvButtonClicked(false);
        setIsPowerBoxVisible(false);
        break;
      case "Rnd":
        if (isPowerBoxVisible) {
          setPlaceholderValue(randomValue.toString());
        } else {
          setInputValue(randomValue.toString());
        }
        setIsInverseMode(false);
        setIsInvButtonClicked(false);
        break;
      case "EXP":
        if (!isNaN(lastChar)) {
          setInputValue((prevValue) => prevValue + "E");
        }
        setIsInvButtonClicked(false);
        setIsInverseMode(false);
        break;
      case "ex":
        if (isPowerBoxVisible) {
          setPlaceholderValue((prevValue) =>
            prevValue === "0" ? "e**" : prevValue + "e**"
          );
        } else {
          setInputValue((prevValue) =>
            prevValue === "0" ? "e**" : prevValue + "*e**"
          );
        }
        setIsInvButtonClicked(false);
        setIsInverseMode(false);
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

        if (inputValue.endsWith("Ans")) {
          setInputValue((prevValue) => prevValue + "*");
        }

        if (isPowerBoxVisible) {
          setPowerStack((prevStack) => {
            const updatedStack = [...prevStack];
            updatedStack[updatedStack.length - 1] += buttonText;
            return updatedStack;
          });
        } else if (inputValue === "0" && !isNaN(buttonText)) {
          setInputValue(buttonText);
          setIsInvButtonClicked(false);
        } else {
          setInputValue((prevValue) => prevValue + buttonText);
          setIsAllClearMode(false);
          setIsInverseMode(false);
          setIsInvButtonClicked(false);
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
        } else if (
          key === "+" ||
          key === "-" ||
          key === "*" ||
          key === "/" ||
          key === "^" ||
          key === "."
        ) {
          handleButtonClick(
            {
              "+": "+",
              "-": "-",
              "*": "×",
              "/": "÷",
              "^": "**",
              ".": ".",
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

  const renderInputWithClosingBrackets = () => {
    let displayValue = "";
    let unmatchedBrackets = 0;

    for (let char of inputValue) {
      if (char === "(") {
        displayValue += char;
        unmatchedBrackets++;
      } else if (char === ")" && unmatchedBrackets > 0) {
        displayValue += char;
        unmatchedBrackets--;
      } else {
        displayValue += char;
      }
    }

    if (unmatchedBrackets > 0) {
      displayValue += `<span style="color: gray;">${")".repeat(
        unmatchedBrackets
      )}</span>`;
    }

    if (powerStack.length > 0) {
      displayValue += powerStack
        .map(
          (power, index) =>
            `<sup style="position: relative; top: -${index * 5}px; font-size: ${
              75 - index * 15
            }%;">${power}</sup>`
        )
        .join("");
    }

    return displayValue;
  };

  const handleIconClick = () => {
    setShowHistory((prevState) => !prevState);
  };

  const buttons = CalcButtons(isInverseMode, isAllClearMode);

  return (
    <div className="calculator-container">
      <div className="search-container">
        <div className="textarea-container" style={{ position: "relative" }}>
          <PiClockCounterClockwise
            className="search-icon"
            onClick={handleIconClick}
            style={{ fontSize: "22px", zIndex: 1000 }}
          />
          <div
            style={{
              position: "absolute",
              top: "10px",
              right: 17,
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
          <div
            className="search-input"
            contentEditable
            dangerouslySetInnerHTML={{
              __html: renderInputWithClosingBrackets(),
            }}
            onInput={(e) => setInputValue(e.currentTarget.textContent)}
          />

          {isPowerBoxVisible && powerStack && maxPowerLimit && (
            <div
              className="square"
              style={{
                position: "absolute",
                top: `${40 - powerStack.length * 5}px`,
                right: 10,
                width: `${12 - powerStack.length * 2}px`,
                height: `${12 - powerStack.length * 2}px`,
                zIndex: 1000,
                border: placeholderValue ? "" : "1px solid #ccc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {placeholderValue}
            </div>
          )}
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
            {history.length > 0 ? (
              history.map((entry, index) => {
                const [calculation, result] = entry.split(" = ");
                return (
                  <li key={index}>
                    <span className="calculation">{calculation}</span>
                    <span className="equals"> = </span>
                    <span className="result">{result}</span>
                  </li>
                );
              })
            ) : (
              <div className="empty-history">
                <p>Your calculations and results appear here so that</p>
                <p>you can reuse them</p>
              </div>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
