import React, { useState, useEffect } from 'react';
import offerService from '../../services/offerService';
import liveDataStore from '../../services/liveDataStore';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import { Calendar, CheckCircle2, DollarSign, MessageSquare, Send, Clock, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const BuyerOffers = () => {
  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState([]);
  const [openChatOfferId, setOpenChatOfferId] = useState(null);
  const [chatInput, setChatInput] = useState('');

  // Payment Modal
  const [paymentModalOffer, setPaymentModalOffer] = useState(null);
  const [payoutAmount, setPayoutAmount] = useState(32124);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await offerService.getOffers('all');
      setOffers(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
    const unsubscribe = liveDataStore.subscribe(() => {
      fetchOffers();
    });
    return () => unsubscribe();
  }, []);

  const handleAcceptByBuyer = (offerId) => {
    liveDataStore.acceptOfferByBuyer(offerId);
    fetchOffers();
  };

  const handleCompleteAndPay = () => {
    if (!paymentModalOffer) return;
    liveDataStore.completeOfferAndPay(paymentModalOffer.id, Number(payoutAmount));
    setPaymentModalOffer(null);
    fetchOffers();
  };

  const handleSendMessage = (offerId) => {
    if (!chatInput.trim()) return;
    liveDataStore.addOfferMessage(offerId, 'Buyer (Procurement)', 'buyer', chatInput.trim());
    setChatInput('');
    fetchOffers();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Buyer Procurement Bids & Orders</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Review incoming farmer crop sales requests, accept bids, negotiate online, and release Escrow payment upon delivery.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching purchase offers..." />
      ) : offers.length === 0 ? (
        <EmptyState title="No active buyer offers" description="You have not received or submitted any purchase bids yet." />
      ) : (
        <div className="space-y-4">
          {offers.map((offer) => {
            const isChatOpen = openChatOfferId === offer.id;
            const isAccepted = offer.status?.includes('Accepted') || offer.status?.includes('Logistics') || offer.status?.includes('Transit');
            const isCompleted = offer.status === 'Completed';

            return (
              <div key={offer.id} className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-bold text-slate-900 text-base">Farmer: {offer.farmerName}</h4>
                      <StatusBadge status={offer.status} />
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium mt-1">
                      <span>Crop: <strong className="text-slate-900">{offer.crop}</strong></span>
                      <span>Quantity: <strong className="text-slate-900">{offer.quantity}</strong></span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {offer.createdDate}
                      </span>
                    </div>
                    {offer.notes && <p className="text-xs text-slate-600 font-medium mt-2 italic bg-slate-50 p-2 rounded-xl border border-slate-100">{offer.notes}</p>}
                  </div>

                  <div className="flex flex-col sm:items-end gap-3 shrink-0">
                    <div>
                      <span className="text-[11px] text-slate-500 block font-bold">Offered Rate</span>
                      <span className="text-xl font-black text-emerald-700">
                        {formatCurrency(offer.offeredPricePerQuintal)}
                        <span className="text-xs font-normal text-slate-400">/q</span>
                      </span>
                      <span className="text-xs text-slate-500 block font-medium">Total: {formatCurrency(offer.totalValue)}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setOpenChatOfferId(isChatOpen ? null : offer.id)}
                        className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Chat ({offer.discussion?.length || 0})</span>
                      </button>

                      {offer.status === 'Sent' && (
                        <button
                          onClick={() => handleAcceptByBuyer(offer.id)}
                          className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-2xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Accept Request</span>
                        </button>
                      )}

                      {isAccepted && (
                        <button
                          onClick={() => {
                            setPaymentModalOffer(offer);
                            setPayoutAmount(offer.totalValue || 32124);
                          }}
                          className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>Release Payment & Mark Completed</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2-Day Logistics Formalities Notice */}
                {isAccepted && (
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl flex items-center justify-between text-xs text-amber-900 font-medium">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span><strong>2-Day Transport Window:</strong> Request accepted. Awaiting farmer transport dispatch & crop quality inspection before releasing payment.</span>
                    </div>
                  </div>
                )}

                {/* Completed Payment Sync Notice */}
                {isCompleted && (
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Payment Completed! ₹{offer.paidAmount?.toLocaleString('en-IN') || offer.totalValue?.toLocaleString('en-IN')} released to farmer. Order marked completed.</span>
                  </div>
                )}

                {/* Live Chat Discussion Drawer */}
                {isChatOpen && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 pt-3">
                    <div className="text-xs font-bold text-slate-700 flex items-center justify-between border-b border-slate-200 pb-2">
                      <span>Online Negotiation Discussion with {offer.farmerName}</span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">Real-time Connected</span>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {(offer.discussion || []).map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-2.5 rounded-xl text-xs max-w-md ${
                            msg.senderRole === 'buyer'
                              ? 'bg-emerald-600 text-white ml-auto text-right'
                              : 'bg-white border border-slate-200 text-slate-800 mr-auto'
                          }`}
                        >
                          <div className="text-[10px] font-bold opacity-80 mb-0.5">{msg.senderName} ({msg.timestamp})</div>
                          <p>{msg.text}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(offer.id)}
                        placeholder="Type counter offer or discussion message..."
                        className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-medium"
                      />
                      <button
                        onClick={() => handleSendMessage(offer.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1 transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Payment Confirmation Modal */}
      {paymentModalOffer && (
        <Modal
          isOpen={!!paymentModalOffer}
          onClose={() => setPaymentModalOffer(null)}
          title={`Release Payment to ${paymentModalOffer.farmerName}`}
        >
          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-xs text-emerald-800 font-medium">
              Confirm Escrow payment release for <strong>{paymentModalOffer.crop}</strong> ({paymentModalOffer.quantity}).
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Total Payout Amount (₹)</label>
              <input
                type="number"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white font-black"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setPaymentModalOffer(null)}
                className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 rounded-xl bg-slate-100 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteAndPay}
                className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-xs"
              >
                Confirm Payment & Complete Deal
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default BuyerOffers;
