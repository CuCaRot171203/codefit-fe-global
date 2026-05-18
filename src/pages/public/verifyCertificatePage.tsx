'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { API_ENDPOINTS } from '@/config/api';
import {
  Code,
  CheckCircle,
  Award,
  Loader2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface Certificate {
  id: string;
  userName: string;
  courseTitle: string;
  issuedAt: string;
  certificateUrl: string;
}

const VerifyCertificatePage = () => {
  const { certificateId } = useParams<{ certificateId: string }>();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (certificateId) {
      fetchCertificate();
    }
  }, [certificateId]);

  const fetchCertificate = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.certificates.verify(certificateId!)}`);
      const data = await response.json();
      if (data.success && data.data) {
        setCertificate(data.data);
      } else {
        setError('Không tìm thấy chứng chỉ này.');
      }
    } catch (err) {
      console.error('Error verifying certificate:', err);
      setError('Đã xảy ra lỗi khi xác thực chứng chỉ.');
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-amber-400" />
          <p className="text-slate-400 text-lg">Đang xác thực chứng chỉ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-md w-full mx-4">
          <div className="bg-slate-800 rounded-2xl p-8 text-center border border-slate-700">
            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">
              Không tìm thấy chứng chỉ
            </h1>
            <p className="text-slate-400 mb-6">
              {error}
            </p>
            <p className="text-slate-500 text-sm">
              Mã chứng chỉ: <span className="text-slate-300">{certificateId}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-2xl w-full mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/30">
            <Award className="w-8 h-8 text-slate-900" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Xác thực chứng chỉ CodeFit
          </h1>
          <p className="text-slate-400">
            Chứng chỉ này đã được xác thực thành công
          </p>
        </div>

        {/* Certificate Card */}
        <div className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
          {/* Success Banner */}
          <div className="bg-emerald-500/10 p-4 flex items-center justify-center gap-3 border-b border-emerald-500/20">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-400 font-semibold">
              Chứng chỉ hợp lệ
            </span>
          </div>

          {/* Certificate Content */}
          <div className="p-8">
            {/* Certificate Header */}
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mx-auto mb-4">
                <Code className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-sm font-semibold tracking-widest text-blue-400 uppercase mb-2">
                CodeFit Certification
              </h2>
              <div className="w-24 h-0.5 bg-amber-500 mx-auto mb-6" />
            </div>

            {/* Certificate Title */}
            <div className="text-center mb-8">
              <h3 className="text-2xl font-extrabold text-white mb-2">
                CHỨNG CHỈ HOÀN THÀNH
              </h3>
              <p className="text-slate-400 italic">
                Chứng nhận học viên
              </p>
            </div>

            {/* Student Info */}
            <div className="text-center mb-8">
              <p className="text-sm text-slate-400 mb-2">Được trao tặng cho</p>
              <h4 className="text-3xl font-bold text-white mb-4">
                {certificate?.userName || 'Học viên'}
              </h4>
              <p className="text-slate-400 mb-2">đã hoàn thành khóa học</p>
              <div className="inline-block bg-blue-900/30 px-6 py-3 rounded-xl">
                <p className="text-xl font-bold text-blue-300">
                  {certificate?.courseTitle || 'Khóa học'}
                </p>
              </div>
            </div>

            {/* Certificate Details */}
            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-700">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">
                  Ngày cấp
                </p>
                <p className="text-white font-semibold">
                  {certificate?.issuedAt ? formatDate(certificate.issuedAt) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">
                  Mã chứng chỉ
                </p>
                <p className="text-white font-semibold font-mono text-sm">
                  {certificateId?.substring(0, 8).toUpperCase()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm mb-4">
            Chứng chỉ này được phát hành bởi CodeFit - Nền tảng đào tạo lập trình hàng đầu.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors text-sm"
          >
            Truy cập CodeFit
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default VerifyCertificatePage;
