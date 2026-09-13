import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, QrCode } from 'lucide-react';
import { useAppStore } from '../store/useStore';
import { Navbar } from '../components/navigation/Navbar';
import { PassCard } from '../components/pass/PassCard';

export const DigitalPassPage: React.FC = () => {
  const { participantId } = useParams<{ participantId: string }>();
  const { participants, event } = useAppStore();

  const participant = participants.find(
    (p) => p.participantId.toUpperCase() === (participantId || '').toUpperCase()
  );

  return (
    <div className="min-h-screen bg-[#F5F4F0] text-[#161616] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 flex flex-col items-center">
        {/* Navigation Breadcrumbs */}
        <div className="w-full max-w-sm mb-6 flex items-center justify-between text-xs">
          <Link
            to="/"
            className="flex items-center gap-1 text-[#6F6F6A] hover:text-[#161616] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Overview
          </Link>

          <Link
            to="/gate"
            className="flex items-center gap-1 font-semibold text-[#E86A00] hover:underline"
          >
            <QrCode className="w-3.5 h-3.5" />
            Gate Scanner
          </Link>
        </div>

        {/* Participant Pass Card */}
        {!participant ? (
          <div className="w-full max-w-sm rounded-card border border-[#DDDCD6] bg-[#FFFFFF] p-8 text-center shadow-card">
            <div className="w-10 h-10 rounded-btn bg-[#FDF0F0] text-[#C43D3D] flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="font-heading text-lg font-bold text-[#161616] mb-1">
              Pass Not Found
            </h2>
            <p className="text-xs text-[#6F6F6A] mb-5 leading-relaxed">
              No registered participant exists with ID:{' '}
              <strong className="font-mono text-[#C43D3D]">{participantId}</strong>.
            </p>
            <div className="flex items-center justify-center gap-2">
              <Link
                to="/register"
                className="px-4 py-2 rounded-btn bg-[#E86A00] text-white font-semibold text-xs shadow-subtle"
              >
                Register Pass
              </Link>
              <Link
                to="/"
                className="px-4 py-2 rounded-btn bg-[#F0EFEA] text-[#161616] text-xs font-medium"
              >
                Back Home
              </Link>
            </div>
          </div>
        ) : (
          <PassCard participant={participant} event={event} showHistory={true} />
        )}
      </main>
    </div>
  );
};
