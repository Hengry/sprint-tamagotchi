import React from 'react';

const calculateFunctions = [
  { name: '+', func: (a: number, b: number) => a + b },
  { name: '-', func: (a: number, b: number) => a - b },
  { name: '*', func: (a: number, b: number) => a * b },
  { name: '/', func: (a: number, b: number) => a / b },
  { name: '^', func: (a: number, b: number) => a ** b },
];

type OnChangeEvent = React.FormEvent<HTMLInputElement>;

const calculate = (values: number[], calculateIndices: number[]) => {
  let index = 0;
  const [revisedFuncs, revisedValues] = calculateIndices
    .reduce(([funcs, vs], calculateIndex) => {
      if (calculateIndex > 1) {
        const [a, b] = vs.slice(index, index + 2);
        const calcFunc = calculateFunctions[calculateIndex].func;
        const result = calcFunc(a, b);
        return [
          [...funcs.slice(0, index), ...funcs.slice(index + 1)],
          [...vs.slice(0, index), result, ...vs.slice(index + 2)]];
      }
      index += 1;
      return [funcs, vs];
    }, [calculateIndices, values]);

  return revisedValues
    .slice(1, revisedValues.length)
    .reduce(
      (accu, v, i) => calculateFunctions[revisedFuncs[i]].func(accu, v),
      revisedValues[0],
  );
};

const indexToCalulateInfo = (index: number) => Array
  .from(
    index
      .toString(calculateFunctions.length)
      .padStart(3, '0'),
  )
  .map((v) => Number(v));

const getPossibles = (number = 4) => {
  const source = new Array(number).fill(0).map((_, i) => i);
  const init = source.map((s) => ({
    values: [s],
    rest: source.slice(0, s).concat(source.slice(s + 1)),
  }));
  const possibles = source.slice(1).reduce(
    (candidates) => {
      const nextCandidates: Array<{ values: number[]; rest: number[] }> = [];
      candidates.forEach(({ values, rest }) => {
        rest.forEach((r, i) => {
          nextCandidates.push({
            values: values.concat(r),
            rest: [...rest.slice(0, i), ...rest.slice(i + 1)],
          });
        });
      });
      return nextCandidates;
    },
    init,
  );
  return possibles.map(({ values }) => values);
};

const getBracketsCombinations = (number = 4) => {
  const source = new Array(number).fill(0).map((_, i) => i);
  const result: number[][][] = [];
  source.slice(0, source.length - 1).forEach((s, i) => {
    source.slice(i + 1).forEach((end, i2) => {
      result.push([[s, end]]);
      const rest = source.slice(i + i2 + 2);
      if (rest.length > 1) {
        const localResult = getBracketsCombinations(rest.length);
        result.push(
          ...localResult.map((r) => [
            [s, end],
            ...r.map((d) => d.map((v) => i + i2 + 2 + v)),
          ]),
        );
      }
    });
  });
  return result;
};

const validate = (values: number[]):
  [number[], number[], number[][] | undefined] | false => {
  const possibles = getPossibles(values.length);
  const bracketsCombinations = getBracketsCombinations(values.length);

  for (let combo = 0; combo < possibles.length - 1; combo += 1) {
    const reordered = possibles[combo].map((i) => values[i]);
    for (
      let i = 0;
      i < calculateFunctions.length ** (reordered.length - 1);
      i += 1
    ) {
      // without brackets
      const calculateIndices = indexToCalulateInfo(i);
      const result = calculate(reordered, calculateIndices);
      if (result === 24) return [calculateIndices, reordered, undefined];
      // with brackets
      for (let index = 0; index < bracketsCombinations.length - 1; index += 1) {
        const brackets = bracketsCombinations[index];
        let bracketValues: number[] = reordered.slice(0, brackets[0][0]);
        let bracketFuncs: number[] = calculateIndices.slice(0, brackets[0][0]);
        brackets.forEach((b, bi) => {
          const localResult = calculate(
            reordered.slice(b[0], b[1] + 1),
            calculateIndices.slice(...b),
          );
          const next = brackets[bi + 1];
          if (next) {
            bracketValues = [
              ...bracketValues,
              localResult,
              ...reordered.slice(b[1] + 1, next[0]),
            ];
            bracketFuncs = [
              ...bracketFuncs,
              ...calculateIndices.slice(b[1], next[0]),
            ];
          } else {
            bracketValues = [
              ...bracketValues,
              localResult,
              ...reordered.slice(b[1] + 1),
            ];
            bracketFuncs = [
              ...bracketFuncs,
              ...calculateIndices.slice(b[1]),
            ];
          }
        });
        const result2 = calculate(bracketValues, bracketFuncs);
        if (result2 === 24) return [calculateIndices, reordered, brackets];
      }
    }
  }

  return false;
};

const composeProcessString = (
  calculateIndices: number[],
  values: number[],
  brackets?: number[][],
) => {
  const finalString = values.map((v) => String(v));
  if (brackets) {
    brackets.forEach(([start, end]) => {
        finalString[start] = `(${finalString[start]}`;
        finalString[end] = `${finalString[end]})`;
      });
    }
  return finalString
    .slice(1, finalString.length)
    .reduce(
      (prev, v, i) => {
        const functionName = calculateFunctions[calculateIndices[i]].name;
        return `${prev}${functionName}${v}`;
      },
      String(finalString[0]),
    );
};

const App = () => {
  const [input, setInput] = React.useState<string>('');
  const [output, setOutput] = React.useState<string>('');

  const handleSubmit = React.useCallback((value: string) => {
    const values = Array.from(value).map((v) => Number(v));
    const result = validate(values);
    if (result) {
      setOutput(`true, 因為 ${composeProcessString(...result)} = 24`);
    } else {
      setOutput('false');
    }
  }, []);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const handleChange = React.useCallback((e: OnChangeEvent) => {
    const v = e.currentTarget.value;
    setInput(v);
    if (v.length === 4) {
      inputRef.current?.blur();
      handleSubmit(v);
    }
  }, [handleSubmit]);

  const handleClick = React.useCallback(() => {
    setInput('');
  }, []);

  const autoFocus = React.useCallback((e: KeyboardEvent) => {
    if (!Number.isNaN(+e.key) && inputRef.current !== document.activeElement) {
      setInput('');
      inputRef.current?.focus();
    }
  }, []);

  React.useEffect(() => {
    document.addEventListener('keydown', autoFocus, false);
    return () => {
      document.removeEventListener('keydown', autoFocus, false);
    };
  }, [autoFocus]);

  return (
    <div className='App'>
      <body className='flex flex-col justify-center items-center'>
        <div className='relative w-full flex flex-col justify-center items-center'>
          <div className='absolute bottom-full'>
            請輸入數字以檢驗
          </div>
          <div>
            <input
              className='text-9xl w-80'
              type='number'
              value={input}
              placeholder='0000'
              onChange={handleChange}
              onClick={handleClick}
              ref={inputRef}
            />
          </div>
          <div className='absolute top-full'>
            {input.length === 4 ? output : null}
          </div>
        </div>
      </body>
    </div>
);
};

export default App;
