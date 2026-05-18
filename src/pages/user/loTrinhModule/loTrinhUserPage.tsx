'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { RootState } from '@/store';
import {
  Code2,
  Database,
  Layers,
  Server,
  Clock,
  Target,
  Zap,
  BookOpen,
} from 'lucide-react';

type PathType = 'frontend' | 'backend' | 'fullstack' | 'devops';

interface LearningStep {
  id: number;
  title: string;
  description: string;
  duration: string;
  skills: string[];
}

interface LearningPath {
  title: string;
  icon: typeof Code2;
  color: string;
  bgColor: string;
  borderColor: string;
  steps: LearningStep[];
}

const learningPaths: Record<PathType, LearningPath> = {
  frontend: {
    title: 'Frontend Developer',
    icon: Code2,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500',
    borderColor: 'border-blue-500',
    steps: [
      {
        id: 1,
        title: 'HTML & CSS',
        description: 'Nắm vững cấu trúc web, semantic HTML, CSS layouts (Flexbox, Grid), responsive design.',
        duration: '4 tuần',
        skills: ['HTML5', 'CSS3', 'Responsive Design', 'Flexbox', 'Grid'],
      },
      {
        id: 2,
        title: 'JavaScript Core',
        description: 'Học JavaScript từ cơ bản đến nâng cao: ES6+, DOM manipulation, async/await.',
        duration: '6 tuần',
        skills: ['ES6+', 'DOM', 'Async/Await', 'Fetch API'],
      },
      {
        id: 3,
        title: 'React Framework',
        description: 'Xây dựng giao diện với React: components, hooks, state management, context.',
        duration: '8 tuần',
        skills: ['React', 'JSX', 'Hooks', 'Context API', 'React Router'],
      },
      {
        id: 4,
        title: 'TypeScript & Next.js',
        description: 'Type-safe development với TypeScript và SSR/SSG với Next.js framework.',
        duration: '6 tuần',
        skills: ['TypeScript', 'Next.js', 'SSR', 'SSG'],
      },
      {
        id: 5,
        title: 'State & Testing',
        description: 'Quản lý state phức tạp với Redux/Zustand và testing với Jest.',
        duration: '4 tuần',
        skills: ['Redux', 'Zustand', 'Jest', 'Testing Library'],
      },
      {
        id: 6,
        title: 'Dev Tools',
        description: 'Sử dụng Git, CI/CD, Docker basics, và deploy ứng dụng lên Vercel.',
        duration: '2 tuần',
        skills: ['Git', 'CI/CD', 'Docker', 'Vercel'],
      },
    ],
  },
  backend: {
    title: 'Backend Developer',
    icon: Database,
    color: 'text-green-500',
    bgColor: 'bg-green-500',
    borderColor: 'border-green-500',
    steps: [
      {
        id: 1,
        title: 'Node.js Fundamentals',
        description: 'Nền tảng Node.js: event loop, modules, npm, file system, và xây dựng REST API.',
        duration: '4 tuần',
        skills: ['Node.js', 'NPM', 'REST API', 'Express.js'],
      },
      {
        id: 2,
        title: 'Database Design',
        description: 'Thiết kế và quản lý database: SQL (PostgreSQL), NoSQL (MongoDB), ORM.',
        duration: '6 tuần',
        skills: ['PostgreSQL', 'MongoDB', 'Prisma', 'Mongoose'],
      },
      {
        id: 3,
        title: 'Authentication & Security',
        description: 'JWT, OAuth2, session management, password hashing, và bảo mật API.',
        duration: '4 tuần',
        skills: ['JWT', 'OAuth2', 'Bcrypt', 'Helmet'],
      },
      {
        id: 4,
        title: 'API Design & GraphQL',
        description: 'Thiết kế API chuẩn RESTful, GraphQL, API versioning, và documentation.',
        duration: '4 tuần',
        skills: ['RESTful', 'GraphQL', 'Swagger', 'Postman'],
      },
      {
        id: 5,
        title: 'Microservices & Queue',
        description: 'Kiến trúc microservices với RabbitMQ/Kafka, containerization với Docker.',
        duration: '6 tuần',
        skills: ['Microservices', 'Docker', 'RabbitMQ', 'Kafka'],
      },
      {
        id: 6,
        title: 'Cloud & Deployment',
        description: 'Deploy và scale ứng dụng trên AWS/GCP, CI/CD pipelines, monitoring.',
        duration: '4 tuần',
        skills: ['AWS', 'GCP', 'CI/CD', 'Docker Compose'],
      },
    ],
  },
  fullstack: {
    title: 'Fullstack Developer',
    icon: Layers,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500',
    borderColor: 'border-purple-500',
    steps: [
      {
        id: 1,
        title: 'Web Basics',
        description: 'HTML, CSS, JavaScript cơ bản - nền tảng của mọi web developer.',
        duration: '4 tuần',
        skills: ['HTML5', 'CSS3', 'JavaScript', 'Git'],
      },
      {
        id: 2,
        title: 'Frontend Frameworks',
        description: 'React hoặc Vue.js - xây dựng giao diện người dùng hiện đại.',
        duration: '8 tuần',
        skills: ['React', 'Vue.js', 'State Management', 'CSS Framework'],
      },
      {
        id: 3,
        title: 'Backend Development',
        description: 'Node.js/Express hoặc Python/Django - xây dựng server-side logic.',
        duration: '8 tuần',
        skills: ['Node.js', 'Express', 'Python', 'Django'],
      },
      {
        id: 4,
        title: 'Database Mastery',
        description: 'Kết hợp SQL và NoSQL, caching với Redis, tối ưu query performance.',
        duration: '6 tuần',
        skills: ['PostgreSQL', 'MongoDB', 'Redis', 'Caching'],
      },
      {
        id: 5,
        title: 'DevOps Fundamentals',
        description: 'Docker, CI/CD, cloud deployment, monitoring và logging.',
        duration: '4 tuần',
        skills: ['Docker', 'CI/CD', 'AWS', 'Monitoring'],
      },
      {
        id: 6,
        title: 'Fullstack Projects',
        description: 'Xây dựng các dự án thực tế từ đầu đến cuối với best practices.',
        duration: '8 tuần',
        skills: ['Agile', 'Testing', 'Documentation', 'Deployment'],
      },
    ],
  },
  devops: {
    title: 'DevOps Engineer',
    icon: Server,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500',
    borderColor: 'border-orange-500',
    steps: [
      {
        id: 1,
        title: 'Linux & Shell',
        description: 'Thành thạo Linux, command line, bash scripting, và system administration.',
        duration: '4 tuần',
        skills: ['Linux', 'Bash', 'Shell', 'SSH'],
      },
      {
        id: 2,
        title: 'Docker',
        description: 'Docker fundamentals: images, containers, volumes, networking, và Docker Compose.',
        duration: '4 tuần',
        skills: ['Docker', 'Docker Compose', 'Dockerfile', 'Containerization'],
      },
      {
        id: 3,
        title: 'Kubernetes',
        description: 'Orchestration với Kubernetes: pods, services, deployments, scaling, và Helm.',
        duration: '8 tuần',
        skills: ['Kubernetes', 'Helm', 'Kubectl', 'Pods'],
      },
      {
        id: 4,
        title: 'CI/CD Pipelines',
        description: 'Jenkins, GitLab CI, GitHub Actions - xây dựng automated pipelines.',
        duration: '6 tuần',
        skills: ['Jenkins', 'GitLab CI', 'GitHub Actions', 'Pipeline'],
      },
      {
        id: 5,
        title: 'Infrastructure as Code',
        description: 'Terraform, Ansible - quản lý infrastructure dưới dạng code.',
        duration: '6 tuần',
        skills: ['Terraform', 'Ansible', 'IaC', 'CloudFormation'],
      },
      {
        id: 6,
        title: 'Cloud & Monitoring',
        description: 'AWS/GCP/Azure, monitoring với Prometheus/Grafana, logging với ELK stack.',
        duration: '6 tuần',
        skills: ['AWS', 'Prometheus', 'Grafana', 'ELK Stack'],
      },
    ],
  },
};

const tabs = [
  { id: 'frontend' as PathType, label: 'Frontend', icon: Code2 },
  { id: 'backend' as PathType, label: 'Backend', icon: Database },
  { id: 'fullstack' as PathType, label: 'Fullstack', icon: Layers },
  { id: 'devops' as PathType, label: 'DevOps', icon: Server },
];

const LoTrinhUserPage = () => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<PathType>('frontend');
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  const currentPath = learningPaths[activeTab];
  const IconComponent = currentPath.icon;

  return (
    <div className={cn('max-w-7xl mx-auto space-y-6 p-4', isDark ? 'text-white' : 'text-slate-900')}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center',
          isDark ? 'bg-primary/20' : 'bg-primary/10'
        )}>
          <Target className={cn('w-5 h-5', isDark ? 'text-primary' : 'text-primary')} />
        </div>
        <div>
          <h1 className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-slate-900')}>
            Lộ trình học tập
          </h1>
          <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
            Chọn lộ trình phù hợp với mục tiêu nghề nghiệp của bạn
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className={cn(
        'flex gap-1 p-1 rounded-lg',
        isDark ? 'bg-slate-800' : 'bg-slate-100'
      )}>
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setHoveredStep(null);
              }}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-md font-medium transition-all duration-300 flex-1 justify-center text-sm',
                isActive
                  ? 'bg-primary text-white shadow-md shadow-primary/25'
                  : isDark
                    ? 'text-slate-400 hover:text-white hover:bg-slate-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              )}
            >
              <TabIcon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Path Info */}
      <div className="flex items-center gap-3">
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center',
          isDark ? 'bg-slate-800' : 'bg-slate-100'
        )}>
          <IconComponent className={cn('w-6 h-6', currentPath.color)} />
        </div>
        <div>
          <h2 className={cn('text-xl font-bold', isDark ? 'text-white' : 'text-slate-900')}>
            {currentPath.title}
          </h2>
          <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
            {currentPath.steps.length} giai đoạn • 24-30 tuần
          </p>
        </div>
      </div>

      {/* Horizontal Steps */}
      <div className="relative -mx-2">
        {/* Progress Line */}
        <div className={cn(
          'absolute top-7 left-0 right-0 h-0.5 mx-14 rounded-full overflow-hidden',
          isDark ? 'bg-slate-700' : 'bg-slate-200'
        )}>
          <div className={cn(
            'h-full rounded-full transition-all duration-500',
            currentPath.bgColor
          )} style={{ width: '100%' }} />
        </div>

        {/* Steps */}
        <div className="flex gap-3 overflow-x-auto pb-4 px-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {currentPath.steps.map((step, index) => {
            const isHovered = hoveredStep === step.id;
            const isPast = index < (hoveredStep ?? -1);

            return (
              <div
                key={step.id}
                className="relative flex-shrink-0 w-44 group"
                onMouseEnter={() => setHoveredStep(step.id)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                {/* Step Card */}
                <Card className={cn(
                  'h-full border-2 transition-all duration-300 cursor-pointer',
                  isHovered
                    ? cn('border-primary shadow-xl scale-105 z-10', isDark ? 'bg-slate-800' : 'bg-white')
                    : cn('border-transparent', isDark ? 'bg-slate-800/50' : 'bg-white/50'),
                  isPast && cn('border-l-4', currentPath.borderColor)
                )}>
                  <CardContent className="p-3 flex flex-col h-full">
                    {/* Step Number Circle */}
                    <div className={cn(
                      'w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-2 text-lg font-bold transition-all duration-300 shrink-0',
                      isHovered
                        ? cn('text-white', currentPath.bgColor, 'shadow-lg')
                        : isPast
                          ? cn('text-white', currentPath.bgColor)
                          : isDark
                            ? 'bg-slate-700 text-slate-300'
                            : 'bg-slate-100 text-slate-600'
                    )}>
                      {index + 1}
                    </div>

                    {/* Title */}
                    <h3 className={cn(
                      'text-center font-semibold text-sm mb-1 shrink-0 transition-colors',
                      isHovered ? 'text-primary' : isDark ? 'text-white' : 'text-slate-900'
                    )}>
                      {step.title}
                    </h3>

                    {/* Duration */}
                    <div className={cn(
                      'flex items-center justify-center gap-1 text-xs shrink-0',
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    )}>
                      <Clock className="w-3 h-3" />
                      <span>{step.duration}</span>
                    </div>

                    {/* Hover Content - Fixed height to keep cards aligned */}
                    <div className={cn(
                      'mt-3 pt-3 border-t border-border dark:border-slate-700 transition-all duration-200 min-h-[80px]',
                      isHovered ? 'opacity-100 animate-in fade-in slide-in-from-bottom-2' : 'opacity-0'
                    )}>
                      <p className={cn(
                        'text-xs mb-2 leading-relaxed line-clamp-2',
                        isDark ? 'text-slate-300' : 'text-slate-600'
                      )}>
                        {step.description}
                      </p>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {step.skills.slice(0, 2).map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className={cn(
                              'text-xs py-0 px-1.5 font-normal',
                              isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                            )}
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Step Detail */}
      {hoveredStep !== null && (
        <Card className={cn(
          'border-border dark:border-border animate-in fade-in slide-in-from-bottom-4 duration-300',
          isDark ? 'bg-slate-800' : 'bg-white'
        )}>
          <CardContent className="p-4">
            {(() => {
              const step = currentPath.steps.find(s => s.id === hoveredStep);
              if (!step) return null;
              return (
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Left */}
                  <div className="lg:w-1/3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm',
                        currentPath.bgColor
                      )}>
                        {step.id}
                      </div>
                      <div>
                        <h3 className={cn('font-bold text-sm', isDark ? 'text-white' : 'text-slate-900')}>
                          {step.title}
                        </h3>
                        <div className={cn(
                          'flex items-center gap-1 text-xs',
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        )}>
                          <Clock className="w-3 h-3" />
                          <span>{step.duration}</span>
                        </div>
                      </div>
                    </div>
                    <p className={cn(
                      'text-xs leading-relaxed',
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    )}>
                      {step.description}
                    </p>
                  </div>

                  {/* Right - Skills */}
                  <div className="lg:w-2/3">
                    <h4 className={cn(
                      'text-xs font-semibold mb-2',
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    )}>
                      Kỹ năng đạt được:
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {step.skills.map((skill) => (
                        <Badge
                          key={skill}
                          className={cn(
                            'px-2 py-0.5 text-xs font-medium',
                            isDark
                              ? 'bg-slate-700 text-slate-200 border border-slate-600'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          )}
                        >
                          <Zap className="w-2.5 h-2.5 mr-1" />
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* CTA */}
      <Card className={cn(
        'border-border dark:border-border',
        isDark ? 'bg-gradient-to-r from-primary/20 to-secondary/20' : 'bg-gradient-to-r from-primary/10 to-secondary/10'
      )}>
        <CardContent className="p-4 text-center">
          <BookOpen className={cn('w-8 h-8 mx-auto mb-2', isDark ? 'text-primary' : 'text-primary')} />
          <h3 className={cn('text-base font-bold mb-1', isDark ? 'text-white' : 'text-slate-900')}>
            Sẵn sàng bắt đầu?
          </h3>
          <p className={cn('text-xs mb-3 max-w-md mx-auto', isDark ? 'text-slate-300' : 'text-slate-600')}>
            Đăng ký khóa học đầu tiên của lộ trình {currentPath.title} và bắt đầu hành trình.
          </p>
          <button className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors">
            Khám phá khóa học
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoTrinhUserPage;
