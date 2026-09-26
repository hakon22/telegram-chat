import { Form, type InputRef } from 'antd';
import { MaskedInput as AntdMaskedInput } from 'antd-mask-input';
import { forwardRef, useImperativeHandle, useRef } from 'react';

import type { MaskedInputProps } from 'antd-mask-input/build/main/lib/MaskedInput';

export type { MaskedInputProps };

export const MaskedInput = forwardRef<InputRef, MaskedInputProps>((props, forwardedRef) => {
  const { status } = Form.Item.useStatus();
  const ref = useRef<InputRef>(null);

  useImperativeHandle(forwardedRef, () => ref.current as InputRef, []);

  return (
    <AntdMaskedInput
      status={status === 'error' ? 'error' : ''}
      ref={ref}
      maskOptions={{
        lazy: true,
      }}
      {...props}
    />
  );
});

MaskedInput.displayName = 'MaskedInput';
