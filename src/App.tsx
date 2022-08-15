import React from 'react';
import './App.css';

const calculateFunctions = [
  { name: ' + ', func: (a: number, b: number) => a + b },
  { name: ' - ', func: (a: number, b: number) => a - b },
  { name: ' * ', func: (a: number, b: number) => a * b },
  { name: ' / ', func: (a: number, b: number) => a / b },
  { name: '^', func: (a: number, b: number) => a ** b },
];

type OnChangeEvent = React.FormEvent<HTMLInputElement>;

const calculate = (values: number[], calculateIndices: number[]) => values
  .slice(1, values.length)
  .reduce(
    (accu, v, i) => calculateFunctions[calculateIndices[i]].func(accu, v),
    values[0],
  );

const indexToCalulateInfo = (index: number) => Array
  .from(
    index
      .toString(calculateFunctions.length)
      .padStart(3, '0'),
  )
  .map((v) => Number(v));

const validate = (values:number[]) => {
  for (let i = 0; i < calculateFunctions.length ** 3; i += 1) {
    const calculateIndices = indexToCalulateInfo(i);
    const result = calculate(values, calculateIndices);
    if (result === 24) return calculateIndices;
  }
  return false;
};

const composeProcessString = (
  values: number[],
  calculateIndices: number[],
) => values
    .slice(1, values.length)
    .reduce(
      (prev, v, i) => {
        const functionName = calculateFunctions[calculateIndices[i]].name;
        if (calculateIndices[i] > 1 && calculateIndices[i - 1] < 2) {
          return `(${prev})${functionName}${v}`;
        }
        return `${prev}${functionName}${v}`;
      },
      String(values[0]),
    );

const App = () => {
  const [input, setInput] = React.useState<string>('');
  const [output, setOutput] = React.useState<string>('');

  const handleSubmit = React.useCallback((value: string) => {
    const values = Array.from(value).map((v) => Number(v));
    const result = validate(values);
    if (result) {
      setOutput(`true, 因為 ${composeProcessString(values, result)} = 24`);
    } else {
      setOutput('false');
    }
  }, []);

  const handleChange = React.useCallback((e: OnChangeEvent) => {
      setInput(e.currentTarget.value);
    }, []);

  return (
    <div className='App'>
      <body>
        <div>
          <input
            className='outline'
            type='number'
            value={input}
            onChange={handleChange}
          />
          <button type='button' onClick={() => handleSubmit(input)}>
            verify
          </button>
        </div>
        <div>
          {output}
        </div>
      </body>
    </div>
);
};

export default App;
