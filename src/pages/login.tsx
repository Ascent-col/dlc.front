import { Card, Col, Layout, Row, Button, Form } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import InputText from '@/commons/InputComponents/Text';
import InputPassword from '@/commons/InputComponents/Password';
import { useEffect } from 'react';
import useAuth from '@/modules/auth/hooks/useAuth';
import { useRouter } from 'next/router';
import styles from '@/styles/Login.module.scss';

const { useForm } = Form;

export default function Login() {
  const [form] = useForm();
  const { checkAuth, startLogin, isAuthenticated } = useAuth();
  const { push } = useRouter();

  const onLogin = async ({
    password,
    username,
  }: {
    password: string;
    username: string;
  }) => {
    await startLogin(username, password);
  };

  useEffect(() => {
    if (isAuthenticated) {
      push('/maps');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <Layout className={styles.page}>
      <Row className={styles.row} align="middle">
        <Col className={styles.visual} xs={0} sm={0} md={12} lg={12} xl={12} />
        <Col className={styles.panel} xs={24} sm={24} md={12} lg={12} xl={12}>
          <Card className={styles.card}>
            <h1 className={styles.title}>INICIO DE SESIÓN</h1>
            {/* <Form form={form} initialValues={{}} onFinish={onLogin}> */}
            <Form form={form} initialValues={{}} onFinish={onLogin}>
              {/* <h3 style={{ lineHeight: '200%', fontSize: '2em' }}>Usuario</h3> */}
              <InputText
                label="Usuario"
                name="username"
                inputProps={{
                  size: 'large',
                  placeholder: 'Ingrese su Usuario',
                }}
              />
              {/* <h3 style={{ lineHeight: '200%', fontSize: '2em' }}>Contraseña</h3> */}
              <InputPassword
                label="Contraseña"
                name="password"
                inputProps={{
                  size: 'large',
                  placeholder: 'Ingrese su Contraseña',
                  iconRender: (visible) =>
                    visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />,
                }}
              />
              <Button
                className={styles.submit}
                type="primary"
                htmlType="submit"
              >
                Ingresar
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Layout>
  );
}
