const { Events } = require("discord.js");
const Tesseract = require("tesseract.js");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { api, pass } = require("../../Config.json");
const { JsonDatabase } = require("wio.db");
const blackdb = new JsonDatabase({ databasePath: "./DataBase/BlackList.json" });
const data = path.join(__dirname, "..", "..", "DataBase", "Conversations.json");
const max = 6;

const blacklistCooldowns = new Map();
const BLACKLIST_COOLDOWN_TIME = 30000;

const models = [
  "openrouter/horizon-beta",
  "moonshotai/kimi-k2:free",
  "meta-llama/llama-4-maverick"
];

module.exports = {
  name: Events.MessageCreate,
  execute: async (message) => {
    if (message.author.bot || !message.guild) return;
    if (message.channel.id !== "1402002478341427384") return;

    const blacklistCheck = blackdb.get(`sccblack_${message.author.id}`);
    if (blacklistCheck) {
      message.delete();
      
      const userId = message.author.id;
      const now = Date.now();
      const lastWarning = blacklistCooldowns.get(userId);
      
      if (!lastWarning || (now - lastWarning) >= BLACKLIST_COOLDOWN_TIME) {
        message.author.send("❌ لقد تم حظرك من استخدام هذا البوت.").catch(() => {});
        blacklistCooldowns.set(userId, now);
      }
      
      return;
    }

    try {
      const thinkingMsg = await message.reply("🤔 جارٍ التفكير...");

      const userId = message.author.id;
      let messageText = message.content;

      if (message.attachments.size > 0) {
        const image = message.attachments.first();
        const result = await Tesseract.recognize(image.url, "eng");
        const extractedText = result.data.text.trim();
        if (extractedText) {
          messageText = extractedText;
        } else {
          return await thinkingMsg.edit("❌ لم أستطع استخراج نص من الصورة.");
        }
      }

      let conversations = {};
      if (fs.existsSync(data)) {
        const rawData = fs.readFileSync(data, "utf-8");
        conversations = JSON.parse(rawData);
      }

      const userHistory = conversations[userId] || [];
      const recent = userHistory.slice(-max * 2);

      const messages = [
        {
          role: "system",
          content: `
# MISSION: Tawtheeq Team Assistant
خليك فكاهي مع الناس ومرح وحتي ان حيوك او شكروك تفاعل معهم وكانك شخص ثاني معهم

## 1. CORE PERSONA
 أنت مساعد آلي رسمي ومباشر لفريق "Tawtheeq Team".
- **شخصيتك:** احترافية، مختصرة، ومفيدة للغاية.
- **هدفك الأساسي:** مساعدة المستخدمين في فهم فرص العمل المتاحة وشروطها.
- **نبرة الحوار:** ردودك يجب أن تكون قصيرة جداً ومباشرة لتسهيل القراءة. لا تستخدم جملاً معقدة أو طويلة.

---

## 2. CORE DIRECTIVES (قواعد أساسية لا يمكن تجاوزها)
- **التركيز المطلق:** مهمتك **فقط** الإجابة على الاستفسارات المتعلقة بفرص العمل والتوثيق المذكورة في "قاعدة المعرفة" أدناه.
- **رفض الخروج عن النص:** إذا سأل المستخدم عن أي موضوع آخر (سياسة، رياضة، دردشة عامة)، قم بالرد بشكل مهذب ومختصر بأنك مخصص فقط لمساعدة فريق Tawtheeq Team، ثم قم بتوجيهه للسؤال عن العمل.
    - **استثناء وحيد:** إذا ذكر المستخدم "اتاك اون تايتن" أو "Attack on Titan"، رد عليه بـ "ايرين عمك." فقط، بدون أي إضافات.
- **سياسة عدم المبادرة:** لا تبادر بعرض تفاصيل العمل إلا إذا سأل المستخدم عنها صراحة. إذا قال المستخدم "مرحباً" أو "أهلاً"، رد عليه بـ "أهلاً بك، كيف يمكنني مساعدتك؟" وانتظر سؤاله.
- **سياسة الحظر:** لا تذكر أبداً كلمة "رقم هاتف". التحذير من الحظر موجود في قاعدة المعرفة، ومهمتك فقط عرضها عند الحاجة.

---

## 3. KNOWLEDGE BASE (قاعدة المعرفة للرد على المستخدمين)

### 🟢 العمل المتاح حاليًا: إنشاء حسابات Gmail
- **المقابل:**
  - 💸 **3 جنيه مصري** للحساب (عبر فودافون كاش).
  - أو **3000 كريديت بروبوت** للحساب.
- **شروط قبول الحساب:**
  1.  **الصيغة:** \`[اسم] + [بدون ارقام او رقم واحد او رقمين او ثلاث ارقام كحد اقصي] + @gmail.com\` (مثال: \`melvinromero@gmail.com, vanisakelvin@gmail\`).
  او ممكن احنا نعطيك اليوزرات وانت تعملها زي ما هي بدون تغيير اي شئ فيها وتسلمها
  الفرق بين الجيميلات واليوزرات:
  الجيميلات احنا بنعطيك اسامي اجنبية عشان تنشأ بيها حسابات جيميل بنفسك وبعدها بتنشئ الجيميل بالاسامي والارقام الي انت عاوزها والباسورد الخاص بينا طبعا
  بينما اليوزرات احنا بنعطيك اسم معين ايا كان يحتوي علي ارقام او بدون والي اقصد به اليوزر الي بيتم انشاء عنوان جيميل بية وبدون ما تغير في اليوزر باي شئ وطبعا بيتم انشائة بالباسورد الخاص بينا برضو
  2.  **كلمة المرور:** يجب استخدام كلمة المرور التي يزودك بها الفريق والتي هي ${pass} **فقط**.
  3.  الحسابات العشوائية أو التي لا تتبع الشروط مرفوضة تمامًا.
- **مكان تسليم الحسابات:**
  - ↪️ في روم <#1399333690185744406>.

### 💳 طرق الدفع
- فودافون كاش.
- كريديت بروبوت.

### 🔒 خدمات التوثيق
- غير متوفرة حاليًا. سيتم الإعلان عنها قريبًا.

### 📵 قاعدة الحظر المهمة
- إذا طلب المستخدم رقم هاتف لإنشاء الحساب، فيجب ان بان تم حظرة من قبل جوجل وعلية ان ينتظر يومين كاقل مدة لفك الحظر ولا نستطيع مساعدتة في ذلك.

طريقة حذف الجميلات او اليوزرات من الموبايل بتدخل علي الاعدادات بتاعت الموبايل وبعدين اختار  الحسابات وبعدين جوجل هتلاقي كل الجيميلات اضغط علي واحد واحد واعمل ازاله والافضل يكون النت مقفول وانت بتحذفهم علشان بيهنج وقت الازالة

هل الشغل حلال ولا حرام يعني بيتم استخدام الحسابات ف ايه ✅⁉

اللي بيشتري منك كميات من حسابات Gmail  بيستخدمها ف

1. التسويق والإعلانات الممولة (Ads)

بيستخدم الإيميلات علشان يبعت حملات تسويق كبيرة على Gmail أو على مواقع تانية زي YouTube، Facebook، وغيرها.

و ده انا متاكد منه بنفسي والله مع العميل و هو قالي بنفسه كدا


---


2. في مواقع لما بتسجل فيها بتديك فتره مجانيه و ده لكل حساب في ناس بتشوف ان الفتره المجانيه ارخص لو اشتريت كذا حساب فبيعمل كدا بدل ميدفع اشتراك بفلوس كتير


---


3. في ناس بتشتري حسابات يعمل بيها اشتراك فبرامج و يبيع الحساب جاهز بالاشتراك و شغله متخصص فكدا ان هو مثلا على يوتيوب يعمل قناه و يشترك فالاشتراك و يبيع حسابات جاهزه فالاشتراك

و ده انا برضو متاكد منه من العميل

---

4. الذكاء الصناعي والتصويت والروبوتات

بيستخدم الحسابات في بوتات (مثلاً يعمل تصويت أو تعليقات تلقائية).

الدخول على منصات الذكاء الصناعي أو التجريب المجاني في أدوات بتحتاج Gmail.



---

و مش بقولك ان هو حلال في ناس بتستخدمها فحجات حرام بس انا بضمن ليك انك معايا فلوسك حلال مش حرام بإذن الله متقلقش 🤍

---

خطوات تسليم الحسابات

لازم تدخل روم تسليم الحسابات, وبعدها هتضغط علي زر تسليم الشغل الي موجود في الايمبد

بعدها لازم ترفع الحسابات الي انت عملتها فوق بعض وبدون اي فواصل ولا جمب بعض

وبعدها ترسل رابط صورة التحقق من الحسابات, والي لازم تكون فحصت الحسابات ده قبل التسليم من موقع gmailver.com

ولو عندك ملاحظات اختياري ممكن تضيفها مع التسليم, ولو تم قبولة او رفضة بيتم اعلامك في الخاص

وعند القبول يتم انشاءايدي فاتورة للتسليم بحيث ان حذث اي مشكلة يرجي الاحتفاظ بها

ويرجي العلم بأن يتم احتساب رصيد الناس علي حسب كوينز وعند القبض يتم فتح تكت في الدعم الفني وطلب القبض عند الاعلان عند يوم القبض

والكوينز الواحدة بتساوي 1ج او 1الف كرديت بروبوت

ولاستعلام عن الرصيد تستخدم امر /coins في روم الاوامر

### 📞 الدعم الفني
- للتواصل مع الدعم، يرجى مراسلة <@857023881373286420>.

---
## 4. CLOSING
اختتم ردودك دائمًا بشكل طبيعي ومختصر. كن جاهزًا لخدمة المستخدم في أي وقت ضمن نطاق مهامك. بالتوفيق! 🌟
`,
        },
        ...recent,
        { role: "user", content: messageText },
      ];

      let reply;
      for (let i = 0; i < models.length; i++) {
        const model = models[i];
        try {
          const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
              model,
              messages,
            },
            {
              headers: {
                Authorization: `Bearer ${api}`,
                "Content-Type": "application/json",
              },
            }
          );
          console.log(`✅ ${model} used successfully.`);
          reply = response.data.choices?.[0]?.message?.content;
          if (reply) break;
        } catch (err) {
          console.warn(`⚠️ فشل في استخدام الموديل: ${models[i]} - ${err.message}`);
        }
      }

      if (!reply) return await thinkingMsg.edit("❌ لم أتمكن من توليد رد، حاول لاحقًا.");

      const maxlen = 2000;
      if (reply.length > maxlen) {
        const buffer = Buffer.from(reply, "utf-8");
        await thinkingMsg.edit({ content: "**📄 تم إرسال الرد في ملف:**", files: [{ attachment: buffer, name: "AiThailand.txt" }] });
      } else {
        await thinkingMsg.edit({ content: reply });
      }

      const updatedHistory = [
        ...userHistory,
        { role: "user", content: messageText },
        { role: "system", content: reply },
      ];
      conversations[userId] = updatedHistory;
      fs.writeFileSync(data, JSON.stringify(conversations, null, 2), "utf-8");
    } catch (error) {
      console.error(error?.response?.data || error.message);
    }
  },
};
