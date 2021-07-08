import { act, renderHook } from "@testing-library/react-hooks";

import EfficientHooks from "../index";

const { useDebounceEffect } = EfficientHooks;

const mockApi = (value: string) =>
  new Promise<string>((resolve) => {
    setTimeout(() => {
      resolve(value);
    }, 2000);
  });

describe("useDebounceEffect", () => {
  it("should only call with latest value", async () => {
    const mockSuccess = jest.fn();
    const mockError = jest.fn();
    const { result, waitForNextUpdate } = renderHook(() =>
      useDebounceEffect({
        asyncEffect: mockApi,
        onSuccess: (data) => mockSuccess(data),
        onError: mockError,
        time: 500,
      })
    );

    expect(result.current.debounceEffect).toBeTruthy();
    expect(result.current.loading).toBe(false);
    expect(result.current.taskQueue).toHaveLength(0);

    act(() => {
      result.current.debounceEffect("h");
      result.current.debounceEffect("he");
      result.current.debounceEffect("hel");
      result.current.debounceEffect("hell");
      result.current.debounceEffect("hello");
    });
    /** Immediately turn into loading */
    expect(result.current.loading).toBe(true);

    await waitForNextUpdate();
    expect(result.current.taskQueue).toHaveLength(1);
    expect(result.current.taskQueue[0]).toBe("hello");

    await waitForNextUpdate({ timeout: 3000 });
    expect(result.current.loading).toBe(false);
    expect(result.current.taskQueue).toHaveLength(0);
    expect(mockSuccess).toBeCalledTimes(1);
    expect(mockSuccess).toBeCalledWith("hello");
    expect(mockError).toBeCalledTimes(0);
  });

  it("should call second time after dobounce time", async () => {
    const mockSuccess = jest.fn();
    const mockError = jest.fn();
    const { result, waitForNextUpdate } = renderHook(() =>
      useDebounceEffect({
        asyncEffect: mockApi,
        onSuccess: (data) => mockSuccess(data),
        onError: mockError,
        time: 500,
      })
    );

    expect(result.current.debounceEffect).toBeTruthy();
    expect(result.current.loading).toBe(false);
    expect(result.current.taskQueue).toHaveLength(0);

    act(() => {
      result.current.debounceEffect("hello");
    });
    expect(result.current.loading).toBe(true);

    await waitForNextUpdate();
    expect(result.current.taskQueue).toHaveLength(1);
    expect(result.current.taskQueue[0]).toBe("hello");

    act(() => {
      result.current.debounceEffect("world");
    });
    await waitForNextUpdate();
    expect(result.current.taskQueue).toHaveLength(2);
    expect(result.current.taskQueue[1]).toBe("world");

    await waitForNextUpdate({ timeout: 3000 });
    expect(result.current.taskQueue).toHaveLength(1);
    expect(mockSuccess).toBeCalledTimes(1);
    expect(mockSuccess).toBeCalledWith("hello");
    expect(mockError).toBeCalledTimes(0);

    mockSuccess.mockReset();

    await waitForNextUpdate({ timeout: 3000 });
    expect(result.current.loading).toBe(false);
    expect(result.current.taskQueue).toHaveLength(0);
    expect(mockSuccess).toBeCalledTimes(1);
    expect(mockSuccess).toBeCalledWith("world");
    expect(mockError).toBeCalledTimes(0);
  });

  it("should call onError when occur error", async () => {
    const mockSuccess = jest.fn();
    const mockError = jest.fn();

    const { result, waitForNextUpdate } = renderHook(() =>
      useDebounceEffect({
        asyncEffect: () => new Promise((resolve, reject) => reject("Error")),
        onSuccess: (data) => mockSuccess(data),
        onError: mockError,
        time: 500,
      })
    );

    expect(result.current.debounceEffect).toBeTruthy();
    expect(result.current.loading).toBe(false);
    expect(result.current.taskQueue).toHaveLength(0);

    act(() => {
      result.current.debounceEffect("hello");
    });
    expect(result.current.loading).toBe(true);

    await waitForNextUpdate();
    expect(result.current.loading).toBe(false);
    expect(result.current.taskQueue).toHaveLength(0);
    expect(mockSuccess).toBeCalledTimes(0);
    expect(mockError).toBeCalledTimes(1);
    expect(mockError).toBeCalledWith("Error");
  });
});
