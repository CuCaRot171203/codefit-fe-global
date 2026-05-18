import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAppSelector } from '@/store';
import { cn } from '@/lib/utils';
import { API_ENDPOINTS } from '@/config/api';
import { message } from 'antd';
import {
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  GripVertical,
  Calendar,
  Link as LinkIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface LessonRequest {
  id: string;
  lessonId: string;
  lectureId: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'CANCELLED';
  dueDate: string | null;
  notes: string | null;
  createdAt: string;
  lesson: {
    id: string;
    title: string;
    type: string;
    phase: {
      id: string;
      title: string;
      course: {
        id: string;
        title: string;
      };
    };
  };
  lecture: {
    id: string;
    username: string;
    fullName: string | null;
    email: string;
  };
}

interface KanbanBoardProps {
  requests: LessonRequest[];
  onStatusChange: (id: string, newStatus: string) => void;
  onRefresh: () => void;
}

const STATUS_COLUMNS = [
  { id: 'PENDING', title: 'Chờ xử lý', icon: Clock, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/30' },
  { id: 'IN_PROGRESS', title: 'Đang làm', icon: AlertCircle, color: 'text-blue-500', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30' },
  { id: 'SUBMITTED', title: 'Đã nộp', icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/30' },
  { id: 'CANCELLED', title: 'Đã hủy', icon: XCircle, color: 'text-gray-500', bgColor: 'bg-gray-500/10', borderColor: 'border-gray-500/30' },
];

function KanbanCard({ request, isDragging }: { request: LessonRequest; isDragging?: boolean }) {
  const { theme } = useAppSelector((state) => state.theme);
  const isDark = theme === 'dark';

  return (
    <div
      className={cn(
        'p-4 rounded-lg border transition-all cursor-grab active:cursor-grabbing',
        isDragging ? 'opacity-50 shadow-lg scale-105' : '',
        isDark
          ? 'bg-slate-700/80 border-slate-600 hover:border-slate-500'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <span className={cn(
          'text-xs px-2 py-1 rounded-full',
          request.lesson.type === 'LECTURE' ? 'bg-purple-500/10 text-purple-500' :
          request.lesson.type === 'EXERCISE' ? 'bg-orange-500/10 text-orange-500' :
          'bg-cyan-500/10 text-cyan-500'
        )}>
          {request.lesson.type === 'LECTURE' ? 'Bài giảng' :
           request.lesson.type === 'EXERCISE' ? 'Bài tập' : 'Tài liệu'}
        </span>
        <GripVertical className={cn('w-4 h-4 opacity-50', isDark ? 'text-slate-400' : 'text-slate-400')} />
      </div>

      <h4 className={cn('font-medium mb-2 line-clamp-2', isDark ? 'text-white' : 'text-slate-900')}>
        {request.lesson.title}
      </h4>

      <p className={cn('text-xs mb-3', isDark ? 'text-slate-400' : 'text-slate-500')}>
        {request.lesson.phase.course.title}
      </p>

      <div className="flex items-center gap-2 mb-3">
        <div className={cn(
          'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
          isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-100 text-cyan-600'
        )}>
          {request.lecture.fullName?.[0] || request.lecture.username[0]}
        </div>
        <span className={cn('text-xs truncate', isDark ? 'text-slate-300' : 'text-slate-600')}>
          {request.lecture.fullName || request.lecture.username}
        </span>
      </div>

      {request.dueDate && (
        <div className={cn(
          'flex items-center gap-1 text-xs',
          new Date(request.dueDate) < new Date() ? 'text-red-500' : isDark ? 'text-slate-400' : 'text-slate-500'
        )}>
          <Calendar className="w-3 h-3" />
          {new Date(request.dueDate).toLocaleDateString('vi-VN')}
        </div>
      )}

      <Link
        to={`/admin/lesson-requests/${request.id}`}
        className={cn(
          'flex items-center justify-center gap-1 mt-3 py-2 rounded text-xs font-medium transition-colors',
          isDark ? 'bg-slate-600/50 hover:bg-slate-600 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
        )}
      >
        <LinkIcon className="w-3 h-3" />
        Xem chi tiết
      </Link>
    </div>
  );
}

function SortableCard({ request }: { request: LessonRequest }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: request.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <KanbanCard request={request} isDragging={isDragging} />
    </div>
  );
}

function Column({ column, requests }: { column: typeof STATUS_COLUMNS[0]; requests: LessonRequest[] }) {
  const { theme } = useAppSelector((state) => state.theme);
  const isDark = theme === 'dark';
  const Icon = column.icon;

  const { setNodeRef, isOver } = useDroppable({
    id: column.id, // Use column id directly for droppable
  });

  return (
    <div
      className={cn(
        'flex-1 min-w-[280px] max-w-[320px] rounded-lg transition-all',
        isOver && 'ring-2 ring-cyan-500 ring-offset-2'
      )}
    >
      <div className={cn(
        'rounded-lg p-3 mb-3',
        column.bgColor
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={cn('w-5 h-5', column.color)} />
            <h3 className={cn('font-semibold', isDark ? 'text-white' : 'text-slate-900')}>
              {column.title}
            </h3>
          </div>
          <span className={cn(
            'px-2 py-0.5 rounded-full text-xs font-medium',
            isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'
          )}>
            {requests.length}
          </span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          'space-y-3 min-h-[200px] p-2 rounded-lg transition-colors',
          isOver && (isDark ? 'bg-cyan-500/10' : 'bg-cyan-50'),
          !isOver && (isDark ? 'bg-slate-800/50' : 'bg-slate-50')
        )}
      >
        {requests.map((request) => (
          <SortableCard key={request.id} request={request} />
        ))}
        {requests.length === 0 && (
          <div className={cn(
            'flex items-center justify-center h-32 rounded-lg border-2 border-dashed',
            isDark ? 'border-slate-700 text-slate-500' : 'border-slate-200 text-slate-400'
          )}>
            <p className="text-sm">Kéo thả vào đây</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function KanbanBoard({ requests, onStatusChange, onRefresh }: KanbanBoardProps) {
  const { theme } = useAppSelector((state) => state.theme);
  const isDark = theme === 'dark';
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeRequest = requests.find(r => r.id === active.id);
    if (!activeRequest) return;

    let newStatus: string | null = null;

    // Check if dropped on a column directly (using column id)
    const overColumn = STATUS_COLUMNS.find(col => col.id === over.id);
    if (overColumn) {
      newStatus = overColumn.id;
    } else {
      // Check if dropped over another card
      const overRequest = requests.find(r => r.id === over.id);
      if (overRequest) {
        newStatus = overRequest.status;
      }
    }

    if (newStatus && newStatus !== activeRequest.status) {
      onStatusChange(activeRequest.id, newStatus);

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_ENDPOINTS.lessonRequests.update(activeRequest.id)}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        });
        const data = await response.json();
        if (data.success) {
          message.success(`Đã chuyển sang "${STATUS_COLUMNS.find(c => c.id === newStatus)?.title}"`);
          onRefresh();
        } else {
          message.error(data.message || 'Cập nhật thất bại');
          onRefresh();
        }
      } catch (error) {
        console.error('Error updating status:', error);
        message.error('Cập nhật thất bại');
        onRefresh();
      }
    }
  };

  const activeRequest = requests.find(r => r.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUS_COLUMNS.map((column) => (
          <Column
            key={column.id}
            column={column}
            requests={requests.filter(r => r.status === column.id)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeRequest && (
          <div className="w-[300px]">
            <KanbanCard request={activeRequest} isDragging />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
