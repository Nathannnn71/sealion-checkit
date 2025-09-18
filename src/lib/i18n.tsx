import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type SupportedLang = 'en' | 'ms' | 'ta' | 'zh' | 'th' | 'id' | 'fil' | 'km' | 'lo' | 'my' | 'vi';

// Basic translation dictionaries. Extend as needed.
const dictionaries: Record<SupportedLang, Record<string,string>> = {
  en: {
    'language.choose': 'Choose your Language',
    'language.confirm': 'Confirm',
    'nav.home': 'Home',
    'dashboard.title': 'Dashboard',
    'dashboard.assignments': 'Assignments',
    'dashboard.addAssignment': 'Add Assignment',
    'dashboard.empty': 'No assignments yet',
    'dashboard.form.title': 'Title',
    'dashboard.form.description': 'Description',
    'dashboard.form.language': 'Language',
    'dashboard.form.cancel': 'Cancel',
    'dashboard.form.save': 'Save',
    'assignment.question.title': 'Question',
    'assignment.upload': 'Upload New Document',
  'assignment.openChecker': 'Open Essay Checker',
    'assignment.studentList': 'Student List',
    'assignment.submitted': 'Submitted',
    'assignment.notSubmitted': 'Not Submitted',
    'checker.analyze': 'Analyze Essay',
    'checker.uploadTitle': 'Upload / Import Document',
    'checker.back': 'Back to Assignment',
    'checker.feedback.positive': 'Positive Feedback',
    'checker.feedback.negative': 'Negative Feedback',
    'checker.student.placeholder': 'Student Name Here',
    'feedback.item1': 'Clear thesis - Strongly argues that prisoners should have the right to vote.',
    'feedback.item2': 'Democratic principles - Ties voting to key democratic values like equality, justice, and civil rights.',
    'feedback.item3': 'Acknowledges counterarguments - Addresses the view that criminals forfeit their rights.',
    'feedback.item4': 'Nuanced reasoning - Differentiates between types of crimes (e.g., non-violent vs. violent).',
    'feedback.item5': 'Social justice awareness - Highlights racial and economic disparities in the prison system.',
    'feedback.item6': 'Moral appeal - Frames voting as a moral and civil right, not a reward for good behavior.',
    'feedback.item7': 'Repetitive - Some arguments are repeated unnecessarily.',
    'feedback.item8': 'Convoluted sentences - Ideas jump around or appear out of place.',
    'feedback.item9': 'Spelling mistakes - Some words are misspelled.',
    'feedback.item10': 'Weak transitions - Lacks smooth flow between paragraphs.',
    'feedback.item11': 'Non-detailed examples - Mentions issues but lacks specific evidence or data.',
    'assignment.grading.title': 'Grading',
    'assignment.grading.mistakes': '{count} Mistakes Made',
    'assignment.grading.corrections': '{count} Corrections',
    'assignment.legend.submitted': 'Submitted',
    'assignment.legend.notSubmitted': 'Not Submitted',
    'assignment.question.prompt': 'Do you believe that individuals who are currently serving prison sentences should have the right to vote in political elections? In your response, consider the purpose of incarceration, the principles of democracy and citizenship, and whether the loss of voting rights serves justice or hinders rehabilitation. Support your opinion with clear reasoning and, if possible, real-world examples or legal perspectives.'
  },
  ms: {
    'language.choose': 'Pilih Bahasa Anda',
    'language.confirm': 'Sahkan',
    'nav.home': 'Laman Utama',
    'dashboard.title': 'Papan Pemuka',
    'dashboard.assignments': 'Tugasan',
    'dashboard.addAssignment': 'Tambah Tugasan',
    'dashboard.empty': 'Tiada tugasan lagi',
    'dashboard.form.title': 'Tajuk',
    'dashboard.form.description': 'Penerangan',
    'dashboard.form.language': 'Bahasa',
    'dashboard.form.cancel': 'Batal',
    'dashboard.form.save': 'Simpan',
    'assignment.question.title': 'Soalan',
    'assignment.upload': 'Muat Naik Dokumen Baharu',
  'assignment.openChecker': 'Buka Pemeriksa Esei',
    'assignment.studentList': 'Senarai Pelajar',
    'assignment.submitted': 'Hantar',
    'assignment.notSubmitted': 'Belum Hantar',
    'checker.analyze': 'Analisis Karangan',
    'checker.uploadTitle': 'Muat Naik / Import Dokumen',
    'checker.back': 'Kembali ke Tugasan',
    'checker.feedback.positive': 'Maklum Balas Positif',
    'checker.feedback.negative': 'Maklum Balas Negatif',
    'checker.student.placeholder': 'Nama Pelajar',
    'feedback.item1': 'Tesis jelas - Hujah kukuh bahawa banduan patut mengundi.',
    'feedback.item2': 'Prinsip demokrasi - Mengaitkan dengan nilai kesamarataan, keadilan, hak sivil.',
    'feedback.item3': 'Akui hujah balas - Menangani pandangan bahawa penjenayah hilang hak.',
    'feedback.item4': 'Penaakulan bernuansa - Bezakan jenis jenayah (bukan ganas vs ganas).',
    'feedback.item5': 'Kesedaran keadilan sosial - Menonjolkan jurang kaum & ekonomi.',
    'feedback.item6': 'Rayuan moral - Hak mengundi sebagai hak sivik, bukan ganjaran.',
    'feedback.item7': 'Berulang - Sesetengah hujah diulang tanpa perlu.',
    'feedback.item8': 'Ayat berselirat - Idea melompat atau tersusun pelik.',
    'feedback.item9': 'Kesalahan ejaan - Beberapa ejaan salah.',
    'feedback.item10': 'Peralihan lemah - Kurang kesinambungan antara perenggan.',
    'feedback.item11': 'Contoh tidak terperinci - Tiada data khusus.',
    'assignment.grading.title': 'Pemarkahan',
    'assignment.grading.mistakes': '{count} Kesalahan Dibuat',
    'assignment.grading.corrections': '{count} Pembetulan',
    'assignment.legend.submitted': 'Hantar',
    'assignment.legend.notSubmitted': 'Belum Hantar',
    'assignment.question.prompt': 'Adakah anda percaya individu yang sedang menjalani hukuman penjara patut mempunyai hak mengundi? Huraikan dengan mempertimbang tujuan pemenjaraan, prinsip demokrasi dan kewarganegaraan serta sama ada kehilangan hak mengundi menegakkan keadilan atau menghalang pemulihan.'
  },
  ta: {
    'language.choose': 'உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்',
    'language.confirm': 'உறுதிப்படுத்து',
    'nav.home': 'முகப்பு',
    'dashboard.title': 'டாஷ்போர்டு',
    'dashboard.assignments': 'பணிகள்',
    'dashboard.addAssignment': 'புதிய பணி சேர்க்க',
    'dashboard.empty': 'இன்னும் பணிகள் இல்லை',
    'dashboard.form.title': 'தலைப்பு',
    'dashboard.form.description': 'விளக்கம்',
    'dashboard.form.language': 'மொழி',
    'dashboard.form.cancel': 'ரத்து செய்',
    'dashboard.form.save': 'சேமிக்க',
    'assignment.question.title': 'கேள்வி',
    'assignment.upload': 'புதிய ஆவணத்தை பதிவேற்று',
  'assignment.openChecker': 'கட்டுரை சரிபார்ப்பை திற',
    'assignment.studentList': 'மாணவர் பட்டியல்',
    'assignment.submitted': 'சமர்ப்பிக்கப்பட்டது',
    'assignment.notSubmitted': 'சமர்ப்பிக்கப்படவில்லை',
    'checker.analyze': 'கட்டுரையை பகுப்பாய்வு செய்',
    'checker.uploadTitle': 'ஆவணத்தை பதிவேற்று / இறக்கு',
    'checker.back': 'பணிக்குத் திரும்பு',
    'checker.feedback.positive': 'நலமான கருத்துகள்',
    'checker.feedback.negative': 'எதிர்மறை கருத்துகள்',
    'checker.student.placeholder': 'மாணவர் பெயர்',
    'feedback.item1': 'தெளிவான கருதுகோள் - கைதிகளுக்கு வாக்குரிமை வேண்டும் என்று வலியுறுத்துகிறது.',
    'feedback.item2': 'நாடாளுமன்றக் கோட்பாடு - சமத்துவம், நீதி, உரிமைகள் உடன் இணைக்கிறது.',
    'feedback.item3': 'எதிர்க்கருத்துகளை ஏற்றுக்கொள்கிறது.',
    'feedback.item4': 'நுணுக்கமான பகுப்பாய்வு - குற்ற வகைகளை வேறுபடுத்துகிறது.',
    'feedback.item5': 'சமூக நீதி விழிப்புணர்வு.',
    'feedback.item6': 'கணிசமான நெறிமுறை கோணம்.',
    'feedback.item7': 'மீண்டும் மீண்டும் வரும் கருத்துகள்.',
    'feedback.item8': 'சிக்கலான வாக்கியங்கள்.',
    'feedback.item9': 'எழுத்துப்பிழைகள் உள்ளன.',
    'feedback.item10': 'மென்மையான மாற்றங்கள் இல்லை.',
    'feedback.item11': 'விரிவான உதாரணங்கள் இல்லை.',
    'assignment.grading.title': 'மதிப்பீடு',
    'assignment.grading.mistakes': '{count} பிழைகள்',
    'assignment.grading.corrections': '{count} திருத்தங்கள்',
    'assignment.legend.submitted': 'சமர்ப்பிக்கப்பட்டது',
    'assignment.legend.notSubmitted': 'சமர்ப்பிக்கவில்லை',
    'assignment.question.prompt': 'சிறையில் உள்ளவர்களுக்கு வாக்குரிமை இருக்க வேண்டுமா? ஜனநாயகக் கோட்பாடு, தண்டனையின் நோக்கம், மீளுருவாக்கம் ஆகியவற்றை கருத்தில் கொண்டு விளக்குங்கள்.'
  },
  zh: {
    'language.choose': '选择你的语言',
    'language.confirm': '确认',
    'nav.home': '首页',
    'dashboard.title': '仪表板',
    'dashboard.assignments': '作业',
    'dashboard.addAssignment': '添加作业',
    'dashboard.empty': '目前还没有作业',
    'dashboard.form.title': '标题',
    'dashboard.form.description': '描述',
    'dashboard.form.language': '语言',
    'dashboard.form.cancel': '取消',
    'dashboard.form.save': '保存',
    'assignment.question.title': '题目',
    'assignment.upload': '上传新文档',
  'assignment.openChecker': '打开作文检查器',
    'assignment.studentList': '学生列表',
    'assignment.submitted': '已提交',
    'assignment.notSubmitted': '未提交',
    'checker.analyze': '分析文章',
    'checker.uploadTitle': '上传 / 导入文档',
    'checker.back': '返回作业',
    'checker.feedback.positive': '正面反馈',
    'checker.feedback.negative': '改进建议',
    'checker.student.placeholder': '学生姓名',
    'feedback.item1': '论点清晰 - 明确支持囚犯投票权。',
    'feedback.item2': '民主原则 - 联系平等、公正与公民权。',
    'feedback.item3': '回应反对意见。',
    'feedback.item4': '推理细致 - 区分不同类型的犯罪。',
    'feedback.item5': '社会公正意识。',
    'feedback.item6': '道德诉求。',
    'feedback.item7': '重复 - 某些观点重复。',
    'feedback.item8': '句子冗长杂乱。',
    'feedback.item9': '拼写错误。',
    'feedback.item10': '过渡薄弱。',
    'feedback.item11': '缺少具体例证。',
    'assignment.grading.title': '评分',
    'assignment.grading.mistakes': '共 {count} 处错误',
    'assignment.grading.corrections': '{count} 处更正',
    'assignment.legend.submitted': '已提交',
    'assignment.legend.notSubmitted': '未提交',
    'assignment.question.prompt': '你认为正在服刑的人应拥有投票权吗？请结合监禁目的、民主与公民身份原则，以及剥夺投票权是否有助于正义或妨碍改造进行论述。'
  },
  th: {
    'language.choose': 'เลือกภาษาของคุณ',
    'language.confirm': 'ยืนยัน',
    'nav.home': 'หน้าแรก',
    'dashboard.title': 'แดชบอร์ด',
    'dashboard.assignments': 'งานที่มอบหมาย',
    'dashboard.addAssignment': 'เพิ่มงาน',
    'dashboard.empty': 'ยังไม่มีงาน',
    'dashboard.form.title': 'หัวข้อ',
    'dashboard.form.description': 'คำอธิบาย',
    'dashboard.form.language': 'ภาษา',
    'dashboard.form.cancel': 'ยกเลิก',
    'dashboard.form.save': 'บันทึก',
    'assignment.question.title': 'คำถาม',
    'assignment.upload': 'อัปโหลดเอกสารใหม่',
  'assignment.openChecker': 'เปิดตัวตรวจสอบเรียงความ',
    'assignment.studentList': 'รายชื่อนักเรียน',
    'assignment.submitted': 'ส่งแล้ว',
    'assignment.notSubmitted': 'ยังไม่ส่ง',
    'checker.analyze': 'วิเคราะห์เรียงความ',
    'checker.uploadTitle': 'อัปโหลด / นำเข้าเอกสาร',
    'checker.back': 'กลับไปที่งาน',
    'checker.feedback.positive': 'ข้อดี',
    'checker.feedback.negative': 'ข้อควรปรับปรุง',
    'checker.student.placeholder': 'ชื่อนักเรียน',
    'feedback.item1': 'วิทยานิพนธ์ชัดเจน - สนับสนุนสิทธิ์นักโทษลงคะแนน',
    'feedback.item2': 'หลักการประชาธิปไตย - เชื่อมโยงความเท่าเทียมและความยุติธรรม',
    'feedback.item3': 'ตอบโต้ข้อโต้แย้งฝ่ายตรงข้าม',
    'feedback.item4': 'ให้เหตุผลแยกแยะประเภทอาชญากรรม',
    'feedback.item5': 'ตระหนักรู้ด้านความยุติธรรมทางสังคม',
    'feedback.item6': 'มุมมองด้านศีลธรรม',
    'feedback.item7': 'มีการซ้ำคำอธิบาย',
    'feedback.item8': 'ประโยคซับซ้อน',
    'feedback.item9': 'สะกดผิดบางคำ',
    'feedback.item10': 'การเชื่อมโยงย่อหน้าอ่อน',
    'feedback.item11': 'ขาดตัวอย่างเฉพาะ',
    'assignment.grading.title': 'การให้คะแนน',
    'assignment.grading.mistakes': 'ข้อผิดพลาด {count} รายการ',
    'assignment.grading.corrections': 'แก้ไข {count} รายการ',
    'assignment.legend.submitted': 'ส่งแล้ว',
    'assignment.legend.notSubmitted': 'ยังไม่ส่ง',
    'assignment.question.prompt': 'คุณคิดว่าผู้ต้องขังควรมีสิทธิ์เลือกตั้งหรือไม่? พิจารณาวัตถุประสงค์ของการคุมขัง หลักประชาธิปไตย และการฟื้นฟู' 
  },
  id: {
    'language.choose': 'Pilih Bahasa Anda',
    'language.confirm': 'Konfirmasi',
    'nav.home': 'Beranda',
    'dashboard.title': 'Dasbor',
    'dashboard.assignments': 'Tugas',
    'dashboard.addAssignment': 'Tambah Tugas',
    'dashboard.empty': 'Belum ada tugas',
    'dashboard.form.title': 'Judul',
    'dashboard.form.description': 'Deskripsi',
    'dashboard.form.language': 'Bahasa',
    'dashboard.form.cancel': 'Batal',
    'dashboard.form.save': 'Simpan',
    'assignment.question.title': 'Pertanyaan',
    'assignment.upload': 'Unggah Dokumen Baru',
  'assignment.openChecker': 'Buka Pemeriksa Esai',
    'assignment.studentList': 'Daftar Siswa',
    'assignment.submitted': 'Dikirim',
    'assignment.notSubmitted': 'Belum Dikirim',
    'checker.analyze': 'Analisis Esai',
    'checker.uploadTitle': 'Unggah / Impor Dokumen',
    'checker.back': 'Kembali ke Tugas',
    'checker.feedback.positive': 'Umpan Balik Positif',
    'checker.feedback.negative': 'Umpan Balik Negatif',
    'checker.student.placeholder': 'Nama Siswa',
    'feedback.item1': 'Tesis jelas - Mendukung hak pilih narapidana.',
    'feedback.item2': 'Prinsip demokrasi - Mengaitkan kesetaraan & keadilan.',
    'feedback.item3': 'Mengakui argumen lawan.',
    'feedback.item4': 'Penalaran bernuansa - Bedakan jenis kejahatan.',
    'feedback.item5': 'Kesadaran keadilan sosial.',
    'feedback.item6': 'Seruan moral.',
    'feedback.item7': 'Berulang.',
    'feedback.item8': 'Kalimat rumit.',
    'feedback.item9': 'Salah eja.',
    'feedback.item10': 'Transisi lemah.',
    'feedback.item11': 'Kurang contoh rinci.',
    'assignment.grading.title': 'Penilaian',
    'assignment.grading.mistakes': '{count} Kesalahan',
    'assignment.grading.corrections': '{count} Koreksi',
    'assignment.legend.submitted': 'Dikirim',
    'assignment.legend.notSubmitted': 'Belum Dikirim',
    'assignment.question.prompt': 'Apakah narapidana harus memiliki hak pilih? Jelaskan dengan mempertimbangkan tujuan pemidanaan dan demokrasi.'
  },
  fil: {
    'language.choose': 'Piliin ang Iyong Wika',
    'language.confirm': 'Kumpirmahin',
    'nav.home': 'Home',
    'dashboard.title': 'Dashboard',
    'dashboard.assignments': 'Mga Takdang-Aralin',
    'dashboard.addAssignment': 'Magdagdag ng Takdang-Aralin',
    'dashboard.empty': 'Wala pang takdang-aralin',
    'dashboard.form.title': 'Pamagat',
    'dashboard.form.description': 'Paglalarawan',
    'dashboard.form.language': 'Wika',
    'dashboard.form.cancel': 'Kanselahin',
    'dashboard.form.save': 'I-save',
    'assignment.question.title': 'Tanong',
    'assignment.upload': 'Mag-upload ng Bagong Dokumento',
  'assignment.openChecker': 'Buksan ang Essay Checker',
    'assignment.studentList': 'Listahan ng Mag-aaral',
    'assignment.submitted': 'Isinumite',
    'assignment.notSubmitted': 'Hindi Pa Naisusumite',
    'checker.analyze': 'Suriin ang Sanaysay',
    'checker.uploadTitle': 'Mag-upload / Mag-angkat ng Dokumento',
    'checker.back': 'Bumalik sa Takdang-Aralin',
    'checker.feedback.positive': 'Positibong Puna',
    'checker.feedback.negative': 'Mga Dapat Pagbutihin',
    'checker.student.placeholder': 'Pangalan ng Mag-aaral',
    'assignment.grading.title': 'Pagmamarka',
    'assignment.grading.mistakes': '{count} Mali',
    'assignment.grading.corrections': '{count} Pagwawasto',
    'assignment.legend.submitted': 'Isinumite',
    'assignment.legend.notSubmitted': 'Hindi Pa',
  },
  km: {
    'language.choose': 'ជ្រើសរើសភាសា',
    'language.confirm': 'បញ្ជាក់',
    'nav.home': 'គេហទំព័រ',
    'dashboard.title': 'ផ្ទាំងគ្រប់គ្រង',
    'dashboard.assignments': 'ការងារ',
    'dashboard.addAssignment': 'បន្ថែមការងារ',
    'dashboard.empty': 'មិនទាន់មានការងារ',
    'dashboard.form.title': 'ចំណងជើង',
    'dashboard.form.description': 'ការពិពណ៌នា',
    'dashboard.form.language': 'ភាសា',
    'dashboard.form.cancel': 'បោះបង់',
    'dashboard.form.save': 'រក្សាទុក',
    'assignment.question.title': 'សំនួរ',
    'assignment.submitted': 'បានដាក់ស្នើ',
    'assignment.notSubmitted': 'មិនទាន់ដាក់',
    'checker.analyze': 'វិភាគអត្ថបទ',
    'checker.back': 'ត្រឡប់ទៅការងារ',
  },
  lo: {
    'language.choose': 'ເລືອກພາສາ',
    'language.confirm': 'ຢືນຢັນ',
    'nav.home': 'ໜ້າຫຼັກ',
    'dashboard.title': 'ແດສບອດ',
    'dashboard.assignments': 'ວຽກ',
    'dashboard.addAssignment': 'ເພີ່ມວຽກ',
    'dashboard.empty': 'ຍັງບໍ່ມີວຽກ',
    'dashboard.form.title': 'ຫົວຂໍ້',
    'dashboard.form.description': 'ລາຍລະອຽດ',
    'dashboard.form.language': 'ພາສາ',
    'dashboard.form.cancel': 'ຍົກເລີກ',
    'dashboard.form.save': 'ບັນທຶກ',
    'assignment.question.title': 'ຄຳຖາມ',
    'assignment.submitted': 'ສົ່ງແລ້ວ',
    'assignment.notSubmitted': 'ຍັງບໍ່ສົ່ງ',
  },
  my: {
    'language.choose': 'ဘာသာစကား ရွေးပါ',
    'language.confirm': 'အတည်ပြု',
    'nav.home': 'ပင်မ',
    'dashboard.title': 'ဒက်ရှ်ဘုတ်',
    'dashboard.assignments': 'တာဝန်များ',
    'dashboard.addAssignment': 'တာဝန်အသစ်ထည့်မယ်',
    'dashboard.empty': 'မည်သည့်တာဝန်မျှမရှိသေး',
    'dashboard.form.title': 'ခေါင်းစဉ်',
    'dashboard.form.description': 'ဖော်ပြချက်',
    'dashboard.form.language': 'ဘာသာစကား',
    'dashboard.form.cancel': 'ဖျက်သိမ်း',
    'dashboard.form.save': 'သိမ်းဆည်း',
    'assignment.question.title': 'မေးခွန်း',
    'assignment.submitted': 'ပေးပို့ပြီ',
    'assignment.notSubmitted': 'မပေးပို့သေး',
  },
  vi: {
    'language.choose': 'Chọn ngôn ngữ',
    'language.confirm': 'Xác nhận',
    'nav.home': 'Trang chủ',
    'dashboard.title': 'Bảng điều khiển',
    'dashboard.assignments': 'Bài tập',
    'dashboard.addAssignment': 'Thêm bài tập',
    'dashboard.empty': 'Chưa có bài tập',
    'dashboard.form.title': 'Tiêu đề',
    'dashboard.form.description': 'Mô tả',
    'dashboard.form.language': 'Ngôn ngữ',
    'dashboard.form.cancel': 'Hủy',
    'dashboard.form.save': 'Lưu',
    'assignment.question.title': 'Câu hỏi',
    'assignment.submitted': 'Đã nộp',
    'assignment.notSubmitted': 'Chưa nộp',
  }
};

interface I18nContextValue {
  lang: SupportedLang;
  t: (key: string, vars?: Record<string,string|number>) => string;
  setLang: (lang: SupportedLang) => void;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const STORAGE_KEY = 'app_lang';
const DEFAULT_LANG: SupportedLang = 'en';

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<SupportedLang>(DEFAULT_LANG);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as SupportedLang | null;
    if (stored && dictionaries[stored]) {
      setLangState(stored);
    }
  }, []);

  const setLang = useCallback((l: SupportedLang) => {
    setLangState(l);
    localStorage.setItem(STORAGE_KEY, l);
  }, []);

  const t = useCallback((key: string, vars?: Record<string,string|number>) => {
    const dict = dictionaries[lang] || dictionaries[DEFAULT_LANG];
    let phrase = dict[key] || dictionaries[DEFAULT_LANG][key] || key;
    if (vars) {
      Object.keys(vars).forEach(k => {
        phrase = phrase.replace(new RegExp(`{${k}}`, 'g'), String(vars[k]));
      });
    }
    return phrase;
  }, [lang]);

  const value = useMemo(() => ({ lang, t, setLang }), [lang, t, setLang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

export function translateLanguageId(id: string): SupportedLang | null {
  switch (id) {
    case 'english': return 'en';
    case 'malay': return 'ms';
    case 'tamil': return 'ta';
    case 'chinese': return 'zh';
    case 'thai': return 'th';
    case 'indonesian': return 'id';
    case 'filipino': return 'fil';
    case 'khmer': return 'km';
    case 'lao': return 'lo';
    case 'burmese': return 'my';
    case 'vietnamese': return 'vi';
    default: return null;
  }
}
