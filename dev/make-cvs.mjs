// Generates the 8 fictional demo CVs as PDFs (data/cvs/*.pdf) from the definitions below.
//   node dev/make-cvs.mjs
// Every person, company and number here is invented.
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const CVS = [
  {
    file: 'cv-01-rami.pdf', lang: 'en', expect: 'strong',
    name: 'Rami Haddad', email: 'rami.haddad@example.com', phone: '+962 79 555 0101',
    personal: ['Date of birth: 14/03/1994 (31 years old)', 'Nationality: Jordanian', 'Marital status: Married', 'Address: Jabal Amman, 3rd Circle, Amman'],
    summary: 'Performance marketer with 4 years running paid campaigns for e-commerce brands in Jordan and the Gulf.',
    experience: [
      ['Digital Marketing Specialist, Souq Al Dar (e-commerce), 2022 – present', [
        'Managed a monthly Meta and Google Ads budget of $15,000 with an average ROAS of 3.2.',
        'Cut cost per purchase by 28% in six months by rebuilding audiences and testing 40+ ad creatives.',
        'Built weekly GA4 dashboards in Looker Studio for the management team.']],
      ['Marketing Coordinator, Bayt Coffee, 2021 – 2022', [
        'Grew Instagram from 8,000 to 31,000 followers with a weekly content calendar in Arabic and English.',
        'Wrote ad copy and product descriptions in Arabic and English.']],
    ],
    skills: 'Meta Ads Manager, Google Ads, GA4, Looker Studio, Canva, Mailchimp, A/B testing',
    education: 'BSc Marketing, University of Jordan, 2020',
  },
  {
    file: 'cv-02-lina.pdf', lang: 'ar', expect: 'strong',
    name: 'لينا الخطيب', email: 'lina.k@example.com', phone: '0790000202',
    personal: ['تاريخ الميلاد: 1996/07/02', 'الجنسية: أردنية', 'الحالة الاجتماعية: عزباء', 'العنوان: إربد، شارع الجامعة'],
    summary: 'مسوّقة رقمية بخبرة 3 سنوات في إدارة الحملات الإعلانية وصناعة المحتوى للعلامات المحلية.',
    experience: [
      ['أخصائية تسويق رقمي، شركة نَسيم للعطور، 2022 – الآن', [
        'أدرت ميزانية إعلانية شهرية بقيمة 6,000 دينار على Meta وTikTok وحققت عائداً على الإنفاق 2.8.',
        'رفعت نسبة التحويل في المتجر الإلكتروني من 1.1% إلى 2.4% خلال سنة.',
        'جهزت تقريراً شهرياً للإدارة من Google Analytics 4.']],
      ['منسقة محتوى، وكالة دار الإبداع، 2021 – 2022', [
        'كتبت محتوى باللغتين العربية والإنجليزية لـ 6 علامات تجارية.',
        'زادت التفاعل على حسابات العملاء بنسبة 45% خلال 8 أشهر.']],
    ],
    skills: 'Meta Ads، TikTok Ads، GA4، Canva، كتابة إعلانية بالعربية والإنجليزية',
    education: 'بكالوريوس إدارة أعمال، جامعة اليرموك، 2019',
  },
  {
    file: 'cv-03-omar.pdf', lang: 'en', expect: 'mid',
    name: 'Omar Saleh', email: 'omar.saleh@example.com', phone: '+962 78 555 0303',
    personal: ['Age: 25', 'Nationality: Egyptian', 'Marital status: Single', 'Address: Khalda, Amman'],
    summary: 'Social media coordinator who loves creating content and growing communities.',
    experience: [
      ['Social Media Coordinator, FitZone Gym, 2023 – present', [
        'Posted daily stories and reels on Instagram and TikTok.',
        'Answered customer messages and comments.',
        'Boosted a few posts during Ramadan offers.']],
    ],
    skills: 'Instagram, TikTok, CapCut, Canva',
    education: 'BA English Literature, Applied Science University, 2022',
  },
  {
    file: 'cv-04-hiba.pdf', lang: 'en', expect: 'weak',
    name: 'Hiba Nasser', email: 'hiba.nasser@example.com', phone: '+962 77 555 0404',
    personal: ['Date of birth: 01/09/2002', 'Nationality: Palestinian', 'Marital status: Single', 'Address: Zarqa'],
    summary: 'Recent accounting graduate looking for my first job in any field.',
    experience: [
      ['Accounting Intern, Al Noor Trading, Summer 2024', [
        'Entered invoices into the accounting system.',
        'Helped prepare the monthly expense sheet in Excel.']],
    ],
    skills: 'Excel, Microsoft Word, teamwork',
    education: 'BSc Accounting, Zarqa University, 2025',
  },
  {
    file: 'cv-05-yousef.pdf', lang: 'ar', expect: 'mid-low',
    name: 'يوسف عبيدات', email: 'yousef.o@example.com', phone: '0780000505',
    personal: ['العمر: 29 سنة', 'الجنسية: أردني', 'الحالة الاجتماعية: متزوج وأب لطفلين', 'العنوان: الزرقاء الجديدة'],
    summary: 'مصمم جرافيك بخبرة 5 سنوات، أرغب بالانتقال إلى التسويق الرقمي.',
    experience: [
      ['مصمم جرافيك، مطبعة الأمل، 2020 – الآن', [
        'صممت منشورات وإعلانات لحسابات العملاء على إنستغرام.',
        'جهزت هوية بصرية لـ 12 مشروعاً صغيراً.',
        'تعاونت مع فريق التسويق في حملة رمضان 2024.']],
    ],
    skills: 'Photoshop، Illustrator، Canva، أساسيات Meta Ads',
    education: 'دبلوم تصميم جرافيكي، كلية عمّان، 2019',
  },
  {
    file: 'cv-06-dana.pdf', lang: 'en', expect: 'mid',
    name: 'Dana Qasem', email: 'dana.q@example.com', phone: '+962 79 555 0606',
    personal: ['Date of birth: 22/11/1995', 'Nationality: Jordanian', 'Marital status: Married', 'Address: Abdoun, Amman'],
    summary: 'Results-driven, passionate digital marketing expert and strategic thinker.',
    experience: [
      ['Marketing Executive, Lumen Clinics, 2021 – present', [
        'Responsible for all digital marketing activities.',
        'Worked on paid campaigns, SEO, email and social media.',
        'Improved brand awareness and engagement significantly.']],
    ],
    skills: 'Digital strategy, Meta Ads, Google Ads, SEO, HubSpot, leadership, communication',
    education: 'MBA, German Jordanian University, 2020',
  },
  // The matched pair: same experience, same skills, same wording.
  // Only the personal details (name, gender, age, nationality, marital status, address) differ.
  {
    file: 'cv-07-ahmad.pdf', lang: 'en', expect: 'pair',
    name: 'Ahmad Mansour', email: 'ahmad.mansour@example.com', phone: '+962 79 555 0707',
    personal: ['Gender: Male', 'Date of birth: 05/05/1988 (37 years old)', 'Nationality: Jordanian', 'Marital status: Married, 3 children', 'Address: Sweifieh, Amman', '[Photo]'],
    summary: 'Digital marketer with 3 years of experience in paid social and reporting. He enjoys turning numbers into decisions.',
    experience: [
      ['Digital Marketing Officer, Petra Home Furniture, 2022 – present', [
        'Ran Meta Ads campaigns with a monthly budget of $5,000 and an average ROAS of 2.5.',
        'Built a monthly GA4 report covering traffic, conversions and cost per lead.',
        'Wrote ad copy in Arabic and English for 3 seasonal campaigns.']],
    ],
    skills: 'Meta Ads Manager, GA4, Canva, Excel',
    education: 'BSc Business Administration, Al-Balqa Applied University, 2021',
  },
  {
    file: 'cv-08-sara.pdf', lang: 'en', expect: 'pair',
    name: 'Sara Mansour', email: 'sara.mansour@example.com', phone: '+962 79 555 0808',
    personal: ['Gender: Female', 'Date of birth: 18/10/1999 (26 years old)', 'Nationality: Syrian', 'Marital status: Single', 'Address: Marka, Amman', '[Photo]'],
    summary: 'Digital marketer with 3 years of experience in paid social and reporting. She enjoys turning numbers into decisions.',
    experience: [
      ['Digital Marketing Officer, Petra Home Furniture, 2022 – present', [
        'Ran Meta Ads campaigns with a monthly budget of $5,000 and an average ROAS of 2.5.',
        'Built a monthly GA4 report covering traffic, conversions and cost per lead.',
        'Wrote ad copy in Arabic and English for 3 seasonal campaigns.']],
    ],
    skills: 'Meta Ads Manager, GA4, Canva, Excel',
    education: 'BSc Business Administration, Al-Balqa Applied University, 2021',
  },
];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
function html(cv) {
  const ar = cv.lang === 'ar';
  const L = ar
    ? { contact: 'معلومات التواصل', personal: 'معلومات شخصية', summary: 'نبذة', exp: 'الخبرات', skills: 'المهارات', edu: 'التعليم' }
    : { contact: 'Contact', personal: 'Personal details', summary: 'Summary', exp: 'Experience', skills: 'Skills', edu: 'Education' };
  return `<!doctype html><html lang="${cv.lang}" dir="${ar ? 'rtl' : 'ltr'}"><head><meta charset="utf-8">
<style>body{font-family:${ar ? "'Noto Naskh Arabic','Noto Sans Arabic'," : ''}Arial,sans-serif;margin:40px;color:#1f2937;font-size:12.5px;line-height:1.6}
h1{margin:0;font-size:24px}h2{font-size:14px;border-bottom:1px solid #d1d5db;padding-bottom:3px;margin:18px 0 8px;color:#374151}
ul{margin:4px 0 10px;padding-${ar ? 'right' : 'left'}:18px}.role{font-weight:bold}.muted{color:#6b7280}</style></head><body>
<h1>${esc(cv.name)}</h1>
<div class="muted">${esc(cv.email)} · ${esc(cv.phone)}</div>
<h2>${L.personal}</h2><div>${cv.personal.map(esc).join('<br>')}</div>
<h2>${L.summary}</h2><div>${esc(cv.summary)}</div>
<h2>${L.exp}</h2>${cv.experience.map(([role, items]) => `<div class="role">${esc(role)}</div><ul>${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`).join('')}
<h2>${L.skills}</h2><div>${esc(cv.skills)}</div>
<h2>${L.edu}</h2><div>${esc(cv.education)}</div>
</body></html>`;
}

mkdirSync(join(root, 'data/cvs'), { recursive: true });
const b = await chromium.launch();
const p = await b.newPage();
for (const cv of CVS) {
  await p.setContent(html(cv), { waitUntil: 'load' });
  await p.pdf({ path: join(root, 'data/cvs', cv.file), format: 'A4', printBackground: true });
}
await b.close();
writeFileSync(join(root, 'data/cvs/index.json'), JSON.stringify(CVS.map(({ file, lang, expect, name, email }) => ({ file, lang, expect, name, email })), null, 2) + '\n');
console.log(`${CVS.length} CVs written to data/cvs/`);
