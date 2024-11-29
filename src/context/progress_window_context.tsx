import React, {createContext, useContext, useState, ReactNode} from 'react';

interface ProgressWindowConfig {
  visible: boolean;
  title: string;
  dialogContent: string;
  disabledCancel: boolean;
  cancelSyncQueries: () => void;
}

interface ShowProgressWindow {
  title: string; 
  dialogContent: string;
  disabledCancel: boolean;
  cancelSyncQueries: () => void;
}

interface ProgressWindowContextType {
  showProgressWindow: (ShowProgressWindow: ShowProgressWindow) => void;
  hideProgressWindow: () => void;
  progressWindowConfig: ProgressWindowConfig;
}

const ProgressWindowContext = createContext<
  ProgressWindowContextType | undefined
>(undefined);

export const ProgressWindowProvider: React.FC<{children: ReactNode}> = ({
  children,
}) => {
  const [progressWindowConfig, setProgressWindowConfig] =
    useState<ProgressWindowConfig>({
      visible: false,
      title: "",
      dialogContent: '',
      disabledCancel: false,
      cancelSyncQueries: () => {},
    });

  const showProgressWindow = (progressWindowConfig: ShowProgressWindow) => {
    setProgressWindowConfig({...progressWindowConfig, visible: true});
  };

  const hideProgressWindow = () => {
    setProgressWindowConfig({...progressWindowConfig, visible: false});
  };

  return (
    <ProgressWindowContext.Provider
      value={{showProgressWindow, hideProgressWindow, progressWindowConfig}}>
      {children}
    </ProgressWindowContext.Provider>
  );
};

export const progressWindowContext = () => {
  const context = useContext(ProgressWindowContext);
  if (!context) {
    throw new Error('useMyFunction must be used within a MyFunctionProvider');
  }
  return context;
};
