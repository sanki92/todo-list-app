// import { Header } from 'antd/es/layout/layout';
import "./App.css";
// import { format } from 'date-fns'
// import dayjs from "dayjs";
import moment from "moment";
import { useState } from "react";
import {
  Table,
  Tag,
  Tooltip,
  Input,
  Modal,
  Form,
  DatePicker,
  Select,
  Button,
} from "antd";
import { PlusOutlined, EditTwoTone, DeleteTwoTone } from "@ant-design/icons";
const { Option } = Select;
const { Search } = Input;
function App() {
  const [form] = Form.useForm();
  const [form2] = Form.useForm();

  const [dataSource, setdataSource] = useState([]);
  const [searchData, setSearchData] = useState([]);
  const [len, setlen] = useState(0);
  const [isEditable, setIsEditable] = useState(false);
  const [editedTask, setEditedTask] = useState({});
  const [isVisible, setisVisible] = useState(false);
  const [data, setData] = useState({});

  const columns = [
    // a
    {
      key: "1",
      title: "Timestamp",
      dataIndex: "timestamp",
      sorter: (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      render: (timestamp) => new Date(timestamp).toLocaleDateString(),
    },
    // b
    {
      key: "2",
      title: "Title",
      dataIndex: "title",
      sorter: (a, b) => a.title.length - b.title.length,
    },
    // c
    {
      key: "3",
      title: "Description",
      dataIndex: "description",
      width: "200px",
      sorter: (a, b) => a.description.length - b.description.length,
    },
    // d
    {
      key: "4",
      title: "Due Date",
      dataIndex: "due",
      sorter: (a, b) => a.due.localeCompare(b.due),
    },
    // e
    {
      key: "5",
      title: "Tags",
      dataIndex: "tags",
      render: (_, { tags }) => (
        <>
          {tags !== undefined
            ? tags.map((tag) => {
                let color = tag.length > 5 ? "geekblue" : "green";
                return (
                  <Tag color={color} key={tag}>
                    {tag.toUpperCase()}
                  </Tag>
                );
              })
            : false}
        </>
      ),
    },
    // f
    {
      key: "6",
      title: "Status",
      dataIndex: "status",
      filters: [
        { text: "OPEN", value: "OPEN" },
        { text: "WORKING", value: "WORKING" },
        { text: "DONE", value: "DONE" },
        { text: "OVERDUE", value: "OVERDUE" },
      ],
      onFilter: (value, record) => record.status.indexOf(value) === 0,
    },
    {
      key: "7",
      title: "Actions",
      render: (record) => {
        return (
          <>
            <EditTwoTone
              onClick={(e) => {
                onEditTask(record);
              }}
            />
            <DeleteTwoTone
              onClick={() => {
                onDeleteTask(record);
              }}
              style={{ marginLeft: "18px" }}
              twoToneColor="red"
            />
          </>
        );
      },
    },
  ];

  // ADD TASK
  const onAddTask = () => {
    setisVisible(true);
  };

  // DELETE TASK
  const onDeleteTask = (record) => {
    Modal.confirm({
      title: "Are you sure, you want to delete this task?",
      okText: "Yes",
      okType: "danger",
      onOk: () => {
        setdataSource((pre) => {
          return pre.filter((task) => task.id !== record.id);
        });
        setSearchData((pre) => {
          return pre.filter((task) => task.id !== record.id);
        });
      },
    });
  };

  const onEditTask = (record) => {
    form.setFieldsValue({
      title: record?.title,
      description: record?.description,
      due: moment(record?.due, "MM/DD/YYYY"),
      tags: record?.tags,
      status: record?.status,
    });

    setData(record);
    setEditedTask(record);
    setIsEditable(true);
  };

  const onSearch = (event) => {
    setlen(event?.target?.value.length);
    if (event?.target?.value.length > 0) {
      const reg = new RegExp(event?.target?.value, "i");
      const filterData = dataSource.filter((e) => {
        return reg.test(e.title);
      });
      if (filterData?.length > 0) {
        setSearchData(filterData);
      } else {
        setSearchData([]);
      }
    } else {
      setSearchData(dataSource);
    }
  };
  let final;
  if (len > 0) {
    if (searchData.length > 0) {
      final = searchData;
    } else {
      final = [];
    }
  } else {
    final = dataSource;
  }

  const tagOptions = [
    { label: "Important", value: "important" },
    { label: "Easy", value: "easy" },
    { label: "Urgent", value: "urgent" },
    { label: "Routine", value: "routine" },
  ];

  const statusOptions = [
    { label: "OPEN", value: "OPEN" },
    { label: "WORKING", value: "WORKING" },
    { label: "DONE", value: "DONE" },
    { label: "OVERDUE", value: "OVERDUE" },
  ];

  const handleSubmit = (values) => {
    setisVisible(false);
    values.id = dataSource.length + 1;
    values.timestamp = new Date().toLocaleDateString();
    if (values.due !== undefined)
      values.due = values.due.$d.toLocaleDateString();

    setdataSource((pre) => {
      return [...pre, values];
    });
    form2.setFieldsValue({
      title: "",
      description: "",
      due: null,
      tags: [],
      status: "OPEN",
    });
  };

  const handleEditSubmit = () => {
    setdataSource((pre) => {
      return pre.map((task) => {
        if (task.id === editedTask.id) {
          return editedTask;
        } else {
          return task;
        }
      });
    });
    setIsEditable(false);
  };

  return (
    <div className="container">
      <nav>
        <h1>ToDo List</h1>
        <Search
          onChange={onSearch}
          placeholder="Enter Title"
          allowClear
          style={{ width: 300 }}
        />
        <Tooltip placement="bottom" title="Add Task">
          <button onClick={onAddTask} className="btn">
            <PlusOutlined />
          </button>
        </Tooltip>
      </nav>
      {final.length > 0 ? (
        <Table
          pagination={{ pageSize: 10 }}
          size="medium"
          columns={columns}
          dataSource={final}
        ></Table>
      ) : dataSource.length > 0 ? (
        "No task found!"
      ) : (
        "Add a Task to do!"
      )}

      {/* EDIT TASK */}
      <Modal
        className="Edit-modal"
        title="Edit Task"
        visible={isEditable}
        onCancel={() => {
          setIsEditable(false);
          setEditedTask();
        }}
      >
        <Form form={form} layout="vertical" onFinish={handleEditSubmit}>
          <Form.Item
            label="Title"
            name="title"
            rules={[
              { required: true, message: "Please enter the title" },
              { max: 100 },
            ]}
          >
            <Input
              onChange={(e) => {
                setEditedTask((pre) => {
                  return { ...pre, title: e.target.value };
                });
              }}
            />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[
              { required: true, message: "Please enter the description" },
              { max: 1000 },
            ]}
          >
            <Input.TextArea
              onChange={(e) => {
                setEditedTask((pre) => {
                  return { ...pre, description: e.target.value };
                });
              }}
              placeholder="Enter the description"
            />
          </Form.Item>

          <Form.Item
            label="Due Date"
            name="due"
            requiredMark="optional"
            rules={[
              {
                validator: (_, value) => {
                  if (value && value < moment().startOf("day")) {
                    return Promise.reject(
                      new Error("Due date cannot be earlier than today")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <DatePicker
              onChange={(e) => {
                setEditedTask((pre) => {
                  return { ...pre,due: moment(e, 'MM/DD/YYYY')?._i?.$d?.toLocaleDateString() };
                });
              }}
              format={"MM/DD/YYYY"}
            />
          </Form.Item>

          <Form.Item label="Tag" name="tags">
            <Select
              mode="tags"
              onChange={(e) => {
                setEditedTask((pre) => {
                  return { ...pre, tags: e };
                });
              }}
              placeholder="Enter the tag"
            >
              {tagOptions.map((tag) => (
                <Option key={tag.value} value={tag.value}>
                  {tag.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: "Please choose the status" }]}
          >
            <Select
              placeholder="Select status"
              onChange={(e) => {
                setEditedTask((pre) => {
                  return { ...pre, status: e };
                });
              }}
            >
              {statusOptions.map((status) => (
                <Option key={status.value} value={status.value}>
                  {status.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button className="Submit-btn" type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* ADD TASK */}

      <Modal
        visible={isVisible}
        onCancel={() => {
          setisVisible(false);
        }}
        title="Add New Task"
      >
        <Form form={form2} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Title"
            name="title"
            rules={[
              { required: true, message: "Please enter the title" },
              { max: 100 },
            ]}
            optional
          >
            <Input placeholder="Enter the title" />
          </Form.Item>
          <Form.Item
            label="Description"
            name="description"
            rules={[
              { required: true, message: "Please enter the description" },
              { max: 1000 },
            ]}
          >
            <Input.TextArea placeholder="Enter the description" />
          </Form.Item>
          <Form.Item
            label="Due Date"
            name="due"
            requiredMark="optional"
            rules={[
              {
                validator: (_, value) => {
                  if (value && value < moment().startOf("day")) {
                    return Promise.reject(
                      new Error("Due date cannot be earlier than today")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <DatePicker format={"MM/DD/YYYY"} />
          </Form.Item>
          <Form.Item label="Tag" name="tags" requiredMark="optional">
            <Select mode="tags" placeholder="Enter the tag">
              {tagOptions.map((tag) => (
                <Option key={tag.value} value={tag.value}>
                  {tag.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="status"
            label="Status"
            initialValue="OPEN"
            rules={[{ required: true, message: "Please choose the status" }]}
          >
            <Select placeholder="Select status">
              {statusOptions.map((status) => (
                <Option key={status.value} value={status.value}>
                  {status.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button className="Submit-btn" type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default App;
