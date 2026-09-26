import { useDispatch, useSelector } from 'react-redux';

import type { AppDispatchInterface, RootStateInterface } from '@web/store/index';

export const useAppDispatch = useDispatch.withTypes<AppDispatchInterface>();
export const useAppSelector = useSelector.withTypes<RootStateInterface>();
