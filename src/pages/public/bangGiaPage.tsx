import { Button, Tag } from 'antd';
import { Link } from 'react-router-dom';
import ScrollReveal from '@/components/shared/ScrollReveal';

const courses = [
  {
    id: 1,
    title: 'JavaScript Fundamentals',
    description: 'Nền tảng JavaScript từ cơ bản đến nâng cao, bao gồm ES6+, async/await và các pattern hiện đại.',
    price: 99000,
    originalPrice: 199000,
    level: 'Người mới bắt đầu',
    levelColor: 'green',
    duration: '40 Giờ học',
    lessons: 24,
    image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&q=80',
    features: [
      '24 bài học video chất lượng cao',
      '20+ bài tập thực hành',
      '6 bài kiểm tra nhỏ',
      '1 dự án hoàn thành',
      'Chứng chỉ hoàn thành khóa học',
      'Hỗ trợ AI Mentor',
    ],
    popular: false,
  },
  {
    id: 2,
    title: 'React Masterclass',
    description: 'Chuyên sâu React.js với hooks, context, Redux và xây dựng ứng dụng sản xuất thực sự.',
    price: 149000,
    originalPrice: 299000,
    level: 'Trung cấp',
    levelColor: 'blue',
    duration: '60 Giờ học',
    lessons: 36,
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
    features: [
      '36 bài học video chuyên sâu',
      '30+ bài tập thực hành',
      '8 bài kiểm tra nhỏ',
      '2 dự án hoàn thành',
      'Chứng chỉ hoàn thành khóa học',
      'Hỗ trợ AI Mentor 24/7',
    ],
    popular: true,
  },
  {
    id: 3,
    title: 'Python for Data Science',
    description: 'Học Python từ cơ bản đến nâng cao, ứng dụng trong Data Science và Machine Learning.',
    price: 199000,
    originalPrice: 399000,
    level: 'Trung cấp',
    levelColor: 'orange',
    duration: '80 Giờ học',
    lessons: 48,
    image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&q=80',
    features: [
      '48 bài học video toàn diện',
      '40+ bài tập thực hành',
      '10 bài kiểm tra nhỏ',
      '3 dự án hoàn thành',
      'Chứng chỉ hoàn thành khóa học',
      'Hỗ trợ AI Mentor 24/7',
    ],
    popular: false,
  },
];

const BangGiaPage = () => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  return (
    <main className="min-h-screen bg-background dark:bg-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 sm:py-16 md:py-20 lg:py-28">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 dark:from-cyan-500/5 dark:via-transparent dark:to-orange-500/5" />
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/10 dark:bg-cyan-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-secondary/10 dark:bg-orange-500/10 rounded-full blur-[100px]" />
        </div>

        <ScrollReveal>
          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 md:px-8 text-center">
            <span className="inline-block font-headline text-primary dark:text-cyan-400 tracking-[0.2em] uppercase text-xs sm:text-sm mb-4 sm:mb-6 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 dark:bg-cyan-500/10 rounded-full">
              Đăng ký khóa học
            </span>
            <h1 className="font-headline text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-on-background dark:text-white mb-4 sm:mb-6">
              Chọn khóa học phù hợp với bạn
            </h1>
            <p className="font-body text-sm sm:text-base md:text-lg lg:text-xl text-on-surface-variant dark:text-slate-400 max-w-2xl mx-auto px-2">
              Mỗi khóa học được thiết kế riêng biệt với nội dung thực tế, bài tập chuyên sâu và hỗ trợ từ cộng đồng.
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* Course Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pb-16 sm:pb-20 md:pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {courses.map((course, index) => (
            <ScrollReveal key={course.id} delay={index * 0.1}>
              <div
                className={`relative h-full rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-3 flex flex-col ${
                  course.popular
                    ? 'bg-gradient-to-br from-primary dark:from-cyan-600 dark:to-cyan-900 shadow-2xl shadow-primary/20 dark:shadow-cyan-500/20'
                    : 'bg-surface dark:bg-slate-800 border border-outline-variant/30 dark:border-slate-700'
                }`}
              >
                {course.popular && (
                  <div className="absolute top-4 right-4 z-20">
                    <Tag className="!bg-secondary !text-white !border-0 !font-headline !text-xs !px-3 !py-1 !rounded-full">
                      Phổ biến nhất
                    </Tag>
                  </div>
                )}

                {/* Course Image */}
                <div className="relative h-36 sm:h-48 overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div
                    className={`absolute inset-0 ${
                      course.popular
                        ? 'bg-gradient-to-t from-primary/80 dark:from-cyan-900/90 to-transparent'
                        : 'bg-gradient-to-t from-black/60 to-transparent'
                    }`}
                  />
                  <div className="absolute bottom-4 left-6 right-6">
                    <Tag
                      color={course.levelColor}
                      className="!font-headline !text-xs !border-0"
                    >
                      {course.level}
                    </Tag>
                  </div>
                </div>

                {/* Course Content */}
                <div className="p-5 sm:p-6 md:p-8 flex flex-col flex-grow">
                  <h3
                    className={`font-headline text-2xl font-bold mb-3 ${
                      course.popular ? 'text-white' : 'text-on-surface dark:text-white'
                    }`}
                  >
                    {course.title}
                  </h3>
                  <p
                    className={`text-sm mb-6 leading-relaxed ${
                      course.popular ? 'text-white/80' : 'text-on-surface-variant dark:text-slate-400'
                    }`}
                  >
                    {course.description}
                  </p>

                  {/* Stats */}
                  <div
                    className={`flex items-center gap-4 mb-6 text-xs ${
                      course.popular ? 'text-white/70' : 'text-on-surface-variant dark:text-slate-500'
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      {course.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">play_circle</span>
                      {course.lessons} bài
                    </span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8 flex-grow">
                    {course.features.map((feature, i) => (
                      <li
                        key={i}
                        className={`flex items-start gap-3 text-sm ${
                          course.popular ? 'text-white/90' : 'text-on-surface-variant dark:text-slate-400'
                        }`}
                      >
                        <span
                          className={`material-symbols-outlined text-lg flex-shrink-0 ${
                            course.popular ? 'text-secondary dark:text-orange-300' : 'text-primary dark:text-cyan-400'
                          }`}
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          check_circle
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Price & CTA */}
                  <div className="border-t pt-6 border-white/10 dark:border-slate-700">
                    <div className="flex items-end justify-between mb-4">
                      <div>
                        <span
                          className={`text-sm line-through ${
                            course.popular ? 'text-white/50' : 'text-on-surface-variant/50 dark:text-slate-500'
                          }`}
                        >
                          {formatPrice(course.originalPrice)}
                        </span>
                        <div
                          className={`text-3xl font-headline font-bold ${
                            course.popular ? 'text-white' : 'text-on-surface dark:text-white'
                          }`}
                        >
                          {formatPrice(course.price)}
                        </div>
                      </div>
                      <span
                        className={`text-xs ${
                          course.popular ? 'text-secondary dark:text-orange-300' : 'text-primary dark:text-cyan-400'
                        }`}
                      >
                        Giảm{' '}
                        {Math.round((1 - course.price / course.originalPrice) * 100)}%
                      </span>
                    </div>

                    <Link to="/dang-nhap">
                      <Button
                        size="large"
                        block
                        className={`!h-12 !rounded-xl !font-headline !font-bold !text-base ${
                          course.popular
                            ? '!bg-secondary !border-none !text-white hover:!bg-orange-500 hover:!scale-[1.02] transition-all !shadow-lg'
                            : '!bg-primary !border-none !text-white dark:!bg-cyan-600 hover:!bg-primary/90 dark:hover:!bg-cyan-500 transition-all'
                        }`}
                      >
                        Đăng ký ngay
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 sm:py-20 md:py-24 bg-surface-container-lowest dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <ScrollReveal>
            <div className="text-center mb-10 sm:mb-14 md:mb-16">
              <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl font-bold text-on-surface dark:text-white mb-4">
                Tại sao chọn CodeFit?
              </h2>
              <p className="text-on-surface-variant dark:text-slate-400 text-lg max-w-2xl mx-auto">
                Chúng tôi mang đến trải nghiệm học tập tốt nhất với công nghệ hiện đại
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {[
              {
                icon: 'school',
                title: 'Giảng viên chuyên nghiệp',
                desc: '100+ giảng viên từ các công ty công nghệ hàng đầu',
              },
              {
                icon: 'psychology',
                title: 'AI Mentor 24/7',
                desc: 'Hỗ trợ giải đáp thắc mắc mọi lúc mọi nơi',
              },
              {
                icon: 'workspace_premium',
                title: 'Chứng chỉ giá trị',
                desc: 'Chứng chỉ được công nhận bởi 50+ đối tác',
              },
              {
                icon: 'code',
                title: 'Thực hành thực tế',
                desc: '500+ bài tập từ các dự án thực tế của doanh nghiệp',
              },
            ].map((item, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="bg-surface dark:bg-slate-800 p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl text-center hover:-translate-y-2 transition-all duration-300 border border-outline-variant/20 dark:border-slate-700">
                  <span className="material-symbols-outlined text-3xl sm:text-4xl md:text-5xl text-primary dark:text-cyan-400 mb-3 sm:mb-4">
                    {item.icon}
                  </span>
                  <h3 className="font-headline font-bold text-lg text-on-surface dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-on-surface-variant dark:text-slate-400">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-24">
        <ScrollReveal>
          <h2 className="font-headline text-2xl sm:text-3xl font-bold mb-8 sm:mb-10 md:mb-12 text-center text-on-surface dark:text-white">
            Câu hỏi thường gặp
          </h2>
        </ScrollReveal>

        <div className="space-y-6">
          {[
            {
              q: 'Tôi có được hoàn tiền nếu không hài lòng không?',
              a: 'Có, chúng tôi cam kết hoàn tiền 100% trong vòng 7 ngày nếu bạn không hài lòng với khóa học.',
            },
            {
              q: 'Khóa học có thời hạn không?',
              a: 'Không, sau khi đăng ký bạn sẽ có quyền truy cập vĩnh viễn vào tất cả nội dung của khóa học đó.',
            },
            {
              q: 'Tôi cần chuẩn bị gì trước khi bắt đầu?',
              a: 'Chỉ cần một chiếc máy tính và kết nối internet. Tất cả các công cụ đã được chuẩn bị sẵn trên nền tảng.',
            },
            {
              q: 'Chứng chỉ có giá trị như thế nào?',
              a: 'Chứng chỉ CodeFit được công nhận bởi 50+ công ty công nghệ hàng đầu Việt Nam và quốc tế.',
            },
          ].map((item, i) => (
            <ScrollReveal key={i} delay={i * 0.05}>
              <div className="p-4 sm:p-5 md:p-6 bg-surface dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-outline-variant/20 dark:border-slate-700">
                <h4 className="font-headline font-bold text-sm sm:text-base text-on-surface dark:text-white mb-2 sm:mb-3 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary dark:text-cyan-400">
                    help
                  </span>
                  {item.q}
                </h4>
                <p className="text-sm text-on-surface-variant dark:text-slate-400 leading-relaxed pl-9">
                  {item.a}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 pb-16 sm:pb-20 md:pb-24">
        <ScrollReveal>
          <div className="bg-gradient-to-br from-primary to-primary/80 dark:from-cyan-700 dark:to-cyan-900 rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] p-8 sm:p-10 md:p-12 lg:p-16 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 z-0">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px]" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/20 rounded-full blur-[100px]" />
            </div>
            <div className="relative z-10">
              <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
                Sẵn sàng bắt đầu hành trình?
              </h2>
              <p className="text-white/80 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-xl mx-auto">
                Gia nhập cộng đồng 10,000+ lập trình viên đang nâng cấp kỹ năng mỗi ngày tại CodeFit.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/dang-nhap">
                  <Button
                    size="large"
                    className="!px-10 !py-6 !bg-secondary !border-none !text-white !rounded-xl !font-headline !font-bold !text-base !shadow-lg hover:!scale-105 transition-all"
                  >
                    Bắt đầu ngay
                  </Button>
                </Link>
                <a href="https://mail.google.com/mail/?view=cm&fs=1&to=codefitedu@gmail.com" target="_blank" rel="noopener noreferrer">
                  <Button
                    size="large"
                    className="!px-10 !py-6 !bg-white/10 !backdrop-blur-md !text-white !border !border-white/30 !rounded-xl !font-headline !font-bold !text-base hover:!bg-white/20 transition-all"
                  >
                    Liên hệ tư vấn
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </main>
  );
};

export default BangGiaPage;
