import React, { useState } from 'react';
import {
  Col,
  Row,
  Input,
  Button,
  Modal,
  Pagination,
  Tooltip,
  message,
  App,
  Typography,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import UserForm from '@/modules/user/UserForm';
import { NewUser, User } from '@/types';
import useUser from '@/modules/user/hooks/useUser';
import useCompany from '@/modules/company/hooks/useCompany';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import UserChagePasswordForm from '@/modules/user/UserChagePasswordForm';
import UserCardEsp from '@/modules/user/userCardEsp';

const { Title } = Typography;
const { Search } = Input;

const UserCards = () => {
  const [searchValue, setSearchValue] = useState('');
  const [companySearchValue, setCompanySearchValue] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | object>({});
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [isPassword, setIsPassword] = useState<boolean>(false);
  const [itemsPerPage] = useState(9);
  const { companies } = useCompany();
  const { roles } = useSelector((state: RootState) => state.roles);
  const { users, activeUser, addNewUser, editUser, editPasswordUser } =
    useUser();

  const handleSearch = (value: string) => {
    setCurrentPage(1);
    setSearchValue(value);
  };

  const handleCompanySearch = (value: string) => {
    setCurrentPage(1);
    setCompanySearchValue(value);
  };

  const filteredUsers = users.filter((user) => {
    const matchesName = `${user.name} ${user.lastname}`
      .toLowerCase()
      .includes(searchValue.toLowerCase());

    const matchesCompany =
      user.company && typeof user.company.name === 'string'
        ? user.company.name
            .toLowerCase()
            .includes(companySearchValue.toLowerCase())
        : false;

    const noNameFilter = !searchValue;
    const noCompanyFilter = !companySearchValue;

    return (noNameFilter || matchesName) && (noCompanyFilter || matchesCompany);
  });

  const onSubmit = async (data: Partial<NewUser>) => {
    const tempUser = {
      ...data,
      role: Number(data.role),
      password: String(data.password),
    };
    if (isEdit) {
      await editUser({ ...selectedUser, ...tempUser } as User);
    } else if (isPassword && selectedUser && 'id' in selectedUser) {
      await editPasswordUser(selectedUser.id, tempUser.password);
    } else {
      await addNewUser(tempUser);
    }
    setIsModalVisible(false);
    setIsEdit(false);
    setSelectedUser({});
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setIsEdit(false);
    setIsPassword(false);
    setSelectedUser({});
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleEditClick = (user: User) => {
    setIsEdit(true);
    setIsPassword(false);
    setSelectedUser(user);
    setIsModalVisible(true);
  };
  const handlePasswordClick = (user: User) => {
    setIsEdit(false);
    setIsPassword(true);
    setSelectedUser(user);
    setIsModalVisible(true);
  };

  const handleConfirm = async (userId: number) => {
    try {
      await activeUser(userId);
      message.success('El estado de la compañía se actualizó correctamente');
    } catch (error) {
      message.error('No fue posible actualizar el estado de la compañía');
      return error;
    }
  };

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <App>
      <Col className="admin-content">
        <Title className="admin-title" level={1}>
          Administra los usuarios aquí
        </Title>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Search
              placeholder="Buscar por nombre o apellido"
              onSearch={handleSearch}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ marginBottom: 20 }}
            />
          </Col>
          <Col xs={24} md={12}>
            <Search
              placeholder="Buscar por compañía"
              onSearch={handleCompanySearch}
              onChange={(e) => handleCompanySearch(e.target.value)}
              style={{ marginBottom: 20 }}
            />
          </Col>
        </Row>
        <Row className="admin-grid" gutter={[16, 16]} wrap>
          {paginatedUsers.map((user) => (
            <Col key={user.id} xs={24} sm={12} xl={8} xxl={6}>
              <UserCardEsp
                user={user}
                handleEditClick={handleEditClick}
                handlePasswordClick={handlePasswordClick}
                handleConfirm={handleConfirm}
              />
            </Col>
          ))}
        </Row>

        <Pagination
          current={currentPage}
          pageSize={itemsPerPage}
          total={filteredUsers.length}
          onChange={handlePageChange}
          style={{ marginTop: 20, textAlign: 'center' }}
        />
        <Tooltip title="Añadir Usuario">
          <Button
            type="primary"
            shape="circle"
            aria-label="Añadir usuario"
            className="floating-action"
            icon={<PlusOutlined style={{ fontSize: '24px' }} />}
            onClick={() => setIsModalVisible(true)}
            style={{
              position: 'fixed',
              bottom: 30,
              right: 30,
              zIndex: 1000,
              fontSize: 24,
            }}
          />
        </Tooltip>
        <Modal
          title={
            isPassword
              ? 'Cambiar Contraseña'
              : isEdit
                ? 'Editar Usuario'
                : 'Añadir Nuevo Usuario'
          }
          open={isModalVisible}
          onCancel={handleCancel}
          footer={null}
        >
          {isPassword ? (
            <UserChagePasswordForm
              initialValues={{
                id:
                  'id' in selectedUser ? (selectedUser as User).id : undefined,
              }}
              onSubmit={onSubmit}
            />
          ) : (
            <UserForm
              initialvalues={selectedUser}
              isEdit={isEdit}
              onSubmit={onSubmit}
              companies={companies}
              roles={roles}
            />
          )}
        </Modal>
      </Col>
    </App>
  );
};

export default UserCards;
