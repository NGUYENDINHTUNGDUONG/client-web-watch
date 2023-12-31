import { Button, Form, Radio, Space } from "antd";
import React from "react";
import { WrapperHeader } from "./style";
import TableComponent from "../TableComponent/TableComponent";
import InputComponent from "../InputComponent/InputComponent";
import DrawerComponent from "../DrawerComponent/DrawerComponent";

import ModalComponent from "../ModalComponent/ModalComponent";
import { useEffect } from "react";
import * as message from "../../components/Message/Message";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRef } from "react";

import * as UserService from "../../services/UserService";
import { useIsFetching } from "@tanstack/react-query";
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { listUser } from "../../redux/slides/userSlide";

const AdminUser = () => {
  const [rowSelected, setRowSelected] = useState("");
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);
  const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
  const [create, setCreate] = useState(false);
  const user = useSelector((state) => state?.user);
  const searchInput = useRef(null);

  const [stateUserDetails, setStateUserDetails] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "",
    address: "",
    password: "",
  });

  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const access_token = localStorage.getItem("access_token");

  const getAllUsers = async () => {
    try {
      const res = await UserService.getAllUser(access_token);
      dispatch(listUser(res?.data));
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    form.setFieldsValue(stateUserDetails);
  }, [form, stateUserDetails]);

  useEffect(() => {
    getAllUsers();
  }, [isOpenDrawer]);

  const handleDetailsProduct = () => {
    setIsOpenDrawer(true);
    setCreate(false);
  };

  const isFetchingUser = useIsFetching(["users"]);
  const renderAction = () => {
    return (
      <div className="flex justify-around gap-x-2">
        <EditOutlined
          style={{ color: "orange", fontSize: "30px", cursor: "pointer" }}
          onClick={handleDetailsProduct}
        />
        <DeleteOutlined
          style={{ color: "red", fontSize: "30px", cursor: "pointer" }}
          onClick={() => setIsModalOpenDelete(true)}
        />
      </div>
    );
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
  };
  const handleReset = (clearFilters) => {
    clearFilters();
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <InputComponent
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: "block",
          }}
        />
        <Space>
          <Button
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
            color="white"
          >
            Tìm kiếm
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Làm mới
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? "#1890ff" : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
  });

  const columns = [
    {
      title: "Họ tên",
      dataIndex: "fullName",
      sorter: (a, b) => a.fullName.length - b.fullName.length,
      ...getColumnSearchProps("fullName"),
    },
    {
      title: "Email",
      dataIndex: "email",
      sorter: (a, b) => a.email.length - b.email.length,
      ...getColumnSearchProps("email"),
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      sorter: (a, b) => a.address.length - b.address.length,
      ...getColumnSearchProps("address"),
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      sorter: (a, b) => a.role.length - b.role.length,
      ...getColumnSearchProps("fullName"),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      render: (text) => "0" + text,
      sorter: (a, b) => a.phone - b.phone,
      ...getColumnSearchProps("phone"),
    },
    {
      title: "",
      dataIndex: "action",
      render: renderAction,
    },
  ];
  const test = useSelector((state) => state.user.listUser);
  const dataTable =
    test?.length > 0 &&
    test?.map((user) => {
      return {
        ...user,
        fullName: user.fullName,
        key: user._id,
        role: user.role,
      };
    });

  const handleCloseDrawer = () => {
    setIsOpenDrawer(false);
    setStateUserDetails({
      fullName: "",
      email: "",
      phone: "",
      role: "",
      address: "",
      password: "",
    });
    form.resetFields();
  };
  const handleCreateUser = () => {
    setIsOpenDrawer(true);
    setCreate(true);
    setStateUserDetails({
      fullName: "",
      email: "",
      phone: "",
      role: "",
      address: "",
      password: "",
    });
    form.resetFields();
  };

  const handleCancelDelete = () => {
    setIsModalOpenDelete(false);
  };

  const handleDeleteUser = async () => {
    try {
      const res = await UserService.deleteUser(rowSelected, access_token);
      if (res) {
        message.success("Xoá người dùng thành công!");
        setIsModalOpenDelete(false);
        getAllUsers();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleOnchangeDetails = (e) => {
    setStateUserDetails({
      ...stateUserDetails,
      [e.target.name]: e.target.value,
    });
  };

  const onUpdateUser = async () => {
    try {
      const res = await UserService.updateUser(
        rowSelected,
        stateUserDetails,
        access_token
      );
      if (res) {
        setIsOpenDrawer(false);
        message.success("Cập nhật người dùng thành công!");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const onCreateUser = async () => {
    try {
      const res = await UserService.registerUser(stateUserDetails);
      if (res) {
        setIsOpenDrawer(false);
        setCreate(false);
        message.success("Tạo người dùng thành công!");
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div>
      <WrapperHeader>Quản lý người dùng</WrapperHeader>
      <div style={{ marginTop: "20px" }}>
        <TableComponent
          keyselected="users"
          createUser={handleCreateUser}
          columns={columns}
          isLoading={isFetchingUser}
          data={dataTable}
          onRow={(record, rowIndex) => {
            return {
              onClick: (event) => {
                setRowSelected(record._id);
                setStateUserDetails({
                  fullName: record?.fullName,
                  email: record?.email,
                  phone: record?.phone,
                  role: record?.role,
                  address: record?.address,
                });
              },
            };
          }}
        />
      </div>
      <DrawerComponent
        title={create ? "Thêm người dùng" : "Chi tiết người dùng"}
        isOpen={isOpenDrawer}
        onClose={() => setIsOpenDrawer(false)}
        width="90%"
      >
        <Form
          name="basic"
          labelCol={{ span: 2 }}
          wrapperCol={{ span: 22 }}
          onFinish={create ? onCreateUser : onUpdateUser}
          autoComplete="on"
          form={form}
        >
          <Form.Item
            label="Họ tên"
            name="fullName"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập họ tên của người dùng",
              },
            ]}
          >
            <InputComponent
              value={stateUserDetails["fullName"]}
              onChange={handleOnchangeDetails}
              name="fullName"
            />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập email của người dùng !",
              },
            ]}
          >
            <InputComponent
              value={stateUserDetails["email"]}
              onChange={handleOnchangeDetails}
              name="email"
            />
          </Form.Item>
          {create ? (
            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập mật khẩu của người dùng!",
                },
              ]}
            >
              <InputComponent
                value={stateUserDetails["password"]}
                onChange={handleOnchangeDetails}
                name="password"
              />
            </Form.Item>
          ) : null}
          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập số điện thoại của người dùng!",
              },
            ]}
          >
            <InputComponent
              value={stateUserDetails.phone}
              onChange={handleOnchangeDetails}
              name="phone"
            />
          </Form.Item>

          <Form.Item
            label="Địa chỉ"
            name="address"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập địa chỉ của người dùng !",
              },
            ]}
          >
            <InputComponent
              value={stateUserDetails.address}
              onChange={handleOnchangeDetails}
              name="address"
            />
          </Form.Item>
          <Form.Item
            label="Vai trò"
            name="role"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập vai trò của người dùng!",
              },
            ]}
          >
            <Radio.Group onChange={handleOnchangeDetails} name="role">
              <Radio value="admin"> Quản trị viên </Radio>
              <Radio value="user"> Khách hàng </Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 20, span: 16 }}>
            <Button htmlType="submit">{create ? "Tạo" : "Cập nhật"}</Button>
          </Form.Item>
        </Form>
      </DrawerComponent>
      <ModalComponent
        title="Xóa người dùng"
        open={isModalOpenDelete}
        onCancel={handleCancelDelete}
        onOk={handleDeleteUser}
        footer={null}
      >
        <div>Bạn có chắc muốn xóa tài khoản này không?</div>
        <div className="flex justify-center gap-x-2 mt-4">
          <Button onClick={handleDeleteUser}>Xóa</Button>
        </div>
      </ModalComponent>
    </div>
  );
};

export default AdminUser;
