import { useState } from "react";

function Calculator() {
  const [num1, setNum1] = useState("");
  const [num2, setNum2] = useState("");
  const [result, setResult] = useState(0);

  const handleAdd = () => {
    setResult(parseInt(num1) + parseInt(num2));
  };

  const handleDivide = () => {
    setResult(parseInt(num1) / parseInt(num2));
  };

  const handleMultiply = (a: any, b: any) => {
    return a * b;
  };

  const clearInputs = () => {
    document.getElementById("num1")!.value = "";
    document.getElementById("num2")!.value = "";
  };

  const style = {
    backgroundColor: "blue",
    padding: "10px",
    margin: "5px",
  };

  return (
    <div style={style}>
      <h2>Calculator</h2>

      <input
        id="num1"
        type="text"
        value={num1}
        onChange={(e) => setNum1(e.target.value)}
      />

      <input
        id="num2"
        type="text"
        value={num2}
        onChange={(e) => setNum2(e.target.value)}
      />

      <div>
        <button onClick={() => handleAdd()}>Add</button>
        <button onClick={() => handleDivide()}>Divide</button>
        <button
          onClick={() =>
            setResult(handleMultiply(parseInt(num1), parseInt(num2)))
          }
        >
          Multiply
        </button>
        <button onClick={clearInputs}>Clear</button>
      </div>

      <p>Result: {result}</p>
    </div>
  );
}

export default Calculator;
