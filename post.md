# LinkedIn post: Day 2

Images, in this order: the scores chart (`assets/scores.svg`, as a PNG) · the blind sheet with the quotes column · the workflow canvas.
Before posting: replace `[X]/25` with the score from `score.md`.

---

## العربي

🗓️ تحدي 7 أيام · 7 مشاريع | اليوم 2 · موارد بشرية 👥

سيرتين ذاتيتين متطابقتين حرفياً. وحدة باسم أحمد، 37 سنة، متزوج. ووحدة باسم سارة، 26 سنة، عزباء.
لو انفرزوا بالنظر، مين برأيك كان رح ياخد المقابلة؟

😩 المشكلة:
الشركات الصغيرة بتفرز السير الذاتية بالعين. الاسم والصورة والعمر بيبيّنوا قبل الخبرة، وأغلب المتقدمين ما بيوصلهم أي رد.

⚙️ اللي بنيته:
workflow على n8n. المتقدم بيرفع سيرته من فورم، والنظام بيشيل منها الاسم والجنس والعمر والجنسية والحالة الاجتماعية قبل ما أي إشي يقيّمها. بعدين بيقيّمها على 5 معايير، و**كل علامة لازم يكون معها جملة منقولة حرفياً من السيرة**. العلامات بشيت والأسماء بشيت منفصل. واللي ما انقبل بيتجهّزله إيميل فيه نقطتين للتطوير، كمسودة بيقرأها الـ HR قبل ما يبعتها.

📊 النتيجة على 8 سير تجريبية (عربي وإنجليزي):
• كل الاقتباسات انفحصت بالكود وطلعت موجودة فعلاً بالسير
• ولا اسم ولا جنسية وصلوا لخطوة التقييم
• أحمد وسارة: 21 و23، الاثنين بالقائمة المختصرة

🧠 قرار تقني:
الموديل ما بيقدر يعطي علامة بدون دليل. الكود بيدوّر على الجملة اللي اقتبسها جوا السيرة، وإذا ما لقاها العلامة بتصير صفر. والمجموع والقرار بيحسبهم الكود، مش الموديل.

🔧 شو ما زبط من أول مرة:
• المفتاح المجاني لـ Gemini بيسمح بـ 20 طلب باليوم، والتجربة بتحتاج 19. نقلت الشغل لرصيد الـ AI المجاني تبع n8n، والتجربة كاملة صارت تخلص بدقيقة.
• الـ PDF العربي طلع بحروف مقلوبة («انيل بيطخلا» بدل «لينا الخطيب»)، وصلّحته قبل ما يوصل للتقييم.
• بأول تشغيل كامل أخذت سارة 18 وأحمد 23. السبب مش انحياز، الموديل كتب اسم حقل غلط، والكود فهمه إنو ما في اقتباس. هاد كان خطأ بكودي، وصلّحته.

🚧 الحدود:
الهدف كان إنو الفرق بين أحمد وسارة يكون نص علامة أو أقل، وطلع علامتين. الموديل ما كان بيعرف مين سارة، لأنو النص اللي وصله كان نفسه، بس هو مش ثابت بعلاماته على المعيار الحدّي. يعني الفرز الأعمى ما بيكفي لحاله، لازم المقيّم كمان يكون ثابت. وهاي أول شغلة رح أصلحها.

📝 تجربة التوثيق اليوم: ADR (سجل قرارات)
ملف قصير لكل قرار مهم: البدائل اللي ما اخترتها وليش. 5 قرارات، من الحروف العربية المقلوبة لحد مين بياخد القرار النهائي.
علامتها: [X]/25

الكود والقرارات والنتائج كاملة:
github.com/Sfditala/blind-cv-screener

بتفرز سير ذاتية بشركتك؟ 👇
#7أيام_7مشاريع #أتمتة #n8n #AI #موارد_بشرية #توظيف

---

## English

🗓️ 7 Days · 7 Projects challenge | Day 2 · HR 👥

Two CVs, word for word the same. One from Ahmad, 37, married. One from Sara, 26, single.
Screened by eye, who do you think gets the interview?

😩 The problem:
Small companies screen CVs by eye. The name, the photo and the age show up before the experience does, and most applicants never hear back.

⚙️ What I built:
An n8n workflow. An applicant uploads a CV through a form, and before anything scores it, the workflow removes the name, gender, age, nationality and marital status. Then it scores the CV on 5 criteria, and **every score needs a sentence copied word for word from the CV**. Scores go to one sheet, names to another. Rejected applicants get an email with two things to improve, saved as a draft for HR to read before sending.

📊 Results on 8 demo CVs, in Arabic and English:
• Every quote was checked by code and found in the CV
• No name or nationality reached the scoring step
• Ahmad and Sara: 21 and 23, both shortlisted

🧠 Technical decision:
The model can't give a score without evidence. Code looks for the quoted sentence in the CV, and if it isn't there the score is 0. The total and the verdict are computed by code, not by the model.

🔧 What broke:
• The free Gemini key allows 20 requests a day, and the demo needs 19. I moved the AI steps to n8n's free AI credits, and the whole demo now runs in a minute.
• Arabic PDFs came out with reversed letters ("انيل بيطخلا" instead of "لينا الخطيب"). I repaired the text before scoring.
• In the first full run Sara got 18 and Ahmad 23. Not bias: the model misnamed a field, and my code read it as "no quote". My bug, now fixed.

🚧 Limits:
The goal was a gap of half a point or less between Ahmad and Sara. It was 2. The model couldn't have known who Sara was, since it got the same text, but it isn't consistent on borderline scores. A blind screen isn't enough on its own; the scorer has to be stable too. That's the first thing I'll fix.

📝 Today's documentation experiment: ADRs (decision records)
One short file per decision, with the options I didn't take and why. 5 decisions, from reversed Arabic letters to who makes the final call.
Score: [X]/25

Code, decisions and results:
github.com/Sfditala/blind-cv-screener

Screening CVs at your company? 👇
#7Days7Projects #Automation #n8n #AI #HR #Hiring
