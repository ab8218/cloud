import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, onSnapshot, collection, addDoc, serverTimestamp, query, orderBy, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { 
  ChevronLeft, Plus, Trash2, Utensils, Car, Home, ShoppingBag, Clapperboard, MoreHorizontal,
  TrendingUp, PieChart as PieIcon, List as ListIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { format } from 'date-fns';

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  payerId: string;
}

const CATEGORIES = [
  { name: 'Food', label: '餐飲飲食', icon: Utensils, color: '#FF6B6B' },
  { name: 'Transport', label: '交通接駁', icon: Car, color: '#4DABF7' },
  { name: 'Housing', label: '住宿飯店', icon: Home, color: '#51CF66' },
  { name: 'Shopping', label: '購物血拼', icon: ShoppingBag, color: '#FCC419' },
  { name: 'Entertainment', label: '娛樂玩樂', icon: Clapperboard, color: '#BE4BDB' },
  { name: 'Other', label: '其他支出', icon: MoreHorizontal, color: '#ADB5BD' },
];

export const TripDetails: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<any>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [view, setView] = useState<'list' | 'stats'>('list');
  const [newExpense, setNewExpense] = useState({ 
    amount: '', 
    category: 'Food', 
    description: '', 
    date: format(new Date(), 'yyyy-MM-dd') 
  });

  useEffect(() => {
    if (!id || !user) return;

    const unsubTrip = onSnapshot(doc(db, 'trips', id), (doc) => {
      if (doc.exists()) {
        setTrip({ id: doc.id, ...doc.data() });
      } else {
        navigate('/');
      }
    });

    const q = query(
      collection(db, 'trips', id, 'expenses'),
      orderBy('date', 'desc'),
      orderBy('createdAt', 'desc')
    );

    const unsubExpenses = onSnapshot(q, (snapshot) => {
      setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense)));
    }, (error) => {
        handleFirestoreError(error, OperationType.LIST, `trips/${id}/expenses`);
    });

    return () => {
      unsubTrip();
      unsubExpenses();
    };
  }, [id, user, navigate]);

  const totalSpent = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + exp.amount, 0);
  }, [expenses]);

  const statsData = useMemo(() => {
    const grouped = expenses.reduce((acc: any, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});
    return CATEGORIES.map(cat => ({
      name: cat.label,
      value: grouped[cat.name] || 0,
      color: cat.color
    })).filter(d => d.value > 0);
  }, [expenses]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !user) return;

    try {
      await addDoc(collection(db, 'trips', id, 'expenses'), {
        amount: Number(newExpense.amount),
        category: newExpense.category,
        description: newExpense.description,
        date: newExpense.date,
        payerId: user.uid,
        tripId: id, // Added to match security rule requirement
        createdAt: serverTimestamp()
      });
      setShowAddModal(false);
      setNewExpense({ amount: '', category: 'Food', description: '', date: format(new Date(), 'yyyy-MM-dd') });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `trips/${id}/expenses`);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm('確定要刪除這筆支出嗎？')) return;
    try {
      await deleteDoc(doc(db, 'trips', id!, 'expenses', expenseId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `trips/${id}/expenses/${expenseId}`);
    }
  };

  if (!trip) return null;

  return (
    <div className="space-y-16">
      {/* Header with Massive Typography */}
      <header className="flex flex-col lg:flex-row justify-between items-start gap-12">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-4 mb-6 cursor-pointer group" onClick={() => navigate('/')}>
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] uppercase font-black tracking-widest opacity-30 group-hover:opacity-100">Return to Voyages</span>
          </div>
          
          <h2 className="text-[14vw] lg:text-[clamp(80px,10vw,140px)] font-black leading-[0.85] tracking-tighter uppercase break-words">
            {trip.name.split(' ')[0]}<br/>
            <span className="text-accent">{(totalSpent / 1000).toFixed(1)}k</span>
          </h2>
          
          <p className="text-sm mt-8 leading-relaxed opacity-60 font-medium max-w-md">
            Comprehensive financial logging in {trip.currency} for your professional journey in {trip.destination}.
          </p>
        </div>

        <div className="w-full lg:w-80 space-y-6 shrink-0">
          <div className="border-2 border-ink p-8">
            <p className="text-[10px] uppercase font-bold opacity-30 mb-2 tracking-widest">Budget Status</p>
            <div className="flex justify-between items-end mb-4">
               <div>
                 <p className="text-3xl font-black italic">{(trip.budget - totalSpent).toLocaleString()}</p>
                 <p className="text-[9px] font-mono opacity-40 uppercase tracking-widest leading-none">Remaining {trip.currency}</p>
               </div>
               <div className="text-right">
                 <p className="text-sm font-bold">{Math.round((totalSpent / trip.budget) * 100)}%</p>
                 <p className="text-[9px] font-mono opacity-40 uppercase tracking-widest leading-none">Burn Rate</p>
               </div>
            </div>
            <div className="h-2 bg-ink/5 relative">
               <div 
                 className={`h-full transition-all duration-1000 ${trip.budget - totalSpent < 0 ? 'bg-red-500' : 'bg-ink'}`}
                 style={{ width: `${Math.min(100, (totalSpent / trip.budget) * 100)}%` }}
               />
            </div>
          </div>

          <button 
            onClick={() => setShowAddModal(true)}
            className="w-full bg-ink text-paper py-6 font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-accent transition-all active:scale-[0.98]"
          >
            <Plus size={18} />
            Add Record
          </button>
        </div>
      </header>

      {/* Navigation and Stats Toggle */}
      <div className="border-b-2 border-ink pb-4 flex justify-between items-end">
        <div className="flex gap-10">
          <button 
            onClick={() => setView('list')}
            className={`text-xs font-black uppercase tracking-[0.2em] transition-all relative ${view === 'list' ? 'text-ink' : 'text-ink/20 hover:text-ink'}`}
          >
            Records
            {view === 'list' && <motion.div layoutId="underline" className="absolute -bottom-[18px] left-0 right-0 h-1 bg-ink" />}
          </button>
          <button 
            onClick={() => setView('stats')}
            className={`text-xs font-black uppercase tracking-[0.2em] transition-all relative ${view === 'stats' ? 'text-ink' : 'text-ink/20 hover:text-ink'}`}
          >
            Analysis
            {view === 'stats' && <motion.div layoutId="underline" className="absolute -bottom-[18px] left-0 right-0 h-1 bg-ink" />}
          </button>
        </div>
      </div>

      {view === 'list' ? (
        <section className="min-h-[400px]">
          <div className="grid grid-cols-12 border-b border-ink/40 pb-3 mb-1 text-[10px] uppercase font-black tracking-widest opacity-40 px-4">
            <div className="col-span-6 md:col-span-1">Date</div>
            <div className="col-span-6 md:col-span-5">Identity / Purpose</div>
            <div className="hidden md:block col-span-3">Category</div>
            <div className="col-span-12 md:col-span-3 text-right">Magnitude ({trip.currency})</div>
          </div>

          <div className="divide-y divide-ink/10">
            <AnimatePresence initial={false}>
              {expenses.length === 0 ? (
                <div className="py-24 text-center">
                  <p className="text-3xl font-serif italic opacity-10">Empty database state.</p>
                </div>
              ) : (
                expenses.map((exp, idx) => {
                  const category = CATEGORIES.find(c => c.name === exp.category) || CATEGORIES[5];
                  return (
                    <motion.div
                      key={exp.id}
                      initial={{ opacity: 0, scaleY: 0 }}
                      animate={{ opacity: 1, scaleY: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="grid grid-cols-12 py-8 items-center px-4 hover:bg-ink group hover:text-paper transition-all relative"
                    >
                      <div className="col-span-6 md:col-span-1 text-[11px] font-mono opacity-50 group-hover:opacity-100 italic">
                        {idx + 1} //
                      </div>
                      <div className="col-span-12 md:col-span-5 md:order-none order-1">
                        <h4 className="font-bold text-xl uppercase tracking-tight group-hover:translate-x-1 transition-transform">
                          {exp.description || category.label}
                        </h4>
                        <p className="text-[10px] font-mono opacity-30 group-hover:opacity-50 mt-1 uppercase tracking-tighter">{exp.date}</p>
                      </div>
                      <div className="hidden md:block col-span-3 text-xs italic font-serif opacity-60 group-hover:opacity-100">
                        {category.label}
                      </div>
                      <div className="col-span-6 md:col-span-3 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <p className="font-black text-2xl tracking-tighter leading-none">{exp.amount.toLocaleString()}</p>
                          <button 
                            onClick={() => handleDeleteExpense(exp.id)}
                            className="text-red-500/20 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                             <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </section>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:items-center py-10">
          <div className="col-span-12 lg:col-span-7 h-[450px]">
            {statsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={110}
                    outerRadius={160}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {statsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center border-2 border-dashed border-ink/10 rounded-full aspect-square max-w-[400px] mx-auto">
                <p className="text-xs font-mono uppercase opacity-30">No categorical data</p>
              </div>
            )}
          </div>
          
          <div className="col-span-12 lg:col-span-5 space-y-10">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mb-8 border-b border-ink/10 pb-4">
                Categorical Distribution
              </h3>
              <div className="space-y-6">
                {statsData.map(stat => (
                  <div key={stat.name} className="flex items-center gap-4 group">
                    <div className="w-4 h-4" style={{ backgroundColor: stat.color }} />
                    <span className="flex-1 text-sm font-black uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">{stat.name}</span>
                    <div className="text-right">
                      <p className="text-lg font-black leading-none">{stat.value.toLocaleString()}</p>
                      <p className="text-[9px] font-mono opacity-30 uppercase tracking-tighter">{((stat.value / totalSpent) * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 bg-paper border border-ink/10 italic font-serif text-ink/40">
              \"The digital ledger prioritizes categorical integrity over standard fiscal aesthetics.\"
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-sm bg-ink/40">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-paper w-full max-w-xl p-12 border-4 border-ink shadow-[20px_20px_0px_0px_rgba(0,0,0,0.1)] relative"
          >
            <div className="flex items-center gap-4 mb-10">
              <span className="text-xs font-mono opacity-30 italic">UPDATE // FISCAL_ENTITY</span>
              <div className="h-px flex-1 bg-ink/10" />
            </div>

            <h3 className="text-4xl font-black tracking-tighter uppercase mb-2">Log Expense</h3>
            <p className="text-xs font-bold opacity-30 uppercase tracking-widest mb-10">Record magnitude and intent.</p>
            
            <form onSubmit={handleAddExpense} className="space-y-8">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 mb-3">Amount ({trip.currency})</label>
                <input 
                  required
                  type="number"
                  value={newExpense.amount}
                  onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                  className="w-full bg-paper border-2 border-ink px-6 py-6 font-black text-5xl tracking-tighter focus:bg-ink focus:text-paper outline-none transition-all placeholder:opacity-10"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 mb-3">Contextual Description</label>
                <input 
                  value={newExpense.description}
                  onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                  placeholder="PURCHASE IDENTIFIER"
                  className="w-full bg-paper border-2 border-ink px-6 py-4 font-bold uppercase tracking-widest focus:bg-ink focus:text-paper outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 mb-4">Functional Category</label>
                <div className="grid grid-cols-3 gap-3">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => setNewExpense({...newExpense, category: cat.name})}
                      className={`py-4 border-2 font-black text-[9px] uppercase tracking-widest transition-all ${newExpense.category === cat.name ? 'bg-ink text-paper border-ink' : 'bg-paper text-ink border-ink/10 hover:border-ink'}`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-5 font-black text-xs uppercase tracking-[0.2em] bg-ink/5 hover:bg-ink/10 transition-colors"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-6 py-5 font-black text-xs uppercase tracking-[0.2em] bg-ink text-paper hover:bg-accent transition-colors"
                >
                  Commit Data
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
