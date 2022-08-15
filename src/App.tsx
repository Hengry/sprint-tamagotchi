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

// const calculate = (values: number[], calculateIndices: number[]) => {
//   let process = [...values];
//   calculateIndices.forEach((calcIndex, index) => {
//     if (calcIndex > 1) {
//       const calcFunc = calculateFunctions[calcIndex].func;
//       const result = calcFunc(process[index], process[index + 1]);
//       process = process
//         .slice(0, index)
//         .concat(result)
//         .concat(process.slice(index + 1));
//     }
//   });
//   return process.slice(1, values.length)
//     .reduce(
//       (accu, v, i) => calculateFunctions[calculateIndices[i]].func(accu, v),
//       values[0],
// );
// };

const indexToCalulateInfo = (index: number) => Array
  .from(
    index
      .toString(calculateFunctions.length)
      .padStart(3, '0'),
  )
  .map((v) => Number(v));

// hacked
const getPossibles = () => {
  const source = [0, 1, 2, 3];
  const possibles: number[][] = [];
  for (let i = 0; i < 4; i += 1) {
    for (let i2 = 0; i2 < 3; i2 += 1) {
      for (let i3 = 0; i3 < 2; i3 += 1) {
        const possible: number[] = [];
        [i, i2, i3, 0].reduce((prev, index) => {
          const [a] = prev.splice(index, 1);
          possible.push(a);
          return [...prev];
        }, [...source]);
        possibles.push(possible);
      }
    }
  }
  return possibles;
};

const validate = (values: number[]) => {
  const possibles = getPossibles();
  for (let combo = 0; combo < possibles.length - 1; combo += 1) {
    const reordered = possibles[combo].map((i) => values[i]);
    for (let pivot = 0; pivot < values.length - 1; pivot += 1) {
      for (
        let i = 0;
        i < calculateFunctions.length ** (reordered.length - 1);
        i += 1
      ) {
        const calculateIndices = indexToCalulateInfo(i);
        const orderTransformed = reordered
          .slice(pivot)
          .concat(reordered.slice(0, pivot));
        const result = calculate(orderTransformed, calculateIndices);
        if (result === 24) return [calculateIndices, orderTransformed];
      }
    }
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
      setOutput(`true, 因為 ${composeProcessString(result[1], result[0])} = 24`);
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
        <div className='text-3xl'>
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
        <div className='text-3xl'>
          {output}
        </div>
      </body>
    </div>
);
};

export default App;
