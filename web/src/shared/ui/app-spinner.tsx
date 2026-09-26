import { LoadingOutlined } from '@ant-design/icons';

export type AppSpinnerSizeType = 'page' | 'button' | 'meta';

export interface AppSpinnerPropsInterface {
  size?: AppSpinnerSizeType;
}

export const AppSpinner = ({ size = 'button' }: AppSpinnerPropsInterface) => {
  const className = size === 'page'
    ? 'app-spinner app-spinner_page'
    : size === 'meta'
      ? 'app-spinner app-spinner_meta'
      : 'app-spinner app-spinner_button';

  return <LoadingOutlined spin className={className} />;
};
