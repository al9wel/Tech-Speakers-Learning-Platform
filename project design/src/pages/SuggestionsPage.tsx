import { useState } from 'react';
import { Lightbulb, Check, AlertCircle } from 'lucide-react';
import { useData } from '@/context/DataContext';

const suggestionTypes = [
  'اقتراح ميزة',
  'اقتراح محتوى',
  'مشكلة',
  'اقتراح متعلق بالمعلمين',
  'أخرى',
];

export default function SuggestionsPage() {
  const { addSuggestion } = useData();
  const [form, setForm] = useState({
    name: '',
    email: '',
    type: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.type || !form.message) {
      setError('يرجى اختيار نوع الاقتراح وكتابة الرسالة.');
      return;
    }
    setSubmitting(true);
    const ok = await addSuggestion({
      name: form.name || undefined,
      email: form.email || undefined,
      type: form.type,
      message: form.message,
    });
    setSubmitting(false);
    if (ok) {
      setSuccess(true);
      setForm({ name: '', email: '', type: '', message: '' });
      setTimeout(() => setSuccess(false), 5000);
    } else {
      setError('حدث خطأ أثناء إرسال الاقتراح. حاول مرة أخرى.');
    }
  };

  return (
    <div className="container-page py-10 animate-page">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gold/15 flex items-center justify-center mx-auto mb-4">
            <Lightbulb className="w-7 h-7 text-gold-dark" />
          </div>
          <h1 className="font-heading font-extrabold text-3xl text-ink-900">اقتراحاتك تهمنا</h1>
          <p className="text-ink-500 mt-2 max-w-lg mx-auto">
            ساعدنا على تطوير مِداد ليكون أفضل للطلاب. كل اقتراح يصل إلى فريق الإشراف للمراجعة.
          </p>
        </div>

        {success && (
          <div className="card bg-sage-50 border-sage-100 p-4 mb-6 flex items-center gap-3 animate-scale-in">
            <Check className="w-5 h-5 text-sage-dark shrink-0" />
            <p className="text-sm text-sage-dark font-medium">
              شكراً لك! تم إرسال اقتراحك بنجاح.
            </p>
          </div>
        )}

        {error && (
          <div className="card bg-red-50 border-red-100 p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="card p-6 space-y-5">
          <p className="text-sm text-ink-400">
            الاسم والبريد الإلكتروني اختياريان — يمكنك إرسال اقتراحك بشكل مجهول.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">الاسم (اختياري)</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="اسمك"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">البريد (اختياري)</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@example.com"
                className="input-field"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">نوع الاقتراح *</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {suggestionTypes.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm({ ...form, type: t })}
                  className={`px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    form.type === t
                      ? 'border-gold bg-gold/10 text-gold-dark'
                      : 'border-ink-200 bg-white text-ink-600 hover:border-ink-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">الرسالة *</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="اكتب اقتراحك أو مشكلتك هنا..."
              rows={5}
              className="input-field resize-none"
            />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'جاري الإرسال...' : 'إرسال الاقتراح'}
          </button>
        </form>
      </div>
    </div>
  );
}
