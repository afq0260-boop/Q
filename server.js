import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-2.5-flash";

// ========================================
// 🔐 التأكد من وجود المفتاح
// ========================================

if (!API_KEY) {
  console.error("❌ GEMINI_API_KEY غير موجود في Environment Variables");
} else {
  console.log("✅ Gemini API Key موجود");
}

// ========================================
// 🤖 الاتصال بـ Gemini
// ========================================

async function askGemini(prompt) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("🔥 Gemini API Error:", data);

      return "⚠️ حدث خطأ في الاتصال بالذكاء الاصطناعي.";
    }

    return (
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠️ لم يتم استلام رد من الذكاء الاصطناعي."
    );

  } catch (error) {
    console.error("🔥 Gemini Connection Error:", error);

    return "⚠️ حدث خطأ في الاتصال بالذكاء الاصطناعي.";
  }
}

// ========================================
// 🧠 فلترة القدرات الكمية
// ========================================

function isQuantitativeQuestion(text) {
  const forbiddenWords = [
    "لفظي",
    "نحو",
    "إملاء",
    "بلاغة",
    "مرادف",
    "ضد",
    "نص",
    "قصة",
    "تاريخ",
    "جغرافيا",
    "دين",
    "فيزياء",
    "كيمياء",
    "أحياء",
    "برمجة"
  ];

  const message = String(text || "").toLowerCase();

  return !forbiddenWords.some(word =>
    message.includes(word)
  );
}

// ========================================
// 🏠 اختبار السيرفر
// ========================================

app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "🚀 UFUQ AI SERVER RUNNING",
    model: MODEL
  });
});

// ========================================
// 💬 الدردشة الذكية
// ========================================

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        reply: "⚠️ اكتب سؤالك أولًا."
      });
    }

    console.log("📩 Chat:", message);

    if (!isQuantitativeQuestion(message)) {
      return res.json({
        reply:
          "🤍 أعتذر، الدردشة الذكية في منصة أفق مخصصة للقدرات الكمية فقط. اكتب لي مسألة أو مهارة كمي وسأساعدك."
      });
    }

    const prompt = `
أنت المساعد الذكي الرسمي لمنصة أفق (UFUQ).

تخصصك الوحيد:
اختبار القدرات العامة - القسم الكمي.

مهم جدًا:
- لا تجب عن القسم اللفظي.
- لا تجب عن المواد الدراسية العامة.
- إذا كان السؤال خارج القدرات الكمية، اعتذر بلطف واطلب سؤالًا كميًا.
- لا تخترع معلومات.
- إذا كان السؤال حسابيًا بسيطًا، احسبه بدقة.

أسلوب الإجابة:
1️⃣ الإجابة المختصرة
2️⃣ شرح مبسط خطوة بخطوة
3️⃣ مثال مشابه إذا كان مفيدًا

اجعل الإجابة واضحة ومناسبة لطلاب المرحلة الثانوية.

سؤال الطالب:
${message}
`;

    const reply = await askGemini(prompt);

    res.json({
      reply
    });

  } catch (error) {
    console.error("🔥 CHAT ERROR:", error);

    res.status(500).json({
      reply: "⚠️ حدث خطأ أثناء معالجة السؤال."
    });
  }
});

// ========================================
// 📚 الشرح الذكي
// ========================================

app.post("/api/explain", async (req, res) => {
  try {
    const { question, answer } = req.body;

    if (!question) {
      return res.status(400).json({
        result: "⚠️ لم يتم إرسال السؤال."
      });
    }

    const prompt = `
أنت معلم قدرات كمية في منصة أفق.

اشرح السؤال التالي بطريقة سهلة لطالب ثانوي.

الشروط:
- ابدأ بالإجابة الصحيحة.
- ثم اشرح الحل خطوة بخطوة.
- استخدم لغة عربية واضحة.
- استخدم عناوين قصيرة.
- استخدم رموز رياضية عند الحاجة.
- لا تطيل بدون حاجة.
- لا تتحدث عن القسم اللفظي.

السؤال:
${question}

الإجابة الصحيحة:
${answer || "غير محددة"}
`;

    const result = await askGemini(prompt);

    res.json({
      result
    });

  } catch (error) {
    console.error("🔥 EXPLAIN ERROR:", error);

    res.status(500).json({
      result: "⚠️ حدث خطأ أثناء إنشاء الشرح."
    });
  }
});

// ========================================
// 🔄 سؤال مشابه
// ========================================

app.post("/api/similar", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        result: "⚠️ لم يتم إرسال السؤال."
      });
    }

    const prompt = `
أنت متخصص في إعداد أسئلة القدرات الكمية.

أنشئ سؤالًا جديدًا مشابهًا للسؤال التالي في:
- الفكرة
- المهارة
- مستوى الصعوبة

لكن لا تنسخ السؤال نفسه.

الشروط:
- سؤال واحد فقط.
- 4 خيارات.
- الخيارات A و B و C و D.
- حدد الإجابة الصحيحة.
- أعط شرحًا مختصرًا للحل.
- السؤال كمي فقط.

السؤال الأصلي:
${question}
`;

    const result = await askGemini(prompt);

    res.json({
      result
    });

  } catch (error) {
    console.error("🔥 SIMILAR ERROR:", error);

    res.status(500).json({
      result: "⚠️ حدث خطأ أثناء إنشاء السؤال المشابه."
    });
  }
});

// ========================================
// 📅 خطة المذاكرة
// ========================================

app.post("/api/plan", async (req, res) => {
  try {
    const { level, weeks } = req.body;

    if (!level || !weeks) {
      return res.status(400).json({
        plan: "⚠️ يجب إرسال المستوى وعدد الأسابيع."
      });
    }

    const prompt = `
أنت مساعد تعليمي في منصة أفق.

أنشئ خطة مذاكرة للقدرات الكمية فقط.

مستوى الطالب:
${level}

عدد الأسابيع:
${weeks}

الشروط:
- الخطة للقسم الكمي فقط.
- قسم الخطة على أسابيع.
- داخل كل أسبوع حدد المهارات.
- أضف أيام تدريب.
- أضف يوم راحة خفيفة.
- اجعل الخطة عملية ومناسبة لطالب ثانوي.
- استخدم تنسيقًا واضحًا.
- لا تضف القسم اللفظي.
`;

    const plan = await askGemini(prompt);

    res.json({
      plan
    });

  } catch (error) {
    console.error("🔥 PLAN ERROR:", error);

    res.status(500).json({
      plan: "⚠️ حدث خطأ أثناء إنشاء خطة المذاكرة."
    });
  }
});

// ========================================
// 🚀 تشغيل السيرفر
// ========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 UFUQ AI SERVER RUNNING ON PORT ${PORT}`);
});
