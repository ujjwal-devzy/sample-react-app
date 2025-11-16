import { useState, useMemo } from "react";

function Calculator() {
  const [num1, setNum1] = useState("");
  const [num2, setNum2] = useState("");
  const [result, setResult] = useState<number | string>(0);

  const handleAdd = () => {
    const a = parseInt(num1, 10);
    const b = parseInt(num2, 10);
    if (isNaN(a) || isNaN(b)) {
      setResult("Invalid input");
      return;
    }
    setResult(a + b);
  };

  const handleDivide = () => {
    const a = parseInt(num1, 10);
    const b = parseInt(num2, 10);
    if (isNaN(a) || isNaN(b)) {
      setResult("Invalid input");
      return;
    }
    if (b === 0) {
      setResult("Cannot divide by zero");
      return;
    }
    setResult(a / b);
  };

  const handleMultiply = (a: number, b: number): number => {
    return a * b;
  };

  const handleMultiplyClick = () => {
    const a = parseInt(num1, 10);
    const b = parseInt(num2, 10);
    if (isNaN(a) || isNaN(b)) {
      setResult("Invalid input");
      return;
    }
    setResult(handleMultiply(a, b));
  };

  const clearInputs = () => {
    setNum1("");
    setNum2("");
    setResult(0);
  };

  const style = useMemo(
    () => ({
      backgroundColor: "blue",
      padding: "10px",
      margin: "5px",
    }),
    []
  );

  return (
    <div style={style}>
      <h2>Calculator</h2>

      <input
        type="text"
        value={num1}
        onChange={(e) => setNum1(e.target.value)}
        placeholder="Number 1"
      />

      <input
        type="text"
        value={num2}
        onChange={(e) => setNum2(e.target.value)}
        placeholder="Number 2"
      />

      <div>
        <button onClick={handleAdd}>Add</button>
        <button onClick={handleDivide}>Divide</button>
        <button onClick={handleMultiplyClick}>Multiply</button>
        <button onClick={clearInputs}>Clear</button>
      </div>

      <p>Result: {result}</p>
    </div>
  );
}

export default Calculator;
