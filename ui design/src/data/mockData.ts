import type { Subject, ActivityItem, Discussion, SavedLesson, Lesson, Unit } from '@/types';

export const subjects: Subject[] = [
  {
    id: 'mathematics',
    name: 'الرياضيات',
    subtitle: 'الجبر والتفاضل',
    description: 'من أساسيات الجبر إلى التفاضل، يبني هذا المسار المهارات التحليلية اللازمة للرياضيات المتقدمة والعلوم.',
    color: '#2d5f5d',
    colorBg: '#e8f0ee',
    colorBorder: '#c4dcd8',
    icon: 'Sigma',
    units: [
      {
        id: 'math-algebra',
        title: 'الجبر',
        description: 'المعادلات والمتراجحات ولغة المجهولات.',
        lessons: [
          {
            id: 'linear-equations',
            title: 'المعادلات الخطية',
            description: 'فهم وحل المعادلات من الدرجة الأولى.',
            type: 'reading',
            status: 'completed',
            estimatedMinutes: 25,
            content: [
              { type: 'heading', text: 'ما هي المعادلة الخطية؟' },
              { type: 'paragraph', text: 'المعادلة الخطية هي معادلة جبرية يكون فيها كل حد إما ثابتاً أو ناتجاً عن ضرب ثابت في متغير واحد. القوة العليا للمتغر تكون دائماً 1، ولهذا تُسمى معادلات "الدرجة الأولى".' },
              { type: 'paragraph', text: 'الصورة القياسية للمعادلة الخطية بمتغير واحد تُكتب على الصورة ax + b = 0، حيث a و b ثوابت و x هو المتغير. على سبيل المثال، 3x + 6 = 0 معادلة خطية.' },
              { type: 'subheading', text: 'حل المعادلات الخطية' },
              { type: 'paragraph', text: 'لحل معادلة خطية، نهدف إلى عزل المتغير في أحد طرفي المعادلة. يتضمن ذلك استخدام العمليات العكسية لتبسيط الطرفين حتى يصبح المتغير وحده.' },
              { type: 'list', items: [
                'انقل جميع الحدود التي تحتوي على المتغير إلى طرف واحد باستخدام الجمع أو الطرح',
                'انقل جميع الحدود الثابتة إلى الطرف الآخر',
                'قسّم الطرفين على معامل المتغير',
                'تحقّق من الحل بتعويضه في المعادلة الأصلية'
              ]},
              { type: 'callout', variant: 'tip', text: 'تحقّق دائماً من الحل بتعويض القيمة في المعادلة الأصلية. هذا يكشف الأخطاء الحسابية مبكراً.' },
              { type: 'heading', text: 'معادلات بها متغيرات في الطرفين' },
              { type: 'paragraph', text: 'عندما تظهر المتغيرات في طرفي المعادلة، اجمعها أولاً في طرف واحد. مثلاً، لحل 5x - 3 = 2x + 12، اطرح 2x من الطرفين لتحصل على 3x - 3 = 12، ثم أضف 3 للطرفين لتحصل على 3x = 15، وأخيراً اقسم على 3 لتجد x = 5.' },
              { type: 'blockquote', text: 'الرياضيات ليست أرقاماً ومعادلات وحسابات، بل هي فهم. — ويليام بول ثرستون' },
            ],
            keyTerms: [
              { term: 'المعامل', definition: 'العامل العددي في حد يحتوي على متغير (مثل 3 في 3x).' },
              { term: 'العملية العكسية', definition: 'عملية تُلغي عملية أخرى (الجمع يُلغي الطرح، والضرب يُلغي القسمة).' },
              { term: 'الحل', definition: 'قيمة تجعل المعادلة صحيحة عند تعويضها بدلاً من المتغير.' },
            ],
            practiceQuestions: [
              { question: 'حل من أجل x: 4x + 7 = 23', answer: 'اطرح 7: 4x = 16. اقسم على 4: x = 4' },
              { question: 'حل من أجل x: 2(x - 3) = 8', answer: 'افتح الأقواس: 2x - 6 = 8. أضف 6: 2x = 14. اقسم على 2: x = 7' },
            ],
          },
          {
            id: 'quadratic-equations',
            title: 'المعادلات التربيعية',
            description: 'معادلات الدرجة الثانية وطرق حلها.',
            type: 'reading',
            status: 'completed',
            estimatedMinutes: 30,
            content: [
              { type: 'heading', text: 'فهم المعادلات التربيعية' },
              { type: 'paragraph', text: 'المعادلة التربيعية هي معادلة كثيرات حدود من الدرجة الثانية على الصورة ax² + bx + c = 0، حيث a و b و c ثوابت و a ≠ 0. تُسمى حلول المعادلة التربيعية الجذور أو نقاط التقاطع مع محور السينات.' },
              { type: 'subheading', text: 'طرق الحل' },
              { type: 'list', items: [
                'التحليل: عبّر عن المعادلة التربيعية كحاصل ضرب حدين خطيين',
                'إكمال المربع: أعد كتابة المعادلة على صورة رأسية',
                'القانون العام: x = (-b ± √(b² - 4ac)) / 2a',
              ]},
              { type: 'callout', variant: 'info', text: 'المميّز (b² - 4ac) يخبرك بطبيعة الجذور: موجب يعني جذرين حقيقيين، صفر يعني جدراً مكرراً، سالب يعني جذرين مركبين.' },
            ],
          },
          {
            id: 'systems-of-equations',
            title: 'أنظمة المعادلات',
            description: 'حل معادلات متعددة بمجهولات متعددة.',
            type: 'exercise',
            status: 'current',
            estimatedMinutes: 35,
            content: [
              { type: 'heading', text: 'أنظمة المعادلات الخطية' },
              { type: 'paragraph', text: 'نظام المعادلات هو مجموعة من معادلتين أو أكثر تشترك في متغيرات. حل النظام هو مجموعة القيم التي تحقق جميع المعادلات في آن واحد.' },
              { type: 'subheading', text: 'ثلاث طرق' },
              { type: 'list', items: [
                'التعويض: حل معادلة واحدة عن متغير وعوّض في الأخرى',
                'الحذف: اجمع أو اطرح المعادلات لحذف متغير',
                'التمثيل البياني: أوجد نقطة تقاطع بياني المعادلتين',
              ]},
              { type: 'callout', variant: 'tip', text: 'طريقة الحذف غالباً الأسرع عندما تتطابق المعاملات. اضرب إحدى المعادلتين أو كليهما بثوابت لتنشئ معاملات متقابلة، ثم اجمع.' },
            ],
          },
          {
            id: 'inequalities',
            title: 'المتراجحات',
            description: 'العمل مع أكبر من وأصغر من والفترات.',
            type: 'reading',
            status: 'upcoming',
            estimatedMinutes: 20,
            content: [
              { type: 'heading', text: 'المتراجحات الخطية' },
              { type: 'paragraph', text: 'المتراجحة عبارة رياضية تقارن تعبيرين باستخدام رموز المتراجحة: < و > و ≤ و ≥. حل المتراجحات يشبه حل المعادلات، مع اختلاف رئيسي واحد.' },
              { type: 'callout', variant: 'warning', text: 'عند ضرب أو قسمة طرفي المتراجحة على عدد سالب، يجب عكس اتجاه رمز المتراجحة.' },
            ],
          },
          {
            id: 'functions-intro',
            title: 'مقدمة في الدوال',
            description: 'فهم مفهوم الدالة الرياضية.',
            type: 'video',
            status: 'locked',
            estimatedMinutes: 28,
          },
        ],
      },
      {
        id: 'math-calculus',
        title: 'التفاضل',
        description: 'النهايات والمشتقات ورياضيات التغير.',
        lessons: [
          {
            id: 'limits-and-continuity',
            title: 'النهايات والاستمرارية',
            description: 'أساس التفاضل: الاقتراب من القيم.',
            type: 'reading',
            status: 'locked',
            estimatedMinutes: 40,
          },
          {
            id: 'derivatives',
            title: 'المشتقات',
            description: 'معدلات التغير وقاعدة الاشتقاق.',
            type: 'reading',
            status: 'locked',
            estimatedMinutes: 45,
          },
          {
            id: 'integration',
            title: 'التكامل',
            description: 'عكس الاشتقاق والمساحات تحت المنحنيات.',
            type: 'reading',
            status: 'locked',
            estimatedMinutes: 50,
          },
        ],
      },
    ],
  },
  {
    id: 'physics',
    name: 'الفيزياء',
    subtitle: 'الميكانيكا والحركة',
    description: 'دراسة المادة والحركة والطاقة. يغطي هذا المسار الميكانيكا الكلاسيكية، من علم الحركة إلى ديناميكا نيوتن.',
    color: '#b8732e',
    colorBg: '#f5ede0',
    colorBorder: '#e0d0b8',
    icon: 'Atom',
    units: [
      {
        id: 'physics-mechanics',
        title: 'الميكانيكا',
        description: 'دراسة الحركة والقوى المسببة لها.',
        lessons: [
          {
            id: 'motion',
            title: 'الحركة',
            description: 'وصف الحركة: الإزاحة والسرعة والتسارع.',
            type: 'reading',
            status: 'completed',
            estimatedMinutes: 30,
            content: [
              { type: 'heading', text: 'وصف الحركة' },
              { type: 'paragraph', text: 'الحركة هي التغير في موضع جسم مع مرور الزمن. لوصف الحركة بدقة، نستخدم ثلاث كميات أساسية: الإزاحة والسرعة والتسارع.' },
              { type: 'subheading', text: 'الإزاحة والمسافة' },
              { type: 'paragraph', text: 'المسافة هي إجمالي طول المسار المقطوع، بينما الإزاحة هي المسافة المستقيمة من نقطة البداية إلى نقطة النهاية مع الاتجاه. الإزاحة كمية متجهة.' },
              { type: 'callout', variant: 'info', text: 'عداء يكمل دورة 400م في مضمار قطع مسافة 400م لكن إزاحته صفر — ينتهي من حيث بدأ.' },
              { type: 'subheading', text: 'السرعة والتسارع' },
              { type: 'paragraph', text: 'السرعة هي معدل تغير الإزاحة بالنسبة للزمن. التسارع هو معدل تغير السرعة بالنسبة للزمن. كلاهما كميتان متجهتان، أي أنهما تتضمنان الاتجاه.' },
              { type: 'list', items: [
                'متوسط السرعة = الإزاحة الكلية / الزمن الكلي',
                'السرعة اللحظية = السرعة في لحظة محددة',
                'التسارع = تغير السرعة / تغير الزمن',
              ]},
              { type: 'blockquote', text: 'لا شيء في الحياة يُخشى، بل يُفهم فقط. — ماري كوري' },
            ],
            keyTerms: [
              { term: 'الإزاحة', definition: 'التغير في موضع جسم مع الاتجاه. كمية متجهة.' },
              { term: 'السرعة', definition: 'معدل تغير الإزاحة. تُقاس بـ m/s. كمية متجهة.' },
              { term: 'التسارع', definition: 'معدل تغير السرعة. يُقاس بـ m/s². كمية متجهة.' },
            ],
            practiceQuestions: [
              { question: 'سيارة تتسارع من السكون إلى 30 m/s في 6 ثوانٍ. ما تسارعها؟', answer: 'a = Δv/Δt = (30 - 0)/6 = 5 m/s²' },
              { question: 'عداء يقطع 100م شمالاً ثم 50م جنوباً في 30 ثانية. ما متوسط سرعته؟', answer: 'الإزاحة = 50م شمالاً. متوسط السرعة = 50/30 ≈ 1.67 m/s شمالاً' },
            ],
          },
          {
            id: 'newtons-laws',
            title: 'قوانين نيوتن',
            description: 'القوانين الثلاثة التي تحكم الحركة والقوة.',
            type: 'reading',
            status: 'current',
            estimatedMinutes: 35,
            content: [
              { type: 'heading', text: 'قوانين نيوتن الثلاثة للحركة' },
              { type: 'paragraph', text: 'صاغ إسحاق نيوتن ثلاثة قوانين أساسية تصف العلاقة بين الجسم والقوى المؤثرة عليه. تشكّل هذه القوانين أساس الميكانيكا الكلاسيكية.' },
              { type: 'subheading', text: 'القانون الأول — قانون القصور الذاتي' },
              { type: 'paragraph', text: 'الجسم الساكن يبقى ساكناً، والجسم المتحرك يبقى متحركاً بنفس السرعة والاتجاه، ما لم يؤثر عليه قوة غير متوازنة. يُسمى هذا الميل لمقاومة التغير في الحركة بالقصور الذاتي.' },
              { type: 'callout', variant: 'tip', text: 'فكّر في كتاب على طاولة. يبقى هناك لأنه لا توجد قوة محصلة. ادفعه فيتحرك — هذا هو القانون الأول.' },
              { type: 'subheading', text: 'القانون الثاني — F = ma' },
              { type: 'paragraph', text: 'تسارع الجسم يتناسب طردياً مع القوة المحصلة المؤثرة عليه وعكسياً مع كتلته. الصيغة هي F = ma، حيث F القوة بالنيوتن، m الكتلة بالكيلوجرام، و a التسارع بـ m/s².' },
              { type: 'subheading', text: 'القانون الثالث — الفعل ورد الفعل' },
              { type: 'paragraph', text: 'لكل فعل رد فعل مساوٍ له في المقدار ومعاكس في الاتجاه. القوى تأتي دائماً في أزواج. عندما تدفع جداراً، يدفعك الجدار بقوة مساوية.' },
              { type: 'blockquote', text: 'لو رأيت أبعد فذلك لأنني أقف على أكتاف عمالقة. — إسحاق نيوتن' },
            ],
            keyTerms: [
              { term: 'القوة', definition: 'دفع أو سحب يؤثر على جسم. تُقاس بالنيوتن (N). كمية متجهة.' },
              { term: 'القصور الذاتي', definition: 'ميل الجسم لمقاومة التغير في حالة حركته. مرتبط بالكتلة.' },
              { term: 'الكتلة', definition: 'مقياس لكمية المادة في جسم. تُقاس بالكيلوجرام (kg).' },
            ],
            practiceQuestions: [
              { question: 'جسم كتلته 2 kg يؤثر عليه قوة محصلة 10 N. ما تسارعه؟', answer: 'a = F/m = 10/2 = 5 m/s²' },
              { question: 'لماذا تشعر بالضغط في المقعد عند تسارع السيارة؟', answer: 'جسمك له قصور ذاتي ويميل للبقاء ساكناً بينما تتحرك السيارة للأمام — مثال على قانون نيوتن الأول.' },
            ],
          },
          {
            id: 'energy-work',
            title: 'الطاقة والشغل',
            description: 'قانون حفظ الطاقة ونظرية الشغل والطاقة.',
            type: 'reading',
            status: 'upcoming',
            estimatedMinutes: 32,
            content: [
              { type: 'heading', text: 'الشغل والطاقة' },
              { type: 'paragraph', text: 'في الفيزياء، يُنجز شغل عندما تُسبب قوة في تحرك جسم مسافة ما. الطاقة هي القدرة على إنجاز شغل. المفهومان مرتبطان ارتباطاً وثيقاً.' },
              { type: 'callout', variant: 'info', text: 'الوحدة الدولية للشغل والطاقة هي الجول (J). جول واحد يساوي نيوتن-متر واحد.' },
            ],
          },
          {
            id: 'momentum',
            title: 'كمية الحركة',
            description: 'حفظ كمية الحركة والتصادمات.',
            type: 'exercise',
            status: 'upcoming',
            estimatedMinutes: 28,
          },
          {
            id: 'gravitation',
            title: 'الجاذبية',
            description: 'قانون نيوتن للجذب العام.',
            type: 'reading',
            status: 'locked',
            estimatedMinutes: 30,
          },
        ],
      },
      {
        id: 'physics-waves',
        title: 'الموجات والبصريات',
        description: 'خصائص الموجات والصوت والضوء.',
        lessons: [
          {
            id: 'wave-properties',
            title: 'خصائص الموجات',
            description: 'التردد والطول الموجي والسعة.',
            type: 'reading',
            status: 'locked',
            estimatedMinutes: 25,
          },
          {
            id: 'light-optics',
            title: 'الضوء والبصريات',
            description: 'الانعكاس والانكسار والعدسات.',
            type: 'video',
            status: 'locked',
            estimatedMinutes: 35,
          },
        ],
      },
    ],
  },
  {
    id: 'english',
    name: 'اللغة العربية',
    subtitle: 'النحو والبلاغة',
    description: 'دراسة اللغة وأدبها والتعبير. يغطي هذا المسار أساسيات النحو والتحليل الأدبي والكتابة الأكاديمية.',
    color: '#7a5c8a',
    colorBg: '#f0ebf3',
    colorBorder: '#dccfdde6',
    icon: 'BookOpen',
    units: [
      {
        id: 'english-grammar',
        title: 'النحو',
        description: 'القواعد البنيوية التي تحكم اللغة العربية.',
        lessons: [
          {
            id: 'sentence-structure',
            title: 'تركيب الجملة',
            description: 'الجمل والشبه جملة وكيف تُبنى الجمل.',
            type: 'reading',
            status: 'completed',
            estimatedMinutes: 22,
            content: [
              { type: 'heading', text: 'بنية الجملة' },
              { type: 'paragraph', text: 'كل جملة في اللغة العربية تُبنى من عناصر أساسية: المبتدأ والخبر، أو الفعل والفاعل والمفعول به. فهم كيف تتضافر هذه العناصر ضروري للكتابة الواضحة.' },
              { type: 'subheading', text: 'الجملة الاسمية والجملة الفعلية' },
              { type: 'paragraph', text: 'الجملة الاسمية تبدأ باسم، مثل "السماءُ صافيةٌ". الجملة الفعلية تبدأ بفعل، مثل "شرقَتِ الشمسُ". كلتاهما تؤديان معنى تاماً.' },
              { type: 'callout', variant: 'tip', text: 'طريقة بسيطة للاختبار: اقرأ الجملة. إذا بدأت باسم فهي اسمية، وإذا بدأت بفعل فهي فعلية.' },
              { type: 'blockquote', text: 'اللغة وعاء العلم، وبدونها لا يمكن التعبير عن المعنى. — ابن جني' },
            ],
            keyTerms: [
              { term: 'المبتدأ', definition: 'الاسم الذي تبدأ به الجملة الاسمية ويكون مرفوعاً.' },
              { term: 'الخبر', definition: 'الجزء الذي يكمل معنى المبتدأ ويكون مرفوعاً.' },
              { term: 'الفاعل', definition: 'الاسم الذي يقع منه الفعل ويكون مرفوعاً.' },
            ],
          },
          {
            id: 'parts-of-speech',
            title: 'أقسام الكلمة',
            description: 'الأسماء والأفعال والحروف لبنات اللغة.',
            type: 'reading',
            status: 'completed',
            estimatedMinutes: 18,
          },
          {
            id: 'punctuation',
            title: 'علامات الترقيم',
            description: 'الفاصلة والنقطة وإيقاع الكتابة.',
            type: 'exercise',
            status: 'current',
            estimatedMinutes: 20,
            content: [
              { type: 'heading', text: 'دور علامات الترقيم' },
              { type: 'paragraph', text: 'علامات الترقيم هي إشارات المرور في اللغة. تخبر القارئ متى يتوقف ومتى يتأنّي وكيف يفهم العلاقات بين الأفكار.' },
              { type: 'subheading', text: 'الفاصلة المنقوطة' },
              { type: 'paragraph', text: 'تربط الفاصلة المنقوطة بين جملتين مستقلتين وثيقتي الصلة في المعنى. أقوى من الفاصلة وأضعف من النقطة. فكّر فيها كتوقف متدرج.' },
              { type: 'callout', variant: 'warning', text: 'خطأ شائع: استخدام الفاصلة لربط جملتين مستقلتين بدون أداة ربط. يُسمى هذا "وصل الجمل بفاصلة". استخدم الفاصلة المنقوطة أو النقطة أو أضف أداة ربط.' },
            ],
          },
          {
            id: 'verb-tenses',
            title: 'أزمنة الأفعال',
            description: 'الماضي والمضارع والأمر وجوانبها.',
            type: 'reading',
            status: 'upcoming',
            estimatedMinutes: 25,
          },
          {
            id: 'advanced-syntax',
            title: 'البلاغة المتقدمة',
            description: 'أنماط الجمل المعقدة والتراكيب البلاغية.',
            type: 'reading',
            status: 'locked',
            estimatedMinutes: 30,
          },
        ],
      },
      {
        id: 'english-reading',
        title: 'القراءة',
        description: 'تحليل الأدب وفهم النصوص.',
        lessons: [
          {
            id: 'literary-devices',
            title: 'الصور البلاغية',
            description: 'الاستعارة والتشبيه والرمز والمزيد.',
            type: 'reading',
            status: 'locked',
            estimatedMinutes: 28,
          },
          {
            id: 'text-analysis',
            title: 'تحليل النص',
            description: 'القراءة المتأنية والتفسير النقدي.',
            type: 'discussion',
            status: 'locked',
            estimatedMinutes: 35,
          },
        ],
      },
      {
        id: 'english-writing',
        title: 'الكتابة',
        description: 'صياغة المقالات والحجج والسرد.',
        lessons: [
          {
            id: 'essay-structure',
            title: 'بنية المقال',
            description: 'المقدمة والعرض والخاتمة والفكرة المحورية.',
            type: 'reading',
            status: 'locked',
            estimatedMinutes: 30,
          },
          {
            id: 'argumentation',
            title: 'الجدال',
            description: 'بناء حجج مقنعة بالأدلة.',
            type: 'exercise',
            status: 'locked',
            estimatedMinutes: 32,
          },
        ],
      },
    ],
  },
  {
    id: 'biology',
    name: 'الأحياء',
    subtitle: 'الخلايا والوراثة',
    description: 'دراسة الكائنات الحية، من العمليات الخلوية إلى النظم البيئية والتطور.',
    color: '#5a7c4f',
    colorBg: '#e8f0e5',
    colorBorder: '#c8dcc0',
    icon: 'Dna',
    units: [
      {
        id: 'bio-cells',
        title: 'بيولوجيا الخلية',
        description: 'الوحدة الأساسية للحياة.',
        lessons: [
          {
            id: 'cell-structure',
            title: 'تركيب الخلية',
            description: 'العضيات ووظائفها.',
            type: 'reading',
            status: 'completed',
            estimatedMinutes: 28,
            content: [
              { type: 'heading', text: 'الخلية: لبنة الحياة' },
              { type: 'paragraph', text: 'الخلية هي أصغر وحدة بنيوية ووظيفية في جميع الكائنات الحية. فهم مكوناتها أساس لكل علم الأحياء.' },
              { type: 'subheading', text: 'العضيات الرئيسية' },
              { type: 'list', items: [
                'النواة: تحتوي المادة الوراثية (DNA) وتتحكم في نشاطات الخلية',
                'الميتوكوندريا: "محطة الطاقة" — تنتج ATP عبر التنفس الخلوي',
                'الرايبوسومات: تصنع البروتينات من mRNA',
                'الشبكة الإندوبلازمية: تنقل البروتينات وتصنع الدهون',
                'جهاز جولجي: يعبئ ويوزع البروتينات',
              ]},
              { type: 'callout', variant: 'info', text: 'الخلايا بدائية النواة (البكتيريا) تفتقر إلى النواة والعضيات المرتبطة بغشاء. الخلايا حقيقية النواة (النباتات والحيوانات والفطريات) تمتلك كليهما.' },
            ],
          },
          {
            id: 'cell-division',
            title: 'انقسام الخلية',
            description: 'الانقسام المتساوي والانقسام المنصف.',
            type: 'video',
            status: 'current',
            estimatedMinutes: 32,
            content: [
              { type: 'heading', text: 'كيف تنقسم الخلايا' },
              { type: 'paragraph', text: 'انقسام الخلية هو العملية التي تنقسم بها الخلية الأم إلى خليتين ابنتين أو أكثر. هناك نوعان رئيسيان: الانقسام المتساوي والانقسام المنصف.' },
              { type: 'subheading', text: 'الانقسام المتساوي' },
              { type: 'paragraph', text: 'ينتج الانقسام المتساوي خليتين ابنتين متطابقتين وراثياً بنفس عدد الكروموسومات كالخلية الأم. يُستخدم للنمو والإصلاح والتكاثر اللاجنسي.' },
              { type: 'subheading', text: 'الانقسام المنصف' },
              { type: 'paragraph', text: 'ينتج الانقسام المنصف أربع خلايا ابنة فريدة وراثياً، كل منها بنصف عدد الكروموسومات. ضروري للتکاثر الجنسي ويخلق تنوعاً وراثياً.' },
              { type: 'callout', variant: 'tip', text: 'تذكّر: الانقسام المتساوي ينتج خلايا متطابقة. الانقسام المنصف ينتج أمشاج بنصف الكروموسومات.' },
            ],
          },
          {
            id: 'cellular-respiration',
            title: 'التنفس الخلوي',
            description: 'كيف تحول الخلايا الغذاء إلى طاقة.',
            type: 'reading',
            status: 'upcoming',
            estimatedMinutes: 30,
          },
          {
            id: 'photosynthesis',
            title: 'البناء الضوئي',
            description: 'كيف تحول النباتات الضوء إلى طاقة.',
            type: 'reading',
            status: 'upcoming',
            estimatedMinutes: 28,
          },
        ],
      },
      {
        id: 'bio-genetics',
        title: 'الوراثة',
        description: 'الصفات الوراثية و DNA وشيفرة الحياة.',
        lessons: [
          {
            id: 'dna-structure',
            title: 'تركيب DNA',
            description: 'الحلزون المزدوج والاقتران القاعدي.',
            type: 'reading',
            status: 'locked',
            estimatedMinutes: 30,
          },
          {
            id: 'mendelian-genetics',
            title: 'وراثة مندل',
            description: 'أنماط الوراثة ومربعات بنيت.',
            type: 'exercise',
            status: 'locked',
            estimatedMinutes: 35,
          },
        ],
      },
    ],
  },
  {
    id: 'history',
    name: 'التاريخ',
    subtitle: 'العالم الحديث',
    description: 'من الثورة الصناعية إلى يومنا هذا، استكشاف الأحداث التي شكّلت عالمنا.',
    color: '#8a6d5c',
    colorBg: '#f0eae5',
    colorBorder: '#d8ccc0',
    icon: 'Scroll',
    units: [
      {
        id: 'hist-industrial',
        title: 'الثورة الصناعية',
        description: 'تحول الاقتصادات والمجتمعات.',
        lessons: [
          {
            id: 'origins-industrial',
            title: 'بدايات التصنيع',
            description: 'لماذا بدأت في بريطانيا.',
            type: 'reading',
            status: 'completed',
            estimatedMinutes: 25,
            content: [
              { type: 'heading', text: 'مولد العصر الصناعي' },
              { type: 'paragraph', text: 'بدأت الثورة الصناعية في بريطانيا في أواخر القرن الثامن عشر وحوّلت العالم. مثّلت التحول من الاقتصادات الزراعية والحرفية إلى التصنيع الآلي.' },
              { type: 'callout', variant: 'info', text: 'كان لبريطانيا عدة مزايا: الفحم الوفير، ونظام سياسي مستقر، وأسواق استعمارية، وتقاليد في البحث العلمي.' },
              { type: 'blockquote', text: 'كانت الثورة الصناعية واحدة من تلك القفزات الاستثنائية في مسيرة الحضارة. — ستيفن غاردينر' },
            ],
          },
          {
            id: 'social-impact',
            title: 'الأثر الاجتماعي',
            description: 'التمدن والعمل وبنية الطبقات.',
            type: 'discussion',
            status: 'current',
            estimatedMinutes: 30,
            content: [
              { type: 'heading', text: 'مجتمع متحوّل' },
              { type: 'paragraph', text: 'أعادت الثورة الصناعية تشكيل كل جانب من جوانب الحياة اليومية. انتقل الناس من المزارع إلى المدن، وتحوّل العمل من البيوت إلى المصانع، وظهرت طبقات اجتماعية جديدة.' },
              { type: 'subheading', text: 'التمدن' },
              { type: 'paragraph', text: 'نمت المدن بسرعة مع سعي الناس للحصول على عمل في المصانع. أدى ذلك إلى الازدحام وسوء المرافق وظروف معيشية قاسية للطبقة العاملة.' },
              { type: 'callout', variant: 'warning', text: 'كان عمالة الأطفال منتشرة خلال الثورة الصناعية المبكرة. عمل أطفال في سن السادسة في مصانع النسيج ومناجم الفحم لمدة 12-14 ساعة يومياً.' },
            ],
          },
          {
            id: 'technological-advances',
            title: 'التطورات التكنولوجية',
            description: 'الطاقة البخارية والنسيج والنقل.',
            type: 'reading',
            status: 'upcoming',
            estimatedMinutes: 28,
          },
        ],
      },
      {
        id: 'hist-world-wars',
        title: 'الحروب العالمية',
        description: 'الصراعات العالمية في القرن العشرين.',
        lessons: [
          {
            id: 'ww1-causes',
            title: 'أسباب الحرب العالمية الأولى',
            description: 'التحالفات والقومية وشرارة الحرب.',
            type: 'reading',
            status: 'locked',
            estimatedMinutes: 35,
          },
          {
            id: 'ww2-impact',
            title: 'الحرب العالمية الثانية وآثارها',
            description: 'الحرب التي أعادت تشكيل النظام العالمي.',
            type: 'reading',
            status: 'locked',
            estimatedMinutes: 40,
          },
        ],
      },
    ],
  },
];

export const activities: ActivityItem[] = [
  {
    id: 'act-1',
    type: 'completed',
    label: 'أكملت درساً',
    subject: 'الرياضيات',
    subjectId: 'mathematics',
    lessonTitle: 'المعادلات التربيعية',
    lessonId: 'quadratic-equations',
    timestamp: 'قبل ساعتين',
  },
  {
    id: 'act-2',
    type: 'started',
    label: 'بدأت وحدة جديدة',
    subject: 'الفيزياء',
    subjectId: 'physics',
    lessonTitle: 'قوانين نيوتن',
    lessonId: 'newtons-laws',
    timestamp: 'أمس',
  },
  {
    id: 'act-3',
    type: 'answered',
    label: 'أجبت على نقاش',
    subject: 'اللغة العربية',
    subjectId: 'english',
    lessonTitle: 'علامات الترقيم',
    lessonId: 'punctuation',
    timestamp: 'أمس',
  },
  {
    id: 'act-4',
    type: 'saved',
    label: 'حفظت درساً',
    subject: 'الأحياء',
    subjectId: 'biology',
    lessonTitle: 'انقسام الخلية',
    lessonId: 'cell-division',
    timestamp: 'قبل يومين',
  },
  {
    id: 'act-5',
    type: 'completed',
    label: 'أكملت درساً',
    subject: 'الرياضيات',
    subjectId: 'mathematics',
    lessonTitle: 'المعادلات الخطية',
    lessonId: 'linear-equations',
    timestamp: 'قبل 3 أيام',
  },
  {
    id: 'act-6',
    type: 'completed',
    label: 'أكملت درساً',
    subject: 'الأحياء',
    subjectId: 'biology',
    lessonTitle: 'تركيب الخلية',
    lessonId: 'cell-structure',
    timestamp: 'قبل 4 أيام',
  },
];

export const discussions: Discussion[] = [
  {
    id: 'disc-1',
    question: 'لماذا يعمل القانون العام دائماً حتى عندما يفشل التحليل؟',
    subject: 'الرياضيات',
    subjectId: 'mathematics',
    author: 'سارة أحمد',
    replies: 12,
    lastActivity: 'قبل ساعتين',
    excerpt: 'أفهم كيفية استخدام القانون العام، لكنني فضولية حول سبب إنتاجه الجذور الصحيحة لكل معادلة تربيعية، حتى تلك التي لا يمكن تحليلها...',
    tags: ['الجبر', 'تربيعية'],
    answered: true,
  },
  {
    id: 'disc-2',
    question: 'كيف تعمل أزواج الفعل ورد الفعل في قانون نيوتن الثالث عندما يكون الجسم ساكناً؟',
    subject: 'الفيزياء',
    subjectId: 'physics',
    author: 'محمود علي',
    replies: 8,
    lastActivity: 'قبل 5 ساعات',
    excerpt: 'إذا كان لكل فعل رد فعل مساوٍ ومعاكس، فلماذا لا يتحرك كتاب موضوع على طاولة؟ الطاولة تدفع للأعلى بنفس القوة التي يدفع بها الكتاب للأسفل...',
    tags: ['الميكانيكا', 'القوى'],
    answered: true,
  },
  {
    id: 'disc-3',
    question: 'هل الفاصلة المنقوطة ضرورية في الكتابة الأكاديمية؟',
    subject: 'اللغة العربية',
    subjectId: 'english',
    author: 'إيمان خالد',
    replies: 23,
    lastActivity: 'أمس',
    excerpt: 'تلقيت إرشادات متضاربة من أساتذة مختلفين. بعضهم يصر على الفاصلة المنقوطة، وبعضهم يقول إنها اختيارية. ما المعيار في الأوراق الأكاديمية؟',
    tags: ['النحو', 'الترقيم', 'الكتابة'],
    answered: false,
  },
  {
    id: 'disc-4',
    question: 'كيف تختلف الميتوكوندريا في الخلايا النباتية عنها في الخلايا الحيوانية؟',
    subject: 'الأحياء',
    subjectId: 'biology',
    author: 'داود حسن',
    replies: 6,
    lastActivity: 'قبل يومين',
    excerpt: 'تعلمنا عن الميتوكوندريا في سياق الخلايا الحيوانية. هل تعمل ميتوكوندريا الخلايا النباتية بنفس الطريقة، أم هناك اختلافات بنيوية؟',
    tags: ['الخلايا', 'العضيات'],
    answered: true,
  },
  {
    id: 'disc-5',
    question: 'هل كانت الثورة الصناعية حتمية، أم أن ظروفاً محددة جعلتها ممكنة؟',
    subject: 'التاريخ',
    subjectId: 'history',
    author: 'ليلى عمر',
    replies: 15,
    lastActivity: 'قبل 3 أيام',
    excerpt: 'هل كان يمكن للثورة الصناعية أن تحدث في أي مكان، أم كانت الظروف المحددة في بريطانيا — الفحم والمستعمرات والاستقرار السياسي — ضرورية فريدة؟',
    tags: ['الثورة الصناعية', 'الاقتصاد'],
    answered: false,
  },
  {
    id: 'disc-6',
    question: 'أفضل طريقة لحل أنظمة المعادلات بثلاثة مجاهيل؟',
    subject: 'الرياضيات',
    subjectId: 'mathematics',
    author: 'جاسم فيصل',
    replies: 4,
    lastActivity: 'قبل 4 أيام',
    excerpt: 'أجد أن طريقة الحذف تعمل جيداً لمتغيرين، لكن مع ثلاثة يصبح الأمر معقداً. هل يجب استخدام المصفوفات، أم هناك طريقة حذف منهجية؟',
    tags: ['الجبر', 'الأنظمة'],
    answered: false,
  },
];

export const savedLessons: SavedLesson[] = [
  {
    id: 'saved-1',
    lessonId: 'cell-division',
    lessonTitle: 'انقسام الخلية',
    subject: 'الأحياء',
    subjectId: 'biology',
    unitTitle: 'بيولوجيا الخلية',
    savedAt: 'قبل يومين',
    type: 'video',
  },
  {
    id: 'saved-2',
    lessonId: 'quadratic-equations',
    lessonTitle: 'المعادلات التربيعية',
    subject: 'الرياضيات',
    subjectId: 'mathematics',
    unitTitle: 'الجبر',
    savedAt: 'قبل 3 أيام',
    type: 'reading',
  },
  {
    id: 'saved-3',
    lessonId: 'newtons-laws',
    lessonTitle: 'قوانين نيوتن',
    subject: 'الفيزياء',
    subjectId: 'physics',
    unitTitle: 'الميكانيكا',
    savedAt: 'قبل 5 أيام',
    type: 'reading',
  },
  {
    id: 'saved-4',
    lessonId: 'sentence-structure',
    lessonTitle: 'تركيب الجملة',
    subject: 'اللغة العربية',
    subjectId: 'english',
    unitTitle: 'النحو',
    savedAt: 'قبل أسبوع',
    type: 'reading',
  },
];

export function getSubjectById(id: string): Subject | undefined {
  return subjects.find((s) => s.id === id);
}

export function getLessonById(lessonId: string): { lesson: Lesson | undefined; subject: Subject | undefined; unit: Unit | undefined } {
  for (const subject of subjects) {
    for (const unit of subject.units) {
      const lesson = unit.lessons.find((l) => l.id === lessonId);
      if (lesson) return { lesson, subject, unit };
    }
  }
  return { lesson: undefined, subject: undefined, unit: undefined };
}

export function getSubjectProgress(subject: Subject): { completed: number; total: number; percent: number } {
  let total = 0;
  let completed = 0;
  subject.units.forEach((unit) => {
    unit.lessons.forEach((lesson) => {
      total++;
      if (lesson.status === 'completed') completed++;
    });
  });
  return {
    completed,
    total,
    percent: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

export function getUnitProgress(unit: Unit): { completed: number; total: number; percent: number } {
  const total = unit.lessons.length;
  const completed = unit.lessons.filter((l) => l.status === 'completed').length;
  return {
    completed,
    total,
    percent: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

export function getCurrentLesson(): { lesson: Lesson | undefined; subject: Subject | undefined; unit: Unit | undefined } {
  for (const subject of subjects) {
    for (const unit of subject.units) {
      const lesson = unit.lessons.find((l) => l.status === 'current');
      if (lesson) return { lesson, subject, unit };
    }
  }
  return { lesson: undefined, subject: undefined, unit: undefined };
}

export function getNextLesson(subjectId: string, currentLessonId: string): { lesson: Lesson | undefined; unit: Unit | undefined } {
  const subject = getSubjectById(subjectId);
  if (!subject) return { lesson: undefined, unit: undefined };

  for (const unit of subject.units) {
    const idx = unit.lessons.findIndex((l) => l.id === currentLessonId);
    if (idx !== -1) {
      if (idx < unit.lessons.length - 1) {
        return { lesson: unit.lessons[idx + 1], unit };
      }
      const unitIdx = subject.units.indexOf(unit);
      if (unitIdx < subject.units.length - 1) {
        const nextUnit = subject.units[unitIdx + 1];
        return { lesson: nextUnit.lessons[0], unit: nextUnit };
      }
    }
  }
  return { lesson: undefined, unit: undefined };
}

export function getPrevLesson(subjectId: string, currentLessonId: string): { lesson: Lesson | undefined; unit: Unit | undefined } {
  const subject = getSubjectById(subjectId);
  if (!subject) return { lesson: undefined, unit: undefined };

  for (const unit of subject.units) {
    const idx = unit.lessons.findIndex((l) => l.id === currentLessonId);
    if (idx !== -1) {
      if (idx > 0) {
        return { lesson: unit.lessons[idx - 1], unit };
      }
      const unitIdx = subject.units.indexOf(unit);
      if (unitIdx > 0) {
        const prevUnit = subject.units[unitIdx - 1];
        return { lesson: prevUnit.lessons[prevUnit.lessons.length - 1], unit: prevUnit };
      }
    }
  }
  return { lesson: undefined, unit: undefined };
}

export function getTodaysLessons() {
  const result: { lesson: Lesson; subject: Subject; unit: Unit }[] = [];
  for (const subject of subjects) {
    for (const unit of subject.units) {
      const lesson = unit.lessons.find((l) => l.status === 'current' || l.status === 'upcoming');
      if (lesson && result.length < 4) {
        result.push({ lesson, subject, unit });
      }
    }
  }
  return result;
}

export function getLastStudiedLesson(subjectId: string): { lesson: Lesson | undefined; unit: Unit | undefined } {
  const subject = getSubjectById(subjectId);
  if (!subject) return { lesson: undefined, unit: undefined };

  for (const unit of subject.units) {
    const completed = unit.lessons.filter((l) => l.status === 'completed');
    if (completed.length > 0) {
      return { lesson: completed[completed.length - 1], unit };
    }
  }
  return { lesson: undefined, unit: undefined };
}

export const studyStreak = {
  current: 12,
  longest: 28,
  thisWeek: 5,
  totalMinutes: 842,
};

export type { Lesson, Unit, Subject } from '@/types';
