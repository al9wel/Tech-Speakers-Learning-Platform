import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User as UserIcon, BookOpen, HelpCircle, FileText } from 'lucide-react';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  isPlaceholder?: boolean;
};

const quickPrompts = [
  { icon: BookOpen, text: 'اشرح لي قانون نيوتن الثاني بطريقة بسيطة' },
  { icon: HelpCircle, text: 'اختبرني في درس الانقسام المتساوي' },
  { icon: FileText, text: 'لخّص لي قوانين الاشتقاق' },
];

const sampleResponses: Record<string, string> = {
  'نيوتن': 'قانون نيوتن الثاني ينص على أن القوة المؤثرة على جسم تساوي حاصل ضرب كتلته في تسارعه: **F = m × a**.\n\nبكلمات أبسط: كلما زادت الكتلة احتجنا لقوة أكبر لتسريعها، وكلما زادت القوة زاد التسارع.\n\nمثال: كرة كتلتها 2 كجم وتسارعها 3 م/ث²، فإن القوة = 2 × 3 = 6 نيوتن.\n\n*ملاحظة: هذه إجابة تجريبية من نموذج توضيحي. سيتم ربط المساعد بنموذج ذكاء اصطناعي حقيقي لاحقاً ليكون مرتبطاً بالمحتوى التعليمي المعتمد على المنصة.*',
  'انقسام': 'سؤال جيد! إليك سؤالين للتمرين على درس الانقسام المتساوي:\n\n**1.** ما عدد الكروموسومات في الخلية الناتجة إذا كانت الخلية الأم تحتوي على 46 كروموسوماً؟\n\n**2.** ما الفرق الرئيسي بين الطور الاستوائي والطور التماثلي في الانقسام المتساوي؟\n\n*ملاحظة: هذه أسئلة تجريبية. سيتم ربط المساعد بنموذج ذكاء اصطناعي حقيقي لتوليد أسئلة مبنية على المحتوى المعتمد.*',
  'اشتقاق': 'إليك ملخص قوانين الاشتقاق الأساسية:\n\n• قاعدة القوة: (xⁿ)ʹ = n × xⁿ⁻¹\n• قاعدة المجموع: (f + g)ʹ = fʹ + gʹ\n• قاعدة الضرب: (f × g)ʹ = fʹ × g + f × gʹ\n• قاعدة القسمة: (f/g)ʹ = (fʹg - fgʹ) / g²\n• الاشتقاق الضمني للدوال المركبة.\n\n*ملاحظة: هذا ملخص تجريبي. سيتم ربط المساعد بنموذج ذكاء اصطناعي حقيقي لاحقاً.*',
};

const defaultResponse = 'شكراً لسؤالك! مساعد مِداد مصمم لمساعدتك في:\n\n• شرح المفاهيم التعليمية ببساطة\n• تلخيص الدروس\n• توليد أسئلة تمارين\n• مقارنة المفاهيم\n\nحالياً يعمل المساعد في الوضع التجريبي. سيتم ربطه بنموذج ذكاء اصطناعي حقيقي لاحقاً، بحيث يكون مرتبطاً بالمحتوى التعليمي المعتمد على المنصة بدلاً من إعطاء إجابات مفتوحة.\n\nجرّب أحد الاقتراحات أدناه لرؤية كيف سيعمل.';

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'مرحباً! أنا مساعد مِداد 🤖\n\nيمكنني مساعدتك في فهم الدروس، تلخيص المحتوى، وتوليد أسئلة تمارين. جرّب أحد الاقتراحات أدناه أو اكتب سؤالك.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const getResponse = (query: string): string => {
    const lower = query.toLowerCase();
    for (const key of Object.keys(sampleResponses)) {
      if (query.includes(key) || lower.includes(key)) return sampleResponses[key];
    }
    return defaultResponse;
  };

  const handleSend = (text?: string) => {
    const content = (text || input).trim();
    if (!content) return;

    const userMsg: Message = { id: `u${Date.now()}`, role: 'user', text: content };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = getResponse(content);
      setMessages((prev) => [...prev, { id: `a${Date.now()}`, role: 'assistant', text: response }]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="container-page py-8 animate-page">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-ink-700 flex items-center justify-center text-white">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-2xl text-ink-900 flex items-center gap-2">
              مساعد مِداد
              <Sparkles className="w-5 h-5 text-gold" />
            </h1>
            <p className="text-sm text-ink-500">مساعد ذكي للإجابة على أسئلتك التعليمية</p>
          </div>
        </div>

        {/* Info banner */}
        <div className="card bg-gold/5 border-gold/20 p-3 mb-4 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-gold-dark shrink-0 mt-0.5" />
          <p className="text-xs text-ink-600 leading-relaxed">
            مساعد مِداد يعمل حالياً في الوضع التجريبي. سيتم ربطه لاحقاً بنموذج ذكاء اصطناعي حقيقي
            مرتبط بالمحتوى التعليمي المعتمد على المنصة.
          </p>
        </div>

        {/* Chat */}
        <div className="card flex flex-col h-[55vh] min-h-[400px]">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-ink-100 text-ink-700' : 'bg-ink-700 text-white'
                }`}>
                  {msg.role === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-ink-700 text-white rounded-tr-sm'
                    : 'bg-ink-50 text-ink-800 rounded-tl-sm'
                }`}>
                  {msg.text.split('\n').map((line, i) => (
                    <p key={i} className={line.startsWith('•') ? 'pr-2' : ''}>
                      {line || '\u00A0'}
                    </p>
                  ))}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-ink-700 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-ink-50 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-ink-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-ink-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-ink-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompts */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {quickPrompts.map((p) => (
                <button
                  key={p.text}
                  onClick={() => handleSend(p.text)}
                  className="chip bg-white border border-ink-200 text-ink-600 text-xs hover:border-gold hover:text-gold-dark transition-all"
                >
                  <p.icon className="w-3.5 h-3.5" />
                  {p.text}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-ink-100 p-3">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="اكتب سؤالك..."
                className="input-field"
                disabled={isTyping}
              />
              <button type="submit" disabled={!input.trim() || isTyping} className="btn-primary shrink-0">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
