'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { RootState } from '@/store';
import { BookOpen, ExternalLink } from 'lucide-react';

interface Technology {
  id: number;
  name: string;
  logo: string;
  url: string;
  category: string;
  description: string;
  version?: string;
  color?: string;
}

const technologies: Technology[] = [
  // Frontend
  {
    id: 1,
    name: 'React',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
    url: 'https://react.dev',
    category: 'Frontend',
    description: 'Thư viện JavaScript phổ biến nhất để xây dựng giao diện người dùng với component-based architecture.',
    version: 'v19',
    color: '#61DAFB',
  },
  {
    id: 2,
    name: 'Vue.js',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-plain.svg',
    url: 'https://vuejs.org',
    category: 'Frontend',
    description: 'Framework JavaScript progressive, dễ học, linh hoạt với hệ sinh thái phong phú.',
    version: 'v3',
    color: '#4FC08D',
  },
  {
    id: 3,
    name: 'Angular',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angular/angular-plain.svg',
    url: 'https://angular.io',
    category: 'Frontend',
    description: 'Framework TypeScript đầy đủ tính năng cho các ứng dụng enterprise với dependency injection.',
    version: 'v19',
    color: '#DD0031',
  },
  {
    id: 4,
    name: 'Next.js',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg',
    url: 'https://nextjs.org',
    category: 'Frontend',
    description: 'Framework React với Server-Side Rendering, Static Site Generation và tối ưu hóa tự động.',
    version: 'v15',
    color: '#000000',
  },
  {
    id: 5,
    name: 'Tailwind CSS',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-plain.svg',
    url: 'https://tailwindcss.com',
    category: 'Frontend',
    description: 'Utility-first CSS framework giúp xây dựng giao diện đẹp nhanh chóng với atomic classes.',
    version: 'v4',
    color: '#06B6D4',
  },
  {
    id: 6,
    name: 'Svelte',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/svelte/svelte-plain.svg',
    url: 'https://svelte.dev',
    category: 'Frontend',
    description: 'Framework JavaScript compiler-based, tạo ra code nhỏ gọn với performance cao.',
    version: 'v5',
    color: '#FF3E00',
  },
  // Backend
  {
    id: 7,
    name: 'Node.js',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
    url: 'https://nodejs.org',
    category: 'Backend',
    description: 'Runtime JavaScript phía server, xây dựng ứng dụng mạng nhanh và scalable.',
    version: 'v22',
    color: '#339933',
  },
  {
    id: 8,
    name: 'Express.js',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg',
    url: 'https://expressjs.com',
    category: 'Backend',
    description: 'Framework web Node.js tối giản, linh hoạt và là nền tảng cho nhiều MEAN/MERN stack.',
    color: '#000000',
  },
  {
    id: 9,
    name: 'Spring Boot',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg',
    url: 'https://spring.io/projects/spring-boot',
    category: 'Backend',
    description: 'Framework Java giúp tạo ứng dụng Spring độc lập, production-grade một cách dễ dàng.',
    version: 'v3',
    color: '#6DB33F',
  },
  {
    id: 10,
    name: 'Django',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg',
    url: 'https://www.djangoproject.com',
    category: 'Backend',
    description: 'Framework Python web full-stack với ORM tích hợp, authentication và admin panel.',
    version: 'v5',
    color: '#092E20',
  },
  {
    id: 11,
    name: 'FastAPI',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg',
    url: 'https://fastapi.tiangolo.com',
    category: 'Backend',
    description: 'Framework Python hiện đại, nhanh, dễ học với automatic docs và type safety.',
    version: 'v0.115',
    color: '#009688',
  },
  {
    id: 12,
    name: 'Go',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg',
    url: 'https://go.dev',
    category: 'Backend',
    description: 'Ngôn ngữ lập trình hiệu năng cao, concurrency built-in, ideal cho cloud services.',
    version: 'v1.23',
    color: '#00ADD8',
  },
  // Database
  {
    id: 13,
    name: 'PostgreSQL',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg',
    url: 'https://www.postgresql.org',
    category: 'Database',
    description: 'Hệ quản trị cơ sở dữ liệu SQL mạnh mẽ, open-source với nhiều tính năng enterprise.',
    version: 'v17',
    color: '#4169E1',
  },
  {
    id: 14,
    name: 'MongoDB',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg',
    url: 'https://www.mongodb.com',
    category: 'Database',
    description: 'Cơ sở dữ liệu NoSQL document-oriented, linh hoạt với JSON-like documents.',
    version: 'v8',
    color: '#47A248',
  },
  {
    id: 15,
    name: 'Redis',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg',
    url: 'https://redis.io',
    category: 'Database',
    description: 'In-memory data store cho caching, session store, message queue và real-time analytics.',
    version: 'v8',
    color: '#DC382D',
  },
  {
    id: 16,
    name: 'MySQL',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg',
    url: 'https://www.mysql.com',
    category: 'Database',
    description: 'Hệ quản trị cơ sở dữ liệu quan hệ phổ biến nhất thế giới, reliable và dễ sử dụng.',
    version: 'v9',
    color: '#4479A1',
  },
  // DevOps
  {
    id: 17,
    name: 'Docker',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg',
    url: 'https://www.docker.com',
    category: 'DevOps',
    description: 'Nền tảng container hóa giúp đóng gói và chạy ứng dụng trong môi trường cô lập.',
    color: '#2496ED',
  },
  {
    id: 18,
    name: 'Kubernetes',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-original.svg',
    url: 'https://kubernetes.io',
    category: 'DevOps',
    description: 'Hệ thống điều phối container tự động, scaling và quản lý ứng dụng containerized.',
    version: 'v1.32',
    color: '#326CE5',
  },
  {
    id: 19,
    name: 'GitHub',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg',
    url: 'https://github.com',
    category: 'DevOps',
    description: 'Nền tảng hosting code và collaboration với Git, CI/CD và quản lý project.',
    color: '#181717',
  },
  {
    id: 20,
    name: 'GitLab',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/gitlab/gitlab-original.svg',
    url: 'https://gitlab.com',
    category: 'DevOps',
    description: 'Nền tảng DevOps toàn diện với CI/CD, container registry và project management.',
    color: '#FC6D26',
  },
  // Tools
  {
    id: 21,
    name: 'TypeScript',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
    url: 'https://www.typescriptlang.org',
    category: 'Tools',
    description: 'Ngôn ngữ lập trình superset của JavaScript với static typing và object-oriented features.',
    version: 'v5',
    color: '#3178C6',
  },
  {
    id: 22,
    name: 'Prisma',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/prisma/prisma-original.svg',
    url: 'https://www.prisma.io',
    category: 'Tools',
    description: 'ORM next-generation cho Node.js và TypeScript với type-safe database access.',
    version: 'v6',
    color: '#2D3748',
  },
  {
    id: 23,
    name: 'GraphQL',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/graphql/graphql-plain.svg',
    url: 'https://graphql.org',
    category: 'Tools',
    description: 'Ngôn ngữ truy vấn cho API, cho phép client yêu cầu chính xác data họ cần.',
    color: '#E10098',
  },
  {
    id: 24,
    name: 'Vite',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vite/vite-original.svg',
    url: 'https://vitejs.dev',
    category: 'Tools',
    description: 'Build tool thế hệ mới với dev server cực nhanh và HMR tức thì.',
    version: 'v6',
    color: '#646CFF',
  },
  {
    id: 25,
    name: 'Webpack',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/webpack/webpack-original.svg',
    url: 'https://webpack.js.org',
    category: 'Tools',
    description: 'Module bundler mạnh mẽ, bundle JavaScript files cho production deployment.',
    version: 'v5',
    color: '#8DD6F9',
  },
  {
    id: 26,
    name: 'Bun',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bun/bun-original.svg',
    url: 'https://bun.sh',
    category: 'Tools',
    description: 'JavaScript runtime và toolkit nhanh hơn Node.js với built-in bundler và package manager.',
    version: 'v1.2',
    color: '#FEF0C7',
  },
];

const categories = [
  { id: 'all', label: 'Tất cả' },
  { id: 'Frontend', label: 'Frontend' },
  { id: 'Backend', label: 'Backend' },
  { id: 'Database', label: 'Database' },
  { id: 'DevOps', label: 'DevOps' },
  { id: 'Tools', label: 'Tools' },
];

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    Frontend: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    Backend: 'bg-green-500/10 text-green-500 border-green-500/20',
    Database: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    DevOps: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    Tools: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  };
  return colors[category] || 'bg-slate-500/10 text-slate-500 border-slate-500/20';
};

const TaiLieuPage = () => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredTech = activeCategory === 'all'
    ? technologies
    : technologies.filter(tech => tech.category === activeCategory);

  return (
    <div className={cn('max-w-7xl mx-auto space-y-6 p-4', isDark ? 'text-white' : 'text-slate-900')}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center',
          isDark ? 'bg-primary/20' : 'bg-primary/10'
        )}>
          <BookOpen className={cn('w-5 h-5', isDark ? 'text-primary' : 'text-primary')} />
        </div>
        <div>
          <h1 className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-slate-900')}>
            Công nghệ cho Developer
          </h1>
          <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
            Khám phá các framework, thư viện và công cụ phổ biến trong ngành
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-1">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-300',
                isActive
                  ? 'bg-primary text-white'
                  : isDark
                    ? 'bg-slate-800 text-slate-400 hover:text-white'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              )}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Technologies Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filteredTech.map((tech) => (
          <a
            key={tech.id}
            href={tech.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block"
          >
            <Card className={cn(
              'h-full border-border dark:border-border overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-primary',
              isDark ? 'bg-slate-800' : 'bg-white'
            )}>
              <div className="relative p-4">
                {/* Logo */}
                <div
                  className="w-full aspect-square relative mb-3 flex items-center justify-center rounded-lg"
                  style={{ backgroundColor: tech.color ? `${tech.color}15` : undefined }}
                >
                  <img
                    src={tech.logo}
                    alt={tech.name}
                    className="max-w-[60%] max-h-[60%] object-contain transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent && tech.color) {
                        parent.innerHTML = `<span class="text-3xl font-bold" style="color: ${tech.color}">${tech.name.charAt(0)}</span>`;
                      }
                    }}
                  />
                </div>

                {/* Name */}
                <h3 className={cn(
                  'text-sm font-semibold text-center mb-1 transition-colors',
                  isDark ? 'text-white' : 'text-slate-900',
                  'group-hover:text-primary'
                )}>
                  {tech.name}
                </h3>

                {/* Version Badge */}
                {tech.version && (
                  <div className="flex justify-center mb-2">
                    <Badge className={cn('text-xs', getCategoryColor(tech.category))}>
                      {tech.version}
                    </Badge>
                  </div>
                )}

                {/* Category */}
                <p className={cn(
                  'text-xs text-center',
                  isDark ? 'text-slate-500' : 'text-slate-400'
                )}>
                  {tech.category}
                </p>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/80 dark:bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-3 rounded-lg">
                  <p className="text-white text-xs text-center leading-relaxed mb-2 line-clamp-4">
                    {tech.description}
                  </p>
                  <div className="flex items-center gap-1 text-white text-xs bg-white/20 px-2 py-1 rounded-full">
                    <ExternalLink className="w-3 h-3" />
                    <span>Visit Website</span>
                  </div>
                </div>
              </div>
            </Card>
          </a>
        ))}
      </div>

      {/* Empty State */}
      {filteredTech.length === 0 && (
        <div className={cn(
          'flex flex-col items-center justify-center py-16 text-center',
          isDark ? 'text-slate-400' : 'text-slate-500'
        )}>
          <BookOpen className="w-12 h-12 mb-3 opacity-50" />
          <p className="text-sm">Không có công nghệ nào trong danh mục này</p>
        </div>
      )}

      {/* Info Footer */}
      <div className={cn(
        'flex items-center justify-center gap-2 text-xs py-3 rounded-lg',
        isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
      )}>
        <ExternalLink className="w-3 h-3" />
        <span>Click vào công nghệ để mở trang chủ trong tab mới</span>
      </div>
    </div>
  );
};

export default TaiLieuPage;
