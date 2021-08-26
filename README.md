# Efficient Hooks
[![GitHub release](https://img.shields.io/github/release/dannnyliang/efficient-hooks.svg)](https://github.com/dannnyliang/efficient-hooks/releases/) ![example workflow](https://github.com/dannnyliang/efficient-hooks/actions/workflows/ci.yml/badge.svg)



Provide custom hooks to handle async behavior efficiently. 100% use typescript and enable to use generic type.

### Installation
```shell
yarn add @dannnyliang/efficient-hooks
```
or
```shell
npm i @dannnyliang/efficient-hooks
```

### useDebounceEffect
Delays invoking asynchronous function until after wait for a while time that doesn't trigger the function again. And can also prevent accidentally leaving the page before all still task completed.

**Demo**
- [material-ui Demo](https://codesandbox.io/s/material-ui-demo-vmoit?file=/src/components/MaterialUIDemo.tsx)
- ant-design demo (🚧 WIP)
- chakra-ui demo (🚧 WIP)

**Simple Usage**
```typescript
const { debounceEffect } = useDebounceEffect({ asyncEffect: mockAPIRequest });

const handleInputChange = (e) => {
  const value = e.target.value;
  debouncedUpdate(value);
};

return <input onChange={handleInputChange} />
```

**Parameters**
|               | type                                        | default             | description                                                 |
|---------------|---------------------------------------------|---------------------|-------------------------------------------------------------|
| `asyncEffect` | (args: Argument) => Promise&lt;Response&gt; |                     | The main function to be debounced.                          |
| `onSuccess`   | (response: Response) => void                |                     | Invoke when asyncEffect success.                            |
| `onError`     | (error: unknown) => void                    | defaultErrorHandler | Invoke when asyncEffect fail. Default to console the error. |
| `time`        | number                                      | 1000                | Debounced time (millisecond)                                              |

**Return**
|                  | type                     | default | description                                                                                                                             |
|------------------|--------------------------|---------|-----------------------------------------------------------------------------------------------------------------------------------------|
| `loading`        | boolean                  | false   | Is there still unhandled task. Turn into `true` when invoke `debounceEffect` and `false` when all tasks are responded by `asyncEffect`. |
| `taskQueue`      | Argument[]               | []      | Unhandled task list                                                                                                                     |
| `debounceEffect` | (args: Argument) => void |         | A debounced wrapper function of `asyncEffect`.                                                                                          |
