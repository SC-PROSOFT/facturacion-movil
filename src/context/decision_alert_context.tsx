import React, {createContext, useContext, useState, ReactNode} from 'react';

type type = 'error' | 'success' | 'info';

interface DecisionAlertConfig {
  visible: boolean;
  type: type;
  description: string;
  textButton: string;
  executeFunction: () => void;
}

interface ShowDecisionAlert {
  type: type;
  description: string;
  textButton: string;
  executeFunction: () => void;
}

interface DecisionAlertContextType {
  showDecisionAlert: (ShowDecisionAlert: ShowDecisionAlert) => void;
  hideDecisionAlert: () => void;
  decisionAlertConfig: DecisionAlertConfig;
}

const DecisionAlertContext = createContext<
  DecisionAlertContextType | undefined
>(undefined);

export const DecisionAlertProvider: React.FC<{children: ReactNode}> = ({
  children,
}) => {
  const [decisionAlertConfig, setDecisionAlertConfig] =
    useState<DecisionAlertConfig>({
      visible: false,
      type: 'info',
      description: '',
      textButton: '',
      executeFunction: () => {},
    });

  const showDecisionAlert = (decisionAlertConfig: ShowDecisionAlert) => {
    setDecisionAlertConfig({...decisionAlertConfig, visible: true});
  };

  const hideDecisionAlert = () => {
    setDecisionAlertConfig({...decisionAlertConfig, visible: false});
  };

  return (
    <DecisionAlertContext.Provider
      value={{showDecisionAlert, hideDecisionAlert, decisionAlertConfig}}>
      {children}
    </DecisionAlertContext.Provider>
  );
};

export const decisionAlertContext = () => {
  const context = useContext(DecisionAlertContext);
  if (!context) {
    throw new Error('useMyFunction must be used within a MyFunctionProvider');
  }
  return context;
};
