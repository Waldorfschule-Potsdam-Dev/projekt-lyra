import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, ArrowLeft, CreditCard, Trash2, Check,
  History, ArrowDownLeft, ArrowUpRight, ShoppingBag,
  Home as HomeIcon, Coffee, Car, Utensils,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  type Card, loadCards, saveCards, useBalance, formatEUR, balanceState
} from '../data';
import { DemoCreditCard, SavedCreditCard } from './CreditCard';
import { BalanceCard } from './BalanceCard';
import { PinSheet } from './PinSheet';
import { Field } from './Field';
import { CollectClueButton } from '../../components/CollectClueButton';
import { useClueStore } from '../../store/clues';

export function HomeScreen() {
  const navigate = useNavigate();
  const [cards, setCards] = useState<Card[]>([]);
  const [pinOpen, setPinOpen] = useState(false);

  useEffect(() => {
    setCards(loadCards());
  }, []);

  const handleDelete = (id: string) => {
    const next = cards.filter((c) => c.id !== id);
    setCards(next);
    saveCards(next);
  };

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fafafa',
        position: 'relative',
      }}
    >
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <h1
          style={{
            margin: 0,
            padding: '20px 20px 4px',
            fontSize: 28,
            fontWeight: 600,
            color: '#202124',
            letterSpacing: -0.3,
          }}
        >
          Deine Karten
        </h1>

        <BalanceCard />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '12px 16px 8px',
          }}
        >
          <div style={{ position: 'relative', width: '100%', maxWidth: 340 }}>
            <img
              src="https://cdn.hackclub.com/019f52cf-3dc8-7168-afe9-0aaf4d641d92/codebrecher-42126258.webp"
              alt=""
              style={{
                width: '100%',
                aspectRatio: '1.586',
                objectFit: 'cover',
                borderRadius: 16,
                boxShadow: '0 10px 24px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.12)',
              }}
            />
            <div style={{ position: 'absolute', top: -10, right: -10, zIndex: 10 }}>
              <CollectClueButton clueId="wallet:ausweis" />
            </div>
          </div>
        </div>

        <div
          style={{
            padding: '4px 20px 12px',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <DemoCreditCard onClick={() => setPinOpen(true)} />
        </div>

        {cards.length === 0 ? null : (
          <div
            style={{
              padding: '0 20px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              alignItems: 'center',
            }}
          >
            {cards.map((card) => (
              <div
                key={card.id}
                style={{
                  width: '100%',
                  maxWidth: 340,
                  position: 'relative',
                }}
              >
                <SavedCreditCard card={card} />
                <button
                  onClick={() => handleDelete(card.id)}
                  aria-label="Karte löschen"
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'rgba(0,0,0,0.35)',
                    border: 'none',
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2,
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          flexShrink: 0,
          padding: '12px 16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          backgroundColor: '#fafafa',
          borderTop: '1px solid #ececec',
        }}
      >
        <button
          onClick={() => navigate('/wallet/history')}
          style={{
            flex: 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '14px 16px',
            backgroundColor: '#fff',
            color: '#0B8043',
            border: '1px solid #c8e6c9',
            borderRadius: 28,
            fontSize: 14,
            fontWeight: 500,
            fontFamily: 'inherit',
            cursor: 'pointer',
          }}
        >
          <History size={18} color="#0B8043" />
          Kontoverlauf
        </button>
        <button
          onClick={() => navigate('/wallet/add')}
          aria-label="Karte hinzufügen"
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            backgroundColor: '#0B8043',
            border: 'none',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 6px 18px rgba(11,128,67,0.35)',
            flexShrink: 0,
          }}
        >
          <Plus size={32} strokeWidth={2.2} />
        </button>
      </div>

      <PinSheet
        open={pinOpen}
        onClose={() => setPinOpen(false)}
        onSuccess={() => {
          setPinOpen(false);
          navigate('/wallet/pay');
        }}
      />
    </div>
  );
}

export function AddCardScreen() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [holder, setHolder] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const canSave = name.trim() && number.replace(/\D/g, '').length >= 4 && holder.trim();

  const handleSave = () => {
    if (!canSave) return;
    const cards = loadCards();
    const next: Card = {
      id: `card_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      name: name.trim(),
      number: number.trim(),
      holder: holder.trim(),
      addedAt: Date.now(),
    };
    cards.push(next);
    saveCards(cards);
    setToast('Karte hinzugefügt');
    window.setTimeout(() => navigate('/wallet'), 700);
  };

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fafafa',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <header
        style={{
          padding: '40px 8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          backgroundColor: '#fff',
          borderBottom: '1px solid #ececec',
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => navigate('/wallet')}
          aria-label="Zurück"
          style={{
            width: 40,
            height: 40,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 4,
          }}
        >
          <ArrowLeft size={24} color="#202124" />
        </button>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 500, color: '#202124' }}>
          Karte hinzufügen
        </h1>
      </header>

      <div
        style={{
          flex: 1,
          padding: '20px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          overflowY: 'auto',
        }}
      >
        <Field
          label="Name der Karte"
          value={name}
          onChange={setName}
          placeholder="z.B. Stadtbank GlobalCard"
        />
        <Field
          label="Kartennummer"
          value={number}
          onChange={setNumber}
          placeholder="1234 5678 9012 3456"
          keyboardType="numeric"
        />
        <Field
          label="Karteninhaber"
          value={holder}
          onChange={setHolder}
          placeholder="Max Mustermann"
          autoCapitalize="words"
        />

        <button
          onClick={handleSave}
          disabled={!canSave}
          style={{
            marginTop: 8,
            padding: '14px 18px',
            backgroundColor: canSave ? '#0B8043' : '#c4c7c5',
            color: '#fff',
            border: 'none',
            borderRadius: 24,
            fontSize: 15,
            fontWeight: 500,
            fontFamily: 'inherit',
            cursor: canSave ? 'pointer' : 'default',
            transition: 'background-color 0.15s',
          }}
        >
          Speichern
        </button>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            style={{
              position: 'absolute',
              left: 16,
              right: 16,
              bottom: 24,
              padding: '14px 18px',
              backgroundColor: 'rgba(28,27,31,0.96)',
              color: '#fff',
              borderRadius: 14,
              textAlign: 'center',
              fontSize: 14,
              boxShadow: '0 6px 18px rgba(0,0,0,0.18)',
              zIndex: 50,
              pointerEvents: 'none',
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function PayScreen() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [, setBalanceState] = useBalance();

  const numeric = Number(amount.replace(',', '.'));
  const recipientDigits = recipient.replace(/\D/g, '');
  const canPay =
    Number.isFinite(numeric) &&
    numeric > 0 &&
    recipientDigits.length >= 4;

  const handlePay = () => {
    if (!canPay) return;
    const formatted = numeric.toFixed(2).replace('.', ',');
    const last4 = recipientDigits.slice(-4);

    setBalanceState({
      giro: balanceState.giro - numeric,
      spar: balanceState.spar,
    });

    if (Math.abs(numeric - 49.99) < 0.01 && recipientDigits === '8877665544') {
      localStorage.setItem('fitness-paid', 'true');
      window.dispatchEvent(new Event('fitness-paid-event'));
    }

    setToast(`${formatted} € an •••• ${last4} gesendet`);
    window.setTimeout(() => navigate('/wallet'), 900);
  };

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fafafa',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <header
        style={{
          padding: '40px 8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          backgroundColor: '#fff',
          borderBottom: '1px solid #ececec',
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => navigate('/wallet')}
          aria-label="Zurück"
          style={{
            width: 40,
            height: 40,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 4,
          }}
        >
          <ArrowLeft size={24} color="#202124" />
        </button>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 500, color: '#202124' }}>
          Bezahlen
        </h1>
      </header>

      <div
        style={{
          flex: 1,
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          alignItems: 'center',
        }}
      >
        <div style={{ alignSelf: 'stretch' }}>
          <Field
            label="Betrag in €"
            value={amount}
            onChange={(v) => setAmount(v.replace(/[^\d.,]/g, ''))}
            placeholder="0,00"
            keyboardType="numeric"
          />
        </div>

        <div style={{ alignSelf: 'stretch' }}>
          <Field
            label="Karten- oder Kontonummer des Empfängers"
            value={recipient}
            onChange={(v) => setRecipient(v.replace(/\D/g, '').slice(0, 19))}
            placeholder="1234 5678 9012 3456"
            keyboardType="numeric"
          />
          <div style={{ fontSize: 12, color: '#5f6368', marginTop: 8, paddingLeft: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <em>Hinweis: Börsen-Kontostand aufladen möglich.</em>
          </div>
        </div>

        <div
          style={{
            alignSelf: 'stretch',
            padding: '14px 16px',
            backgroundColor: '#fff',
            borderRadius: 14,
            boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background:
                'linear-gradient(135deg, #1a1f71 0%, #2a52be 55%, #4a7dd1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CreditCard size={20} color="#fff" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#202124' }}>
              GlobalCard • 4242
            </div>
            <div style={{ fontSize: 12, color: '#5f6368', marginTop: 2 }}>
              Daniel Seidt
            </div>
          </div>
        </div>

        <button
          onClick={handlePay}
          disabled={!canPay}
          style={{
            alignSelf: 'stretch',
            marginTop: 8,
            padding: '14px 18px',
            backgroundColor: canPay ? '#0B8043' : '#c4c7c5',
            color: '#fff',
            border: 'none',
            borderRadius: 24,
            fontSize: 15,
            fontWeight: 500,
            fontFamily: 'inherit',
            cursor: canPay ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Check size={18} />
          Zahlung bestätigen
        </button>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            style={{
              position: 'absolute',
              left: 16,
              right: 16,
              bottom: 24,
              padding: '14px 18px',
              backgroundColor: 'rgba(28,27,31,0.96)',
              color: '#fff',
              borderRadius: 14,
              textAlign: 'center',
              fontSize: 14,
              boxShadow: '0 6px 18px rgba(0,0,0,0.18)',
              zIndex: 50,
              pointerEvents: 'none',
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function HistoryScreen() {
  const navigate = useNavigate();

  const transactions = [
    { id: '1', date: 'Heute, 14:30', title: 'Rewe Supermarkt', amount: -42.50, type: 'expense', icon: ShoppingBag },
    { id: '2', date: 'Heute, 09:15', title: 'Café am Markt', amount: -4.80, type: 'expense', icon: Coffee },
    { id: '3', date: 'Gestern', title: 'Gehaltseingang', amount: 3200.00, type: 'income', icon: ArrowDownLeft },
    { id: '4', date: 'Vorgestern', title: 'Tankstelle', amount: -65.20, type: 'expense', icon: Car },
    { id: '5', date: '12. Mai', title: 'Restaurant Zur Linde', amount: -84.00, type: 'expense', icon: Utensils },
    { id: '6', date: '01. Mai', title: 'Miete', amount: -980.00, type: 'expense', icon: HomeIcon },
  ];

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fafafa',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <header
        style={{
          padding: '40px 8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          backgroundColor: '#fff',
          borderBottom: '1px solid #ececec',
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => navigate('/wallet')}
          aria-label="Zurück"
          style={{
            width: 40,
            height: 40,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 4,
          }}
        >
          <ArrowLeft size={24} color="#202124" />
        </button>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 500, color: '#202124' }}>
          Kontoverlauf
        </h1>
      </header>

      <div
        style={{
          flex: 1,
          padding: '16px 0',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {transactions.map((t) => {
          const Icon = t.icon;
          return (
            <div
              key={t.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px 20px',
                borderBottom: '1px solid #ececec',
                backgroundColor: '#fff',
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: t.type === 'income' ? '#e6f4ea' : '#f8f9fa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16,
                  flexShrink: 0,
                }}
              >
                <Icon size={20} color={t.type === 'income' ? '#137333' : '#5f6368'} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 500, color: '#202124', marginBottom: 2 }}>
                  {t.title}
                </div>
                <div style={{ fontSize: 13, color: '#5f6368' }}>
                  {t.date}
                </div>
              </div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: t.type === 'income' ? '#137333' : '#202124',
                  marginLeft: 16,
                }}
              >
                {t.type === 'income' ? '+' : ''}{formatEUR(t.amount)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
