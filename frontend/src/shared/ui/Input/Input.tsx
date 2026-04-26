import type { InputProps } from 'antd';
import { Input as AntdInput } from 'antd';

export const Input = (props: InputProps) => {
  return <AntdInput {...props} />;
};
