import { withModuleAccess } from '@/components/auth/with-module-access';
import { FC } from 'react';

const POSPage: FC = () => {
  return (
    <div>
      {/* Your POS page content */}
    </div>
  );
};

export default withModuleAccess(POSPage, 'POS'); 