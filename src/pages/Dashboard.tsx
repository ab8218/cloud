import React, { useEffect, useState } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, Plus, Trash2, ChevronRight, Wallet, Plane } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: any;
  budget: number;
  currency: string;
  ownerId: string;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTrip, setNewTrip] = useState({ name: '', destination: '', budget: 0, currency: 'TWD', startDate: format(new Date(), 'yyyy-MM-dd') });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'trips'),
      where('ownerId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Trip));
      setTrips(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'trips');
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await addDoc(collection(db, 'trips'), {
        ...newTrip,
        ownerId: user.uid,
        participants: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setShowAddModal(false);
      setNewTrip({ name: '', destination: '', budget: 0, currency: 'TWD', startDate: format(new Date(), 'yyyy-MM-dd') });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'trips');
    }
  };

  const handleDeleteTrip = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('確定要刪除這趟旅行嗎？所有帳務資料也將被刪除。')) return;

    try {
      await deleteDoc(doc(db, 'trips', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `trips/${id}`);
    }
  };

  return (
    <div className="space-y-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-xs font-mono opacity-30 italic">OVERVIEW // LEDGER_SYS</span>
            <div className="h-px w-24 bg-ink/10" />
          </div>
          <h2 className="text-6xl font-black tracking-tighter uppercase leading-none">Voyages</h2>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="border-2 border-ink px-10 py-4 font-black text-xs uppercase tracking-[0.3em] hover:bg-ink hover:text-paper transition-all active:scale-95"
        >
          Add New Trip +
        </button>
      </div>

      {loading ? (
        <div className="space-y-8 animate-pulse">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-ink/5 border-b border-ink/10" />)}
        </div>
      ) : trips.length === 0 ? (
        <div className="py-32 border-y border-ink/10 text-center">
          <p className="text-4xl font-serif italic text-ink/20 font-light">No voyages found in the database.</p>
          <button onClick={() => setShowAddModal(true)} className="mt-8 text-xs font-bold uppercase tracking-widest underline underline-offset-8 decoration-accent/40 hover:decoration-accent transition-all">Initialize First Entry</button>
        </div>
      ) : (
        <div className="divide-y divide-ink/10 border-y border-ink/10">
          <AnimatePresence>
            {trips.map((trip, idx) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => navigate(`/trip/${trip.id}`)}
                className="group flex flex-col md:flex-row md:items-center py-10 gap-6 cursor-pointer hover:bg-ink hover:text-paper transition-all px-4 relative overflow-hidden"
              >
                <div className="w-16 shrink-0">
                  <span className="text-xs font-mono opacity-30 italic group-hover:text-accent group-hover:opacity-100 italic">
                    {(idx + 1).toString().padStart(2, '0')} —
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-4xl font-black tracking-tighter uppercase group-hover:translate-x-2 transition-transform truncate">
                    {trip.name}
                  </h3>
                  <div className="flex flex-wrap gap-x-6 mt-2 text-[10px] uppercase font-bold tracking-widest opacity-40 group-hover:opacity-100 group-hover:text-accent transition-colors">
                    <div className="flex items-center gap-2">
                       <MapPin size={10} />
                       <span>{trip.destination}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <Calendar size={10} />
                       <span>{trip.startDate}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-end md:items-center gap-10">
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold opacity-30 group-hover:opacity-60 mb-1 tracking-widest">Budgeted</p>
                    <p className="text-2xl font-serif italic leading-none">{trip.budget.toLocaleString()} <span className="text-[10px] font-sans not-italic font-black opacity-30">{trip.currency}</span></p>
                  </div>
                  <button 
                    onClick={(e) => handleDeleteTrip(trip.id, e)}
                    className="p-4 text-ink/10 hover:text-red-500 group-hover:text-paper/20 hover:group-hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                <div className="absolute left-0 bottom-0 h-1 bg-accent w-0 group-hover:w-full transition-all duration-700" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-sm bg-ink/40">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-paper w-full max-w-xl p-12 border-4 border-ink shadow-[20px_20px_0px_0px_rgba(0,0,0,0.1)] relative"
          >
            <div className="flex items-center gap-4 mb-10">
              <span className="text-xs font-mono opacity-30 italic">INITIALIZE // NEW_RECORD</span>
              <div className="h-px flex-1 bg-ink/10" />
            </div>

            <h3 className="text-4xl font-black tracking-tighter uppercase mb-10">Create Trip</h3>
            
            <form onSubmit={handleAddTrip} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 mb-3 ml-1">Trip Identifier</label>
                  <input 
                    required
                    value={newTrip.name}
                    onChange={e => setNewTrip({...newTrip, name: e.target.value})}
                    placeholder="E.G. TOKYO REVERIE"
                    className="w-full bg-paper border-2 border-ink px-6 py-4 font-bold uppercase tracking-widest focus:bg-ink focus:text-paper outline-none transition-all placeholder:opacity-20"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 mb-3 ml-1">Target Location</label>
                  <input 
                    required
                    value={newTrip.destination}
                    onChange={e => setNewTrip({...newTrip, destination: e.target.value})}
                    placeholder="CITY, COUNTRY"
                    className="w-full bg-paper border-2 border-ink px-6 py-4 font-bold uppercase tracking-widest focus:bg-ink focus:text-paper outline-none transition-all placeholder:opacity-20"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 mb-3 ml-1">Allocated Budget</label>
                  <div className="flex gap-2">
                    <input 
                      type="number"
                      value={newTrip.budget}
                      onChange={e => setNewTrip({...newTrip, budget: Number(e.target.value)})}
                      className="w-full bg-paper border-2 border-ink px-6 py-4 font-bold uppercase tracking-widest focus:bg-ink focus:text-paper outline-none transition-all"
                    />
                    <select 
                      value={newTrip.currency}
                      onChange={e => setNewTrip({...newTrip, currency: e.target.value})}
                      className="bg-paper border-2 border-ink px-4 font-bold outline-none"
                    >
                      <option value="TWD">TWD</option>
                      <option value="JPY">JPY</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 mb-3 ml-1">Timeline Start</label>
                  <input 
                    type="date"
                    value={newTrip.startDate}
                    onChange={e => setNewTrip({...newTrip, startDate: e.target.value})}
                    className="w-full bg-paper border-2 border-ink px-6 py-4 font-bold uppercase tracking-widest focus:bg-ink focus:text-paper outline-none transition-all"
                  />
                </div>
              </div>
              
              <div className="flex gap-4 pt-6">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-5 font-black text-xs uppercase tracking-[0.2em] bg-ink/5 hover:bg-ink/10 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-6 py-5 font-black text-xs uppercase tracking-[0.2em] bg-ink text-paper hover:bg-accent transition-colors"
                >
                  Confirm / Commit
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
