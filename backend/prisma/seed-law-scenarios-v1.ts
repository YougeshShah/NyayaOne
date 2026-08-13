import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ORIGINAL content -- fact-pattern / scenario-based questions, the style
// real bar and judicial service exams use to test APPLIED legal reasoning,
// not just factual recall of provisions and dates. This complements the
// existing factual-recall questions rather than replacing them -- real
// exams use both styles.

async function main() {
  const admin = await prisma.user.findFirst({ where: { accountType: "COMPANY" } });
  if (!admin) {
    console.error("No COMPANY user found -- run the main seed script first.");
    process.exit(1);
  }

  const lawCourse = await prisma.course.findFirst({ where: { name: "Law Exam Preparation" } });
  if (!lawCourse) {
    console.error("Law Exam Preparation course not found.");
    process.exit(1);
  }

  const criminalLaw = await prisma.subject.findFirst({ where: { name: "Criminal Law", courseId: lawCourse.id } });
  const contractLaw = await prisma.subject.findFirst({ where: { name: "Contract Law", courseId: lawCourse.id } });
  const constitutionalLaw = await prisma.subject.findFirst({ where: { name: "Constitutional Law", courseId: lawCourse.id } });

  if (!criminalLaw || !contractLaw || !constitutionalLaw) {
    console.error("One or more required subjects not found.");
    process.exit(1);
  }

  let created = 0;
  async function addQuestion(subjectId: string, data: any) {
    const existing = await prisma.mcqQuestion.findFirst({ where: { question: data.question } });
    if (!existing) {
      await prisma.mcqQuestion.create({ data: { ...data, subjectId, courseId: lawCourse!.id, examType: "LLB", createdBy: admin!.id } as any });
      created++;
    }
  }

  console.log("Seeding scenario-based (fact-pattern) Law questions...");

  await addQuestion(criminalLaw.id, {
    question:
      "रामले श्यामलाई मार्ने उद्देश्यले बन्दुक तेर्स्यायो र गोली चलायो, तर गोली लाग्न नपाई श्याम भागेर बाँच्यो। रामको कार्य कानूनी रूपमा के मानिन्छ?",
    optionA: "कुनै अपराध होइन, किनकि श्याम बाँचे",
    optionB: "हत्याको प्रयास (Attempt to Murder)",
    optionC: "आत्मरक्षा",
    optionD: "मानव वध",
    correctOption: "B",
    explanation: "मार्ने प्रत्यक्ष प्रयास गरे पनि परिणाम असफल भएमा, त्यो कार्य 'हत्याको प्रयास' अन्तर्गत पर्छ, वास्तविक मृत्यु नभएको हुनाले मात्र अपराध नरहन्छ भन्ने होइन।",
    difficulty: "MEDIUM",
    isFreeDemo: true,
  });

  await addQuestion(criminalLaw.id, {
    question:
      "एक व्यक्तिले अर्को व्यक्तिको घरमा राति चोरी गर्ने उद्देश्यले घुस्यो, तर घरमा कोही नभेट्टाई खाली हात फर्कियो। कुनै सामान चोरी भएन। उसको कार्य के मानिन्छ?",
    optionA: "कुनै कसूर होइन, किनकि केही चोरी भएन",
    optionB: "गृह अतिक्रमण (House Trespass) मात्र",
    optionC: "चोरीको उद्देश्यले गृह अतिक्रमण (एक गम्भीर कसूर)",
    optionD: "डकैती",
    correctOption: "C",
    explanation: "चोरीको नियतले अनधिकृत प्रवेश गरेमा, वास्तविक चोरी नभए पनि 'चोरीको उद्देश्यले गृह अतिक्रमण' कसूर बन्छ, नियत र प्रवेश दुबै पुगेको हुनाले।",
    difficulty: "HARD",
    isFreeDemo: false,
  });

  await addQuestion(contractLaw.id, {
    question:
      "क ले ख लाई आफ्नो घर बेच्ने सम्झौता गर्यो र बयाना रकम बुझ्यो। तर पछि क ले उक्त घर ग लाई बढी मूल्यमा बेचिदियो। ख ले क विरुद्ध के उपचार पाउन सक्छ?",
    optionA: "कुनै उपचार पाउँदैन, किनकि घर बेचिसकियो",
    optionB: "बयाना रकम फिर्ता मात्र माग्न सक्छ",
    optionC: "क्षतिपूर्ति (Damages) को दाबी वा उपयुक्त अवस्थामा विशिष्ट कार्यान्वयन (Specific Performance) समेत माग्न सक्छ",
    optionD: "ग विरुद्ध मात्र मुद्दा चलाउन सक्छ",
    correctOption: "C",
    explanation: "मान्य सम्झौता भंग भएमा पीडित पक्षले क्षतिपूर्ति दाबी गर्न सक्छ, र अचल सम्पत्ति जस्ता अद्वितीय वस्तुको हकमा उपयुक्त अवस्थामा अदालतले विशिष्ट कार्यान्वयनको आदेश समेत दिन सक्छ।",
    difficulty: "MEDIUM",
    isFreeDemo: false,
  });

  await addQuestion(constitutionalLaw.id, {
    question:
      "सरकारले जारी गरेको एउटा ऐनले धर्म परिवर्तन गर्न पूर्ण रूपमा प्रतिबन्ध लगायो, जुन संविधानले प्रत्याभूत गरेको धार्मिक स्वतन्त्रताको मौलिक हकसँग बाझिन्छ भन्ने दाबी छ। यस्तो अवस्थामा पीडित व्यक्तिले के गर्न सक्छ?",
    optionA: "केही गर्न सक्दैन, किनकि ऐन संसदले पास गरेको हो",
    optionB: "सोझै सर्वोच्च अदालतमा मौलिक हक कार्यान्वयनको लागि रिट निवेदन दिन सक्छ",
    optionC: "matra निर्वाचन आयोगमा उजुरी दिन सक्छ",
    optionD: "matra राष्ट्रपति समक्ष निवेदन दिन सक्छ",
    correctOption: "B",
    explanation: "संविधानले प्रत्याभूत गरेको मौलिक हक उल्लंघन भएमा, संसदले पास गरेको ऐन भए पनि, पीडित व्यक्तिले सोझै सर्वोच्च अदालतमा रिट निवेदन दिन सक्छ, यो नै मौलिक हकको संवैधानिक उपचारको प्रमुख माध्यम हो।",
    difficulty: "HARD",
    isFreeDemo: false,
  });

  console.log("\nDone. " + created + " new scenario-based Law question(s) added.");
  console.log("These complement the existing factual-recall questions -- real bar/judicial");
  console.log("exams test both applied reasoning (fact-patterns) and direct legal knowledge.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
