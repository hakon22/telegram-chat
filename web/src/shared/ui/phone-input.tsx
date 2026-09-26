import { forwardRef } from 'react';

import { MaskedInput, type MaskedInputProps } from '@web/shared/ui/masked-input';

import type { InputRef } from 'antd';

const PHONE_MASK = '+7 (000) 000-00-00';

export type PhoneInputPropsInterface = Omit<MaskedInputProps, 'mask'>;

export const PhoneInput = forwardRef<InputRef, PhoneInputPropsInterface>((props, ref) => {
  return (
    <MaskedInput
      ref={ref}
      mask={PHONE_MASK}
      autoComplete="tel"
      placeholder="+7 (___) ___-__-__"
      {...props}
    />
  );
});

PhoneInput.displayName = 'PhoneInput';
