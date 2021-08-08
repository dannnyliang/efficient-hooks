import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const defaultTime = 1000;
const defaultErrorHandler = (error: unknown) => {
  console.error(error);
};

export type UseDebounceEffectConfig<
  Argument extends unknown,
  Response extends unknown
> = {
  asyncEffect: (args: Argument) => Promise<Response>;
  onSuccess?: (response: Response) => void;
  onError?: (error: unknown) => void;
  time?: number;
};

export type UseDebounceEffectConfigReturn<Argument extends unknown> = {
  loading: boolean;
  taskQueue: Argument[];
  debounceEffect: (args: Argument) => void;
};

function useDebounceEffect<Argument extends unknown, Response extends unknown>(
  config: UseDebounceEffectConfig<Argument, Response>
): UseDebounceEffectConfigReturn<Argument> {
  const {
    asyncEffect,
    time = defaultTime,
    onError = defaultErrorHandler,
    onSuccess,
  } = config;
  const [loading, setLoading] = useState(false);
  const [taskQueue, setTaskQueue] = useState<Argument[]>([]);
  const timer = useRef<number | null>(null);

  const handlePushTask = useCallback((task) => {
    setTaskQueue((queue) => [...queue, task]);
  }, []);
  const handlePopTask = () => setTaskQueue((queue) => queue.slice(1));

  const _asyncEffect = useCallback<(argu: Argument) => Promise<void>>(
    async (argu) => {
      handlePushTask(argu);
      try {
        const response = await asyncEffect(argu);
        onSuccess?.(response);
      } catch (error) {
        onError?.(error);
      } finally {
        handlePopTask();
        setLoading(false);
      }
    },
    [asyncEffect, handlePushTask, onError, onSuccess]
  );

  const debounceEffect = (args: Argument) => {
    setLoading(true);
    if (timer.current) clearTimeout(timer.current);

    timer.current = window.setTimeout(() => {
      _asyncEffect(args);
    }, time);
  };

  const unload = useMemo(
    () => (e: BeforeUnloadEvent) => {
      if (taskQueue.length > 0) {
        e.returnValue = "";
      }
    },
    [taskQueue.length]
  );

  useEffect(() => {
    window.addEventListener("beforeunload", unload);
    return () => window.removeEventListener("beforeunload", unload);
  }, [unload]);

  return { loading, taskQueue, debounceEffect };
}

export default useDebounceEffect;
