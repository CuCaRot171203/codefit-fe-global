'use client';

import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { RootState } from '@/store';
import { certificateService } from '@/services/api';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  Code,
  Verified,
  History,
  Award,
  ArrowRight,
  Copy,
  Check,
  Loader2,
  ArrowLeft,
  Download,
  ExternalLink,
  Smartphone,
  QrCode,
  X,
} from 'lucide-react';
import { notification } from 'antd';
import { createPortal } from 'react-dom';

interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  courseTitle: string;
  userName: string;
  issuedAt: string;
  certificateUrl: string;
}

const CertificateDetailPage = () => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const { certificateId } = useParams<{ certificateId: string }>();

  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [qrCodeUrlPdf, setQrCodeUrlPdf] = useState<string>('');
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const certPreviewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (certificateId) {
      fetchCertificate();
    }
  }, [certificateId]);

  useEffect(() => {
    if (certificateId) {
      generateQRCode();
      generateQRCodeForPdf();
    }
  }, [certificateId]);

  const fetchCertificate = async () => {
    try {
      const response = await certificateService.getMyCertificates();
      if (response.success && response.data) {
        const certs: Certificate[] = Array.isArray(response.data) ? response.data : [];
        const found = certs.find(c => c.id === certificateId);
        if (found) {
          setCertificate(found);
        } else {
          setError('Không tìm thấy chứng chỉ này.');
        }
      } else {
        setError('Không thể tải thông tin chứng chỉ.');
      }
    } catch (err) {
      console.error('Error fetching certificate:', err);
      setError('Đã xảy ra lỗi khi tải chứng chỉ.');
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async () => {
    if (!certificateId) return;
    try {
      const verifyUrl = `${window.location.origin}/verify/${certificateId}`;
      const url = await QRCode.toDataURL(verifyUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: isDark ? '#FFFFFF' : '#0B3C5D',
          light: isDark ? '#1e293b' : '#FFFFFF',
        },
      });
      setQrCodeUrl(url);
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
  };

  const generateQRCodeForPdf = async () => {
    if (!certificateId) return;
    try {
      const verifyUrl = `${window.location.origin}/verify/${certificateId}`;
      // Always use light colors for PDF - dark QR on white background
      const url = await QRCode.toDataURL(verifyUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#0B3C5D',
          light: '#FFFFFF',
        },
      });
      setQrCodeUrlPdf(url);
    } catch (err) {
      console.error('Error generating QR code for PDF:', err);
    }
  };

  const getVerifyUrl = () => {
    if (!certificateId) return '';
    return `${window.location.origin}/verify/${certificateId}`;
  };

  const handleCopyLink = () => {
    const verifyUrl = getVerifyUrl();
    navigator.clipboard.writeText(verifyUrl);
    setCopied(true);
    notification.success({
      message: 'Đã copy!',
      description: 'Link xác thực đã được copy vào clipboard.',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCertificatePDF = async () => {
    if (!certificate) return;
    setGeneratingPdf(true);

    try {
      // Wait for fonts to be loaded
      await document.fonts.ready;

      // Find the certificate preview element using ref
      const certPreview = certPreviewRef.current;
      if (!certPreview) {
        throw new Error('Certificate preview not found');
      }

      // Force render any pending updates
      await new Promise(resolve => setTimeout(resolve, 100));

      // Convert HTML to canvas using html2canvas
      const canvas = await html2canvas(certPreview, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: isDark ? '#0f172a' : '#fffbeb',
        onclone: (clonedDoc) => {
          // Ensure all content is visible in cloned document
          const clonedPreview = clonedDoc.getElementById('certificate-preview');
          if (clonedPreview) {
            clonedPreview.style.overflow = 'visible';
            clonedPreview.style.height = 'auto';
          }
        },
      });

      // Create PDF
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min((pageWidth - 10) / imgWidth, (pageHeight - 10) / imgHeight);
      const finalWidth = imgWidth * ratio;
      const finalHeight = imgHeight * ratio;

      const xOffset = (pageWidth - finalWidth) / 2;
      const yOffset = (pageHeight - finalHeight) / 2;

      pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight);

      pdf.save(`CodeFit_ChungChi_${formatCertificateId(certificate.id)}.pdf`);

      notification.success({
        message: 'Thanh cong!',
        description: 'Chung chi da duoc tai xuong.',
      });
    } catch (err) {
      console.error('Error generating PDF:', err);
      notification.error({
        message: 'Loi!',
        description: 'Khong the tao file PDF. Vui long thu lai.',
      });
    } finally {
      setGeneratingPdf(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatCertificateId = (id: string) => {
    const parts = id.split('-');
    if (parts.length >= 5) {
      return `CF-${parts[0].substring(0, 4).toUpperCase()}-${parts[4].substring(0, 4).toUpperCase()}`;
    }
    return `CF-${id.substring(0, 8).toUpperCase()}`;
  };

  const verifyUrl = getVerifyUrl();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className={cn('w-8 h-8 animate-spin', isDark ? 'text-amber-400' : 'text-amber-600')} />
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Award className={cn('w-16 h-16 mx-auto mb-4 opacity-50', isDark ? 'text-slate-500' : 'text-slate-400')} />
          <h2 className={cn('text-xl font-bold mb-2', isDark ? 'text-white' : 'text-slate-900')}>
            {error || 'Chứng chỉ không tồn tại'}
          </h2>
          <Button
            onClick={() => navigate('/user/certificates')}
            className={cn(
              'mt-4 font-bold',
              isDark ? 'bg-amber-500 hover:bg-amber-400 text-slate-900' : 'bg-amber-500 hover:bg-amber-600 text-white'
            )}
          >
            Quay lại danh sách chứng chỉ
          </Button>
        </div>
      </div>
    );
  }

  const cert = certificate;

  return (
    <div className={cn('min-h-screen', isDark ? 'bg-slate-900' : 'bg-amber-50/30')}>
      {/* QR Modal - Custom Portal */}
      {qrModalOpen && createPortal(
        <div 
          className={cn(
            'fixed inset-0 z-[1000] flex items-center justify-center p-4',
            isDark ? 'bg-black/80' : 'bg-black/50'
          )}
          onClick={() => setQrModalOpen(false)}
        >
          <div 
            className={cn(
              'w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden',
              isDark ? 'bg-slate-800' : 'bg-white'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 flex gap-6">
              {/* Left Side - QR Code */}
              <div className="flex-shrink-0">
                <div className={cn(
                  'p-4 rounded-2xl flex items-center justify-center',
                  isDark ? 'bg-slate-900' : 'bg-slate-50 border border-slate-200'
                )}>
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48 rounded-xl" />
                  ) : (
                    <Loader2 className={cn('w-12 h-12 animate-spin', isDark ? 'text-amber-400' : 'text-amber-600')} />
                  )}
                </div>
              </div>

              {/* Right Side - Info */}
              <div className="flex-1 flex flex-col justify-center">
                {/* Header */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center',
                        isDark ? 'bg-amber-500/20' : 'bg-amber-100'
                      )}>
                        <QrCode className={cn('w-5 h-5', isDark ? 'text-amber-400' : 'text-amber-600')} />
                      </div>
                      <h3 className={cn(
                        'text-xl font-headline font-bold',
                        isDark ? 'text-white' : 'text-slate-900'
                      )}>
                        Quét để xác thực
                      </h3>
                    </div>
                    <button
                      onClick={() => setQrModalOpen(false)}
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                        isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                      )}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <p className={cn(
                    'text-sm',
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  )}>
                    Sử dụng ứng dụng camera trên điện thoại để quét mã QR bên trái
                  </p>
                </div>

                {/* Certificate Info */}
                <div className={cn(
                  'p-4 rounded-xl mb-4',
                  isDark ? 'bg-slate-700/50' : 'bg-slate-50 border border-slate-200'
                )}>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className={cn('text-xs font-semibold mb-1', isDark ? 'text-slate-400' : 'text-slate-500')}>
                        Học viên
                      </p>
                      <p className={cn('text-sm font-bold', isDark ? 'text-amber-400' : 'text-amber-600')}>
                        {cert.userName || 'Học viên'}
                      </p>
                    </div>
                    <div>
                      <p className={cn('text-xs font-semibold mb-1', isDark ? 'text-slate-400' : 'text-slate-500')}>
                        Khóa học
                      </p>
                      <p className={cn('text-sm font-bold truncate', isDark ? 'text-white' : 'text-slate-900')}>
                        {cert.courseTitle || 'Khóa học CodeFit'}
                      </p>
                    </div>
                    <div>
                      <p className={cn('text-xs font-semibold mb-1', isDark ? 'text-slate-400' : 'text-slate-500')}>
                        Ngày cấp
                      </p>
                      <p className={cn('text-sm font-bold', isDark ? 'text-white' : 'text-slate-900')}>
                        {cert.issuedAt ? formatDate(cert.issuedAt) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className={cn('text-xs font-semibold mb-1', isDark ? 'text-slate-400' : 'text-slate-500')}>
                        Certificate ID
                      </p>
                      <p className={cn('text-sm font-mono font-bold', isDark ? 'text-blue-400' : 'text-blue-600')}>
                        {formatCertificateId(cert.id)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Instructions & Button */}
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'flex-1 p-3 rounded-xl',
                    isDark ? 'bg-blue-900/30 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'
                  )}>
                    <div className="flex items-center gap-2">
                      <Smartphone className={cn('w-4 h-4 flex-shrink-0', isDark ? 'text-blue-400' : 'text-blue-600')} />
                      <p className={cn(
                        'text-xs',
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      )}>
                        Quét QR hoặc nhấn nút bên dưới để mở trang xác thực
                      </p>
                    </div>
                  </div>
                  <a
                    href={verifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'flex-shrink-0 flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-sm transition-all',
                      isDark ? 'bg-amber-500 text-slate-900 hover:bg-amber-400' : 'bg-amber-500 text-white hover:bg-amber-600'
                    )}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Mở trang
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Top Nav */}
      <div className={cn(
        'sticky top-0 z-10 border-b backdrop-blur-md',
        isDark ? 'bg-slate-900/90 border-slate-700' : 'bg-white/90 border-amber-200'
      )}>
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate('/user/certificates')}
            className={cn(
              'flex items-center gap-2 text-sm font-medium transition-colors',
              isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            )}
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </button>
          <span className={cn(
            'text-xs px-2.5 py-1 rounded-full font-medium',
            isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
          )}>
            Chứng chỉ hoàn thành
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Certificate Preview */}
          <div 
            id="certificate-preview" 
            ref={certPreviewRef}
            className={cn(
              'lg:col-span-2 space-y-6 rounded-2xl overflow-hidden',
              isDark ? 'bg-slate-900' : 'bg-amber-50/30'
            )}
            style={{ padding: '0' }}
          >
            <div
              className={cn(
                'rounded-2xl overflow-hidden shadow-2xl',
                isDark
                  ? 'bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800'
                  : 'bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100'
              )}
            >
              {/* Decorative pattern */}
              <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(#0b3c5d 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />

              <div
                className={cn(
                  'relative border-4 rounded-xl p-8 lg:p-12 text-center',
                  isDark
                    ? 'border-amber-500/50 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800'
                    : 'border-amber-300 bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100'
                )}
              >
                {/* Certificate Header */}
                <div className="flex flex-col items-center mb-8">
                  <div
                    className={cn(
                      'w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-2xl',
                      isDark ? 'bg-gradient-to-br from-blue-600 to-blue-800' : 'bg-gradient-to-br from-primary to-blue-700'
                    )}
                  >
                    <Code className="w-10 h-10 text-white" />
                  </div>
                  <h3
                    className={cn(
                      'font-headline font-bold tracking-[0.3em] text-sm uppercase mb-3',
                      isDark ? 'text-amber-400' : 'text-amber-600'
                    )}
                  >
                    CodeFit Certification
                  </h3>
                  <div
                    className={cn(
                      'w-32 h-0.5 rounded-full',
                      isDark ? 'bg-amber-500' : 'bg-amber-400'
                    )}
                  />
                </div>

                {/* Certificate Title */}
                <h2
                  className={cn(
                    'text-3xl lg:text-4xl font-extrabold mb-4',
                    isDark ? 'text-white' : 'text-slate-900'
                  )}
                >
                  CHỨNG CHỈ HOÀN THÀNH
                </h2>
                <p
                  className={cn(
                    'italic text-base mb-6',
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  )}
                >
                  Chứng nhận học viên
                </p>
                <h4
                  className={cn(
                    'text-4xl lg:text-5xl font-headline font-bold mb-8',
                    isDark ? 'text-amber-400' : 'text-amber-600'
                  )}
                >
                  {cert.userName || 'Học viên'}
                </h4>
                <p
                  className={cn(
                    'max-w-lg mx-auto mb-8 leading-relaxed',
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  )}
                >
                  Đã hoàn thành xuất sắc chương trình đào tạo chuyên sâu và đạt
                  được đầy đủ các tiêu chuẩn kỹ thuật yêu cầu trong khóa học:
                </p>

                {/* Course Name */}
                <div
                  className={cn(
                    'py-5 px-10 rounded-xl inline-block mb-10 shadow-lg',
                    isDark
                      ? 'bg-gradient-to-r from-blue-900/50 to-blue-800/50 border border-blue-500/30'
                      : 'bg-gradient-to-r from-primary/10 to-blue-100 border border-amber-200'
                  )}
                >
                  <h5
                    className={cn(
                      'text-2xl font-headline font-bold',
                      isDark ? 'text-blue-300' : 'text-primary'
                    )}
                  >
                    {cert.courseTitle || 'Khóa học CodeFit'}
                  </h5>
                </div>

                {/* Certificate Footer */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end pt-8 border-t border-opacity-20">
                  {/* Issue Date */}
                  <div className="text-left space-y-2">
                    <p className={cn(
                      'text-xs uppercase tracking-widest font-bold',
                      isDark ? 'text-slate-500' : 'text-slate-400'
                    )}>
                      Ngày cấp
                    </p>
                    <p
                      className={cn(
                        'font-headline font-semibold text-lg',
                        isDark ? 'text-white' : 'text-slate-900'
                      )}
                    >
                      {cert.issuedAt ? formatDate(cert.issuedAt) : 'N/A'}
                    </p>
                  </div>

                  {/* QR Code - Clickable */}
                  <div className="flex flex-col items-center space-y-3">
                    <button
                      onClick={() => setQrModalOpen(true)}
                      className={cn(
                        'w-28 h-28 p-2 rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95',
                        isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-white border border-slate-200 hover:bg-slate-50'
                      )}
                    >
                      {qrCodeUrl ? (
                        <img src={qrCodeUrl} alt="QR Code" className="w-full h-full rounded-lg" />
                      ) : (
                        <Loader2 className={cn('w-6 h-6 animate-spin', isDark ? 'text-slate-500' : 'text-slate-400')} />
                      )}
                    </button>
                    <button
                      onClick={() => setQrModalOpen(true)}
                      className={cn(
                        'text-[10px] uppercase tracking-tighter transition-colors',
                        isDark ? 'text-slate-500 hover:text-amber-400' : 'text-slate-400 hover:text-amber-600'
                      )}
                    >
                      Nhấn để phóng to
                    </button>
                  </div>

                  {/* Instructor Signature */}
                  <div className="text-right space-y-2">
                    <div className="h-12 flex items-center justify-end">
                      <span
                        className={cn(
                          'text-3xl italic',
                          isDark ? 'text-blue-300' : 'text-primary opacity-80'
                        )}
                        style={{ fontFamily: 'cursive' }}
                      >
                        CodeFit Team
                      </span>
                    </div>
                    <div className={cn('h-px', isDark ? 'bg-slate-700' : 'bg-slate-200')} />
                    <p className={cn(
                      'text-xs uppercase tracking-widest font-bold',
                      isDark ? 'text-slate-500' : 'text-slate-400'
                    )}>
                      Chữ ký Giảng viên
                    </p>
                  </div>
                </div>
              </div>

              {/* Certificate ID at bottom */}
              <div className={cn(
                'py-4 text-center',
                isDark ? 'bg-slate-900' : 'bg-amber-100/50'
              )}>
                <p className={cn(
                  'text-sm font-mono',
                  isDark ? 'text-slate-500' : 'text-slate-500'
                )}>
                  Certificate ID: {cert.id}
                </p>
              </div>
            </div>
          </div>

          {/* Action Sidebar */}
          <div className="space-y-4">
            {/* Certificate Info Card */}
            <div
              className={cn(
                'p-5 rounded-2xl shadow-lg',
                isDark ? 'bg-slate-800' : 'bg-white border border-amber-200'
              )}
            >
              <h3
                className={cn(
                  'text-lg font-headline font-bold mb-2',
                  isDark ? 'text-white' : 'text-slate-900'
                )}
              >
                Chứng chỉ của bạn
              </h3>
              <p
                className={cn(
                  'text-sm leading-relaxed mb-4',
                  isDark ? 'text-slate-400' : 'text-slate-600'
                )}
              >
                Chứng minh bạn đã hoàn thành xuất sắc khóa học và nắm vững các kỹ năng chuyên môn cần thiết.
              </p>

              {/* Action Buttons - Smaller */}
              <div className="space-y-2">
                <button
                  onClick={handleCopyLink}
                  className={cn(
                    'w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all shadow-md',
                    copied
                      ? 'bg-green-500 text-white'
                      : isDark
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-primary text-white hover:bg-primary/90 shadow-primary/20'
                  )}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Đã copy!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy link xác thực
                    </>
                  )}
                </button>

                <button
                  onClick={downloadCertificatePDF}
                  disabled={generatingPdf}
                  className={cn(
                    'w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all shadow-md',
                    isDark
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20'
                  )}
                >
                  {generatingPdf ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  Tải xuống PDF
                </button>

                <a
                  href={verifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all',
                    isDark
                      ? 'bg-slate-700 text-white hover:bg-slate-600'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  )}
                >
                  <ExternalLink className="w-4 h-4" />
                  Mở trang xác thực
                </a>
              </div>

              {/* Additional Info */}
              <div className="mt-5 pt-4 space-y-3">
                <h4 className={cn(
                  'text-xs font-bold uppercase tracking-widest',
                  isDark ? 'text-slate-500' : 'text-slate-400'
                )}>
                  Thông tin bổ sung
                </h4>

                {/* Verified */}
                <div
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg',
                    isDark ? 'bg-slate-700/50' : 'bg-slate-50'
                  )}
                >
                  <Verified
                    className={cn(
                      'w-4 h-4 flex-shrink-0',
                      isDark ? 'text-amber-400' : 'text-amber-500'
                    )}
                  />
                  <div>
                    <p
                      className={cn(
                        'text-xs font-bold',
                        isDark ? 'text-white' : 'text-slate-900'
                      )}
                    >
                      Xác thực chính thức
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Mã định danh duy nhất trên toàn cầu
                    </p>
                  </div>
                </div>

                {/* Permanent */}
                <div
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg',
                    isDark ? 'bg-slate-700/50' : 'bg-slate-50'
                  )}
                >
                  <History
                    className={cn(
                      'w-4 h-4 flex-shrink-0',
                      isDark ? 'text-amber-400' : 'text-amber-500'
                    )}
                  />
                  <div>
                    <p
                      className={cn(
                        'text-xs font-bold',
                        isDark ? 'text-white' : 'text-slate-900'
                      )}
                    >
                      Hạn vĩnh viễn
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Không bao giờ hết hạn sử dụng
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Public Access Card */}
            <div
              className={cn(
                'p-5 rounded-2xl',
                isDark ? 'bg-gradient-to-br from-blue-900/50 to-slate-800 border border-blue-500/20' : 'bg-gradient-to-br from-blue-50 to-amber-50 border border-blue-200'
              )}
            >
              <h4 className={cn(
                'font-headline font-bold text-sm mb-2',
                isDark ? 'text-blue-300' : 'text-blue-700'
              )}>
                Truy cập công khai
              </h4>
              <p className={cn(
                'text-xs leading-relaxed mb-3',
                isDark ? 'text-slate-400' : 'text-slate-600'
              )}>
                Bất kỳ ai cũng có thể xem chứng chỉ này bằng link bên dưới. Phù hợp để chia sẻ trên LinkedIn hoặc CV.
              </p>
              <div className={cn(
                'flex items-center gap-2 text-xs',
                isDark ? 'text-slate-500' : 'text-slate-400'
              )}>
                <ExternalLink className="w-3 h-3" />
                <span>Desktop & Mobile Web</span>
              </div>
            </div>

            {/* Next Steps card */}
            <div
              className={cn(
                'p-5 rounded-2xl',
                isDark ? 'bg-gradient-to-br from-amber-900/30 to-slate-800' : 'bg-gradient-to-br from-amber-100 to-yellow-50'
              )}
            >
              <Award
                className={cn(
                  'w-7 h-7 mb-3',
                  isDark ? 'text-amber-400' : 'text-amber-500'
                )}
              />
              <h4 className={cn(
                'font-headline font-bold text-base mb-1',
                isDark ? 'text-white' : 'text-slate-900'
              )}>
                Bước tiếp theo?
              </h4>
              <p
                className={cn(
                  'text-sm leading-relaxed mb-4',
                  isDark ? 'text-blue-200' : 'text-slate-600'
                )}
              >
                Bạn đã sẵn sàng để nâng tầm sự nghiệp. Hãy bắt đầu lộ trình Fullstack hoặc tham gia cộng đồng Expert.
              </p>
              <button
                onClick={() => navigate('/user/courses')}
                className={cn(
                  'inline-flex items-center gap-2 font-bold text-sm transition-all',
                  isDark ? 'text-amber-400 hover:text-amber-300' : 'text-amber-600 hover:text-amber-700'
                )}
              >
                Khám phá khóa học tiếp theo
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateDetailPage;
