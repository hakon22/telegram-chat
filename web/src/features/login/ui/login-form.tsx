import { Alert, Button, Form, Input } from 'antd';

import { InstanceCredentialsFormDto, type InstanceCredentialsFormInterface } from '@shared/dto/auth/instance-credentials-form.dto';
import { SessionStatusEnum } from '@shared/enums/session-status.enum';

import { submitLogin } from '@web/features/login/model/login-thunk';
import { dtoFormItemProps } from '@web/shared/lib/yup-dto-field-rules';
import { useAppDispatch, useAppSelector } from '@web/store/hooks';

export const LoginForm = () => {
  const dispatch = useAppDispatch();
  const status = useAppSelector(state => state.session.status);
  const errorMessage = useAppSelector(state => state.session.errorMessage);
  const loading = status === SessionStatusEnum.LOADING;

  const onFinish = (values: InstanceCredentialsFormInterface) => {
    dispatch(submitLogin(values));
  };

  return (
    <Form
      className="login__form"
      layout="vertical"
      requiredMark={false}
      onFinish={onFinish}
    >
      <Form.Item name="idInstance" {...dtoFormItemProps(InstanceCredentialsFormDto, 'idInstance')}>
        <Input autoComplete="username" disabled={loading} />
      </Form.Item>
      <Form.Item name="apiTokenInstance" {...dtoFormItemProps(InstanceCredentialsFormDto, 'apiTokenInstance')}>
        <Input.Password autoComplete="current-password" disabled={loading} />
      </Form.Item>
      {errorMessage !== '' && (
        <Alert className="login__alert" type="error" showIcon title={errorMessage} />
      )}
      <Button
        className="login__submit"
        type="primary"
        htmlType="submit"
        block
        loading={loading}
      >
        Войти
      </Button>
    </Form>
  );
};
