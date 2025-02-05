import { createContext } from "react";

const Context = createContext();

export const ContextProvider = ({ children }) => {
  return <Context.Provider >
    {children}
  </Context.Provider>;
};
;