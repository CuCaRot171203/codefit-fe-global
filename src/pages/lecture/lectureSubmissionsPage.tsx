import { useState, useEffect } from 'react';
import { useAppSelector } from '@/store';
import {
  Table,
  Button,
  Input,
  Select,
  Tag,
  Space,
  Modal,
  message,
  Card,
  Row,
  Col,
  Typography,
  Tooltip,
  Statistic,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  MailOutlined,
  SearchOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import api from '../../services/api';

const { Title, Text } = Typography;
const { Option } = Select;

interface Submission {
  id: string;
  lessonId: string;
  userId: string;
  code: string;
  language: string;
  score: number | null;
  passedTests: number | null;
  totalTests: number | null;
  hintsUsed: number;
  status: string;
  createdAt: string;
  reviewedAt: string | null;
  user: {
    id: string;
    username: string;
    fullName: string;
    email: string;
  };
  lesson: {
    id: string;
    title: string;
    type: string;
    phase: {
      title: string;
      course: {
        id: string;
        title: string;
      };
    };
  };
}

interface Course {
  id: string;
  title: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
}

export default function LectureSubmissionsPage() {
  const { theme } = useAppSelector((state) => state.theme);
  const isDark = theme === 'dark';
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 20 });
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  // Filters
  const [courseFilter, setCourseFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [searchText, setSearchText] = useState('');

  // Fetch submissions
  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
      if (courseFilter) params.append('courseId', courseFilter);
      if (statusFilter) params.append('status', statusFilter);

      const response = await api.get<{ submissions: any[]; page: number; limit: number; total: number }>(`/api/lecture/submissions?${params.toString()}`);
      if (response.success && response.data) {
        setSubmissions(response.data.submissions ?? []);
        setPagination((prev) => ({ ...prev, page: response.data!.page, limit: response.data!.limit, total: response.data!.total }));
      }
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
      message.error('Không thể tải danh sách bài nộp');
    } finally {
      setLoading(false);
    }
  };

  // Fetch courses for filter
  const fetchCourses = async () => {
    try {
      const response = await api.get<any[]>('/api/lecture/courses');
      if (response.success && response.data) {
        setCourses(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [pagination.page, courseFilter, statusFilter]);

  useEffect(() => {
    fetchCourses();
  }, []);

  // Handle approve single
  const handleApprove = async (id: string) => {
    try {
      const response = await api.post(`/api/lecture/submissions/${id}/approve`, {});
      if (response.success) {
        message.success('Đã duyệt bài nộp');
        fetchSubmissions();
      }
    } catch (error) {
      console.error('Failed to approve:', error);
      message.error('Không thể duyệt bài nộp');
    }
  };

  // Handle reject single
  const handleReject = async (id: string) => {
    Modal.confirm({
      title: 'Từ chối bài nộp',
      content: (
        <Input.TextArea
          id="reject-feedback"
          placeholder="Nhập phản hồi cho học viên (tùy chọn)"
          rows={3}
        />
      ),
      async onOk() {
        const feedback = (document.getElementById('reject-feedback') as HTMLTextAreaElement)?.value;
        try {
          const response = await api.post(`/api/lecture/submissions/${id}/reject`, { feedback });
          if (response.success) {
            message.success('Đã từ chối bài nộp');
            fetchSubmissions();
          }
        } catch (error) {
          console.error('Failed to reject:', error);
          message.error('Không thể từ chối bài nộp');
        }
      },
    });
  };

  // Handle bulk approve
  const handleBulkApprove = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất một bài nộp');
      return;
    }

    Modal.confirm({
      title: 'Duyệt nhiều bài nộp',
      content: `Bạn có chắc muốn duyệt ${selectedRowKeys.length} bài nộp và gửi email thông báo cho học viên?`,
      async onOk() {
        try {
          const response = await api.post('/api/lecture/submissions/bulk-approve', {
            submissionIds: selectedRowKeys,
          });
          if (response.success) {
            message.success(`Đã duyệt ${selectedRowKeys.length} bài nộp và gửi email`);
            setSelectedRowKeys([]);
            fetchSubmissions();
          }
        } catch (error) {
          console.error('Failed to bulk approve:', error);
          message.error('Không thể duyệt các bài nộp');
        }
      },
    });
  };

  // Open detail modal
  const showDetail = (submission: Submission) => {
    setSelectedSubmission(submission);
    setDetailModalVisible(true);
  };

  // Filter submissions by search text
  const filteredSubmissions = submissions.filter((sub) => {
    if (!searchText) return true;
    const search = searchText.toLowerCase();
    return (
      sub.user.username.toLowerCase().includes(search) ||
      sub.user.fullName?.toLowerCase().includes(search) ||
      sub.user.email.toLowerCase().includes(search) ||
      sub.lesson.title.toLowerCase().includes(search)
    );
  });

  // Table columns
  const columns = [
    {
      title: 'Học viên',
      key: 'user',
      render: (_: any, record: Submission) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.user.fullName || record.user.username}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.user.email}</Text>
        </div>
      ),
    },
    {
      title: 'Khóa học',
      key: 'course',
      render: (_: any, record: Submission) => (
        <div>
          <div>{record.lesson.phase.course.title}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.lesson.title}</Text>
        </div>
      ),
    },
    {
      title: 'Điểm',
      key: 'score',
      width: 120,
      render: (_: any, record: Submission) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: getScoreColor(record.score, isDark) }}>
            {record.score ?? '-'}
          </div>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {record.passedTests}/{record.totalTests} tests
          </Text>
        </div>
      ),
    },
    {
      title: 'Hints',
      key: 'hints',
      width: 80,
      render: (_: any, record: Submission) => (
        <Tag color={record.hintsUsed > 0 ? 'orange' : 'default'}>
          {record.hintsUsed} used
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 120,
      render: (_: any, record: Submission) => (
        <Tag color={getStatusColor(record.status)}>
          {getStatusLabel(record.status)}
        </Tag>
      ),
    },
    {
      title: 'Ngày nộp',
      key: 'createdAt',
      width: 150,
      render: (_: any, record: Submission) => (
        <Text type="secondary">
          {new Date(record.createdAt).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 180,
      render: (_: any, record: Submission) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button size="small" onClick={() => showDetail(record)}>
              Chi tiết
            </Button>
          </Tooltip>
          {record.status === 'PENDING' && (
            <>
              <Tooltip title="Duyệt">
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleApprove(record.id)}
                />
              </Tooltip>
              <Tooltip title="Từ chối">
                <Button
                  danger
                  size="small"
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleReject(record.id)}
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  // Stats
  const pendingCount = submissions.filter((s) => s.status === 'PENDING').length;
  const approvedCount = submissions.filter((s) => s.status === 'APPROVED').length;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={3}>Quản lý Bài nộp</Title>
        <Text type="secondary">
          Xem và duyệt các bài nộp của học viên trong khóa học của bạn
        </Text>
      </div>

      {/* Stats */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card size="small">
            <Statistic
              title="Tổng bài nộp"
              value={pagination.total}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Statistic
              title="Chờ duyệt"
              value={pendingCount}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Statistic
              title="Đã duyệt"
              value={approvedCount}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            placeholder="Tìm kiếm học viên, bài học..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          <Select
            placeholder="Chọn khóa học"
            value={courseFilter}
            onChange={setCourseFilter}
            allowClear
            style={{ width: 200 }}
          >
            {courses.map((course) => (
              <Option key={course.id} value={course.id}>
                {course.title}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="Trạng thái"
            value={statusFilter}
            onChange={setStatusFilter}
            allowClear
            style={{ width: 150 }}
          >
            <Option value="PENDING">Chờ duyệt</Option>
            <Option value="APPROVED">Đã duyệt</Option>
            <Option value="REJECTED">Từ chối</Option>
          </Select>
          <Button icon={<ReloadOutlined />} onClick={fetchSubmissions}>
            Làm mới
          </Button>
        </Space>
      </Card>

      {/* Bulk Actions */}
      {selectedRowKeys.length > 0 && (
        <Card size="small" style={{ marginBottom: 16, backgroundColor: isDark ? '#1e3a5f' : '#f0f9ff' }}>
          <Space>
            <Text strong>Đã chọn: {selectedRowKeys.length} bài</Text>
            <Button
              type="primary"
              icon={<MailOutlined />}
              onClick={handleBulkApprove}
            >
              Duyệt & Gửi Email
            </Button>
            <Button onClick={() => setSelectedRowKeys([])}>Hủy chọn</Button>
          </Space>
        </Card>
      )}

      {/* Table */}
      <Table
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
          selections: [
            Table.SELECTION_ALL,
            Table.SELECTION_INVERT,
            Table.SELECTION_NONE,
          ],
        }}
        columns={columns}
        dataSource={filteredSubmissions}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.page,
          pageSize: pagination.limit,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bài`,
          onChange: (page, pageSize) => {
            setPagination({ ...pagination, page, limit: pageSize });
          },
        }}
      />

      {/* Detail Modal */}
      <Modal
        title="Chi tiết bài nộp"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
          selectedSubmission?.status === 'PENDING' && (
            <>
              <Button
                key="reject"
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => {
                  setDetailModalVisible(false);
                  handleReject(selectedSubmission.id);
                }}
              >
                Từ chối
              </Button>
              <Button
                key="approve"
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => {
                  setDetailModalVisible(false);
                  handleApprove(selectedSubmission.id);
                }}
              >
                Duyệt
              </Button>
            </>
          ),
        ]}
        width={800}
      >
        {selectedSubmission && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>Học viên:</Text>
                <div>{selectedSubmission.user.fullName || selectedSubmission.user.username}</div>
                <Text type="secondary">{selectedSubmission.user.email}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Khóa học:</Text>
                <div>{selectedSubmission.lesson.phase.course.title}</div>
                <Text type="secondary">Bài: {selectedSubmission.lesson.title}</Text>
              </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col span={8}>
                <Text strong>Điểm:</Text>
                <div style={{ fontSize: 24, fontWeight: 600, color: getScoreColor(selectedSubmission.score, isDark) }}>
                  {selectedSubmission.score ?? '-'}
                </div>
              </Col>
              <Col span={8}>
                <Text strong>Tests passed:</Text>
                <div style={{ fontSize: 24, fontWeight: 600 }}>
                  {selectedSubmission.passedTests}/{selectedSubmission.totalTests}
                </div>
              </Col>
              <Col span={8}>
                <Text strong>Trạng thái:</Text>
                <div>
                  <Tag color={getStatusColor(selectedSubmission.status)}>
                    {getStatusLabel(selectedSubmission.status)}
                  </Tag>
                </div>
              </Col>
            </Row>

            <div style={{ marginTop: 16 }}>
              <Text strong>Code đã nộp:</Text>
              <pre
                style={{
                  backgroundColor: isDark ? '#1f2028' : '#f5f5f5',
                  padding: 16,
                  borderRadius: 4,
                  overflow: 'auto',
                  maxHeight: 300,
                  fontSize: 12,
                  color: isDark ? '#e2e8f0' : '#1f2937',
                }}
              >
                {selectedSubmission.code}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// Helper functions
function getScoreColor(score: number | null, isDark: boolean): string {
  if (score === null) return isDark ? '#6b7280' : '#999';
  if (score >= 80) return isDark ? '#34d399' : '#10b981';
  if (score >= 50) return isDark ? '#fcd34d' : '#f59e0b';
  return isDark ? '#f87171' : '#ef4444';
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'gold';
    case 'APPROVED':
      return 'green';
    case 'REJECTED':
      return 'red';
    default:
      return 'default';
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'Chờ duyệt';
    case 'APPROVED':
      return 'Đã duyệt';
    case 'REJECTED':
      return 'Từ chối';
    default:
      return status;
  }
}
