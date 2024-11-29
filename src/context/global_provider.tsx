import React, {ReactNode} from 'react';

import {DecisionAlertProvider, ProgressWindowProvider} from '../context';

const GlobalProvider: React.FC<{children: ReactNode}> = ({children}) => {
  return (
    <DecisionAlertProvider>
      <ProgressWindowProvider>{children}</ProgressWindowProvider>
    </DecisionAlertProvider>
  );
};

export default GlobalProvider;
