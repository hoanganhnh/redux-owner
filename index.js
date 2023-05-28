function createStore(reducer) {
  let currentReducer = reducer;
  let currentState;
  let listenerIdCounter = 0;
  let isDispatching = false;

  let currentListeners = new Map();
  let nextListeners = currentListeners;

  function getState() {
    return currentState;
  }

  function subscribe(listener) {
    let isSubscribed = true;
    const listenerId = listenerIdCounter++;
    nextListeners.set(listenerId, listener);

    return function unsubscribe() {
      if (!isSubscribed) {
        return;
      }

      isSubscribed = false;
      nextListeners.delete(listenerId);
      currentListeners = null;
    };
  }

  function dispatch(action) {
    try {
      isDispatching = true;
      currentState = currentReducer(currentState, action);
    } finally {
      isDispatching = false;
    }

    const listeners = (currentListeners = nextListeners);
    listeners.forEach((listener) => {
      listener();
    });
  }

  const store = { dispatch, subscribe, getState };
  return store;
}

function counterReducer(state = { value: 0 }, action) {
  switch (action.type) {
    case "counter/incremented":
      return { value: state.value + 1 };
    case "counter/decremented":
      return { value: state.value - 1 };
    default:
      return state;
  }
}

let store = createStore(counterReducer);

store.subscribe(() => console.log(store.getState()));

store.dispatch({ type: "counter/incremented" });
store.dispatch({ type: "counter/incremented" });
store.dispatch({ type: "counter/decremented" });
