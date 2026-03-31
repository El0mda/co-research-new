export interface Researcher {
  id: string;
  name: string;
  nameEn: string;
  email: string;
  avatar: string;
  degree: string;
  degreeEn: string;
  university: string;
  universityEn: string;
  faculty: string;
  facultyEn: string;
  field: string;
  fieldEn: string;
  subField: string;
  subFieldEn: string;
  interests: string[];
  interestsEn: string[];
  orcid?: string;
  scholar?: string;
  scopus?: string;
}

export interface Task {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  assigneeId: string;
  status: 'in-progress' | 'under-review' | 'completed';
  dueDate: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  textEn: string;
  timestamp: string;
  attachment?: { name: string; type: string };
}

export interface ResearchProject {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  field: string;
  fieldEn: string;
  subField: string;
  subFieldEn: string;
  interests: string[];
  interestsEn: string[];
  type: 'empirical' | 'mixed' | 'theoretical' | 'qualitative';
  status: 'idea' | 'in-progress' | 'final';
  startDate: string;
  endDate: string;
  maxMembers: number;
  members: string[];
  leaderId: string;
  completion: number;
  tasks: Task[];
  messages: Message[];
}

export const researchers: Researcher[] = [
  {
    id: 'r1',
    name: 'د. أحمد الحربي',
    nameEn: 'Dr. Ahmed Al-Harbi',
    email: 'ahmed@ksu.edu.sa',
    avatar: '',
    degree: 'دكتوراه',
    degreeEn: 'PhD',
    university: 'جامعة الملك سعود',
    universityEn: 'King Saud University',
    faculty: 'كلية علوم الحاسب',
    facultyEn: 'College of Computer Science',
    field: 'علوم الحاسب',
    fieldEn: 'Computer Science',
    subField: 'الذكاء الاصطناعي',
    subFieldEn: 'Artificial Intelligence',
    interests: ['تعلم الآلة', 'معالجة اللغات الطبيعية', 'الرؤية الحاسوبية'],
    interestsEn: ['Machine Learning', 'NLP', 'Computer Vision'],
    orcid: '0000-0001-2345-6789',
    scholar: 'https://scholar.google.com/citations?user=abc',
  },
  {
    id: 'r2',
    name: 'د. سارة القحطاني',
    nameEn: 'Dr. Sara Al-Qahtani',
    email: 'sara@kau.edu.sa',
    avatar: '',
    degree: 'ماجستير',
    degreeEn: "Master's",
    university: 'جامعة الملك عبدالعزيز',
    universityEn: 'King Abdulaziz University',
    faculty: 'كلية الطب',
    facultyEn: 'College of Medicine',
    field: 'الطب',
    fieldEn: 'Medicine',
    subField: 'الصحة العامة',
    subFieldEn: 'Public Health',
    interests: ['الوبائيات', 'الصحة الرقمية', 'البحث السريري'],
    interestsEn: ['Epidemiology', 'Digital Health', 'Clinical Research'],
    scopus: 'https://www.scopus.com/authid/detail.uri?authorId=123',
  },
  {
    id: 'r3',
    name: 'أ. خالد المطيري',
    nameEn: 'Khalid Al-Mutairi',
    email: 'khalid@kfupm.edu.sa',
    avatar: '',
    degree: 'بكالوريوس',
    degreeEn: "Bachelor's",
    university: 'جامعة الملك فهد للبترول',
    universityEn: 'KFUPM',
    faculty: 'كلية الهندسة',
    facultyEn: 'College of Engineering',
    field: 'الهندسة',
    fieldEn: 'Engineering',
    subField: 'هندسة البرمجيات',
    subFieldEn: 'Software Engineering',
    interests: ['تطوير الويب', 'الحوسبة السحابية', 'DevOps'],
    interestsEn: ['Web Development', 'Cloud Computing', 'DevOps'],
  },
];

export const projects: ResearchProject[] = [
  {
    id: 'p1',
    title: 'تطبيق الذكاء الاصطناعي في التشخيص الطبي',
    titleEn: 'AI Applications in Medical Diagnosis',
    description: 'بحث يهدف إلى تطوير نموذج ذكاء اصطناعي للمساعدة في تشخيص الأمراض من الصور الطبية',
    descriptionEn: 'Research aimed at developing an AI model to assist in diagnosing diseases from medical images',
    field: 'علوم الحاسب',
    fieldEn: 'Computer Science',
    subField: 'الذكاء الاصطناعي',
    subFieldEn: 'Artificial Intelligence',
    interests: ['تعلم الآلة', 'الرؤية الحاسوبية', 'التصوير الطبي'],
    interestsEn: ['Machine Learning', 'Computer Vision', 'Medical Imaging'],
    type: 'empirical',
    status: 'in-progress',
    startDate: '2025-01-15',
    endDate: '2026-06-30',
    maxMembers: 4,
    members: ['r1', 'r2'],
    leaderId: 'r1',
    completion: 45,
    tasks: [
      { id: 't1', title: 'مراجعة الأدبيات', titleEn: 'Literature Review', description: 'مراجعة شاملة للدراسات السابقة', descriptionEn: 'Comprehensive review of previous studies', assigneeId: 'r1', status: 'completed', dueDate: '2025-03-01' },
      { id: 't2', title: 'جمع البيانات', titleEn: 'Data Collection', description: 'جمع صور طبية من المستشفيات', descriptionEn: 'Collect medical images from hospitals', assigneeId: 'r2', status: 'completed', dueDate: '2025-05-01' },
      { id: 't3', title: 'بناء النموذج', titleEn: 'Build Model', description: 'تصميم وتدريب نموذج التعلم العميق', descriptionEn: 'Design and train the deep learning model', assigneeId: 'r1', status: 'in-progress', dueDate: '2025-09-01' },
      { id: 't4', title: 'اختبار النموذج', titleEn: 'Test Model', description: 'اختبار دقة النموذج على بيانات جديدة', descriptionEn: 'Test model accuracy on new data', assigneeId: 'r2', status: 'in-progress', dueDate: '2025-11-01' },
      { id: 't5', title: 'كتابة النتائج', titleEn: 'Write Results', description: 'توثيق وتحليل النتائج', descriptionEn: 'Document and analyze results', assigneeId: 'r1', status: 'under-review', dueDate: '2026-01-15' },
      { id: 't6', title: 'المراجعة النهائية', titleEn: 'Final Review', description: 'مراجعة نهائية للورقة البحثية', descriptionEn: 'Final review of the research paper', assigneeId: 'r2', status: 'under-review', dueDate: '2026-03-01' },
    ],
    messages: [
      { id: 'm1', senderId: 'r1', text: 'مرحبا بالجميع، هذه المجموعة لمشروعنا البحثي', textEn: 'Welcome everyone, this is our research project group', timestamp: '2025-01-20T10:00:00Z' },
      { id: 'm2', senderId: 'r2', text: 'شكرا دكتور أحمد، أنا متحمسة للبدء', textEn: 'Thank you Dr. Ahmed, I am excited to start', timestamp: '2025-01-20T10:05:00Z' },
      { id: 'm3', senderId: 'r1', text: 'أرفقت خطة البحث المبدئية', textEn: 'I have attached the initial research plan', timestamp: '2025-01-21T09:00:00Z', attachment: { name: 'research_plan_v1.pdf', type: 'pdf' } },
      { id: 'm4', senderId: 'r2', text: 'راجعت الخطة، لدي بعض الملاحظات', textEn: 'Reviewed the plan, I have some notes', timestamp: '2025-01-22T14:30:00Z' },
      { id: 'm5', senderId: 'r1', text: 'ممتاز، شاركي ملاحظاتك وسنناقشها', textEn: 'Excellent, share your notes and we will discuss them', timestamp: '2025-01-22T15:00:00Z' },
    ],
  },
  {
    id: 'p2',
    title: 'تأثير التعلم الإلكتروني على التحصيل الدراسي',
    titleEn: 'Impact of E-Learning on Academic Achievement',
    description: 'دراسة مقارنة لتأثير التعلم الإلكتروني على تحصيل طلاب الجامعات السعودية',
    descriptionEn: 'Comparative study of e-learning impact on Saudi university students achievement',
    field: 'التربية',
    fieldEn: 'Education',
    subField: 'تقنيات التعليم',
    subFieldEn: 'Educational Technology',
    interests: ['التعلم الإلكتروني', 'التقييم', 'تصميم المناهج'],
    interestsEn: ['E-Learning', 'Assessment', 'Curriculum Design'],
    type: 'mixed',
    status: 'idea',
    startDate: '2025-06-01',
    endDate: '2026-12-31',
    maxMembers: 5,
    members: ['r2'],
    leaderId: 'r2',
    completion: 5,
    tasks: [],
    messages: [],
  },
  {
    id: 'p3',
    title: 'تحسين أداء الحوسبة السحابية',
    titleEn: 'Optimizing Cloud Computing Performance',
    description: 'بحث في تقنيات تحسين أداء وكفاءة البنية التحتية السحابية',
    descriptionEn: 'Research on techniques for improving cloud infrastructure performance',
    field: 'علوم الحاسب',
    fieldEn: 'Computer Science',
    subField: 'الحوسبة السحابية',
    subFieldEn: 'Cloud Computing',
    interests: ['الحوسبة السحابية', 'الأداء', 'البنية التحتية'],
    interestsEn: ['Cloud Computing', 'Performance', 'Infrastructure'],
    type: 'theoretical',
    status: 'in-progress',
    startDate: '2024-09-01',
    endDate: '2025-12-31',
    maxMembers: 3,
    members: ['r3', 'r1', 'r2'],
    leaderId: 'r3',
    completion: 80,
    tasks: [],
    messages: [],
  },
  {
    id: 'p4',
    title: 'الأمن السيبراني في المنشآت الصحية',
    titleEn: 'Cybersecurity in Healthcare Facilities',
    description: 'تقييم الجاهزية الأمنية السيبرانية في المستشفيات السعودية',
    descriptionEn: 'Assessing cybersecurity readiness in Saudi hospitals',
    field: 'علوم الحاسب',
    fieldEn: 'Computer Science',
    subField: 'أمن المعلومات',
    subFieldEn: 'Information Security',
    interests: ['الأمن السيبراني', 'الصحة الرقمية', 'إدارة المخاطر'],
    interestsEn: ['Cybersecurity', 'Digital Health', 'Risk Management'],
    type: 'qualitative',
    status: 'final',
    startDate: '2024-01-01',
    endDate: '2025-06-30',
    maxMembers: 4,
    members: ['r1', 'r2', 'r3'],
    leaderId: 'r1',
    completion: 100,
    tasks: [],
    messages: [],
  },
];

export const currentUser = researchers[0];
