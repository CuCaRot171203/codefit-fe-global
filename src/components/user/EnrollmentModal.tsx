import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Check, Shield, Award, Headphones, ArrowRight, QrCode, KeyRound, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: {
    id: string;
    title: string;
    description: string;
    price: number;
    originalPrice: number;
  };
  onCheckout?: () => void;
}

type PaymentMethod = 'qr' | 'direct' | null;

const benefits = [
  { icon: Check, text: 'Truy cập trọn đời' },
  { icon: Award, text: 'Chứng chỉ hoàn thành' },
  { icon: Headphones, text: 'Hỗ trợ từ Mentor' },
];

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
};

export const EnrollmentModal = ({
  isOpen,
  onClose,
  course,
}: EnrollmentModalProps) => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [isLoading, setIsLoading] = useState(false);

  const discount = course.originalPrice > 0
    ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
    : 0;

  const handlePayment = () => {
    setIsLoading(true);
    
    if (paymentMethod === 'qr') {
      // Navigate to QR payment screen
      navigate(`/user/payment/qr/${course.id}`);
      onClose();
    } else if (paymentMethod === 'direct') {
      // Navigate to activate code screen
      navigate(`/user/payment/activate/${course.id}`);
      onClose();
    }
    
    setIsLoading(false);
  };

  const handleClose = () => {
    setPaymentMethod(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-primary transition-colors duration-200 z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Left Side: Visual Anchor */}
          <div className="hidden md:flex md:w-1/3 bg-gradient-to-br from-[#00263f] to-[#0b3c5d] relative">
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <div className="absolute top-10 -left-10 w-40 h-40 border border-white/20 rounded-full" />
              <div className="absolute bottom-20 right-5 w-20 h-20 bg-orange-300/20 rounded-full blur-xl" />
            </div>
            <div className="p-8 h-full flex flex-col justify-end relative z-10">
              <div className="text-white/40 font-mono text-5xl mb-4">{'>'}</div>
              <div className="text-white font-headline font-bold text-xl leading-tight">
                Master your craft.
              </div>
            </div>
          </div>

          {/* Right Side: Content */}
          <div className="flex-1 p-8 md:p-12">
            {!paymentMethod ? (
              // Step 1: Choose payment method
              <>
                <div className="mb-8">
                  <Badge className="bg-secondary-container text-on-secondary-container text-xs font-bold rounded-full mb-4 uppercase tracking-widest">
                    Enrollment
                  </Badge>
                  <h2 className="font-headline text-3xl font-semibold text-primary mb-2">
                    Đăng ký khóa học
                  </h2>
                  <h3 className="text-xl font-bold text-[#0B3C5D] mb-4">
                    {course.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">
                    {course.description}
                  </p>
                </div>

                {/* Benefits Grid */}
                <div className="grid grid-cols-1 gap-4 mb-8">
                  {benefits.map((benefit, index) => {
                    const Icon = benefit.icon;
                    return (
                      <div key={index} className="flex items-center gap-3 text-sm">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-[#00263f]" />
                        </div>
                        <span className="text-slate-700">{benefit.text}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Pricing Section */}
                <div className="pt-6 border-t border-slate-200">
                  <div className="flex items-end justify-between mb-6">
                    <div className="flex flex-col">
                      <span className="text-slate-400 text-sm line-through decoration-red-500/50">
                        {formatPrice(course.originalPrice)}
                      </span>
                      <span className="text-3xl font-headline font-bold text-primary">
                        {formatPrice(course.price)}
                      </span>
                    </div>
                    {discount > 0 && (
                      <Badge className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-1">
                        Ưu đãi -{discount}%
                      </Badge>
                    )}
                  </div>

                  {/* Payment Method Selection */}
                  <div className="space-y-3 mb-6">
                    <p className="text-sm font-medium text-slate-700">Chọn phương thức thanh toán:</p>
                    
                    {/* QR Payment Option */}
                    <button
                      onClick={() => setPaymentMethod('qr')}
                      className="w-full p-4 border-2 border-slate-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-left flex items-center gap-4"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <QrCode className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800">Thanh toán QR</p>
                        <p className="text-sm text-slate-500">Quét mã QR qua PayOS</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-400" />
                    </button>

                    {/* Direct/Activate Code Option */}
                    <button
                      onClick={() => setPaymentMethod('direct')}
                      className="w-full p-4 border-2 border-slate-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-left flex items-center gap-4"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                        <KeyRound className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800">Mã kích hoạt</p>
                        <p className="text-sm text-slate-500">Nhập mã từ quản lý</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                    <Shield className="w-4 h-4" />
                    <span>Thanh toán an toàn qua PayOS</span>
                  </div>
                </div>
              </>
            ) : (
              // Step 2: Confirm payment method
              <>
                <div className="mb-8">
                  <Badge className="bg-secondary-container text-on-secondary-container text-xs font-bold rounded-full mb-4 uppercase tracking-widest">
                    Xác nhận
                  </Badge>
                  <h2 className="font-headline text-3xl font-semibold text-primary mb-2">
                    Xác nhận đăng ký
                  </h2>
                  <h3 className="text-xl font-bold text-[#0B3C5D] mb-4">
                    {course.title}
                  </h3>
                </div>

                {/* Selected Payment Method */}
                <div className="bg-slate-50 rounded-xl p-6 mb-6">
                  <p className="text-sm text-slate-500 mb-3">Phương thức thanh toán:</p>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      paymentMethod === 'qr' 
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                        : 'bg-gradient-to-br from-amber-500 to-orange-600'
                    }`}>
                      {paymentMethod === 'qr' ? (
                        <QrCode className="w-6 h-6 text-white" />
                      ) : (
                        <KeyRound className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">
                        {paymentMethod === 'qr' ? 'Thanh toán QR' : 'Mã kích hoạt'}
                      </p>
                      <p className="text-sm text-slate-500">
                        {paymentMethod === 'qr' 
                          ? 'Quét mã QR qua PayOS để thanh toán' 
                          : 'Nhập mã kích hoạt từ quản lý'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Price Summary */}
                <div className="bg-primary/5 rounded-xl p-6 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-600">Giá gốc</span>
                    <span className="text-slate-400 line-through">
                      {formatPrice(course.originalPrice)}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-600">Giảm giá</span>
                      <span className="text-green-600">-{discount}%</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                    <span className="font-semibold text-slate-800">Thành tiền</span>
                    <span className="text-2xl font-bold text-primary">
                      {paymentMethod === 'direct' ? 'Miễn phí' : formatPrice(course.price)}
                    </span>
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  onClick={handlePayment}
                  disabled={isLoading}
                  className="w-full py-5 bg-orange-400 hover:bg-orange-500 text-white font-headline font-bold text-lg rounded-xl shadow-lg shadow-orange-400/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      {paymentMethod === 'qr' ? 'Tiếp tục thanh toán' : 'Tiếp tục nhập mã'}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>

                {/* Back Button */}
                <button
                  onClick={() => setPaymentMethod(null)}
                  className="w-full mt-4 text-center text-sm text-slate-500 hover:text-primary transition-colors"
                >
                  Quay lại chọn phương thức khác
                </button>

                <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mt-6">
                  <Shield className="w-4 h-4" />
                  <span>Thanh toán an toàn qua PayOS</span>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnrollmentModal;
