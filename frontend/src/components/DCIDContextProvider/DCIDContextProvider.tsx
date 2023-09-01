import React, {
  createContext, useMemo,
} from 'react';

type DCIDInfoContextType = {
  dcid: number,
};

export const DCIDInfoContext = createContext<DCIDInfoContextType>({
  dcid: 0,
});

type Props = {
  children: React.ReactNode,
  dcid: number,
};

function DCIDContextProvider({ children, dcid }: Props) {
  const contextValue = useMemo<DCIDInfoContextType>(() => ({
    dcid,
  }), [dcid]);

  // useEffect(() => {
  //   });
  // }, []);

  return (
    <DCIDInfoContext.Provider value={contextValue}>
      {children}
    </DCIDInfoContext.Provider>
  );
}

export default DCIDContextProvider;
