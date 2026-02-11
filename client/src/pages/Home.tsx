import { useState, useMemo, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, AlertCircle, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

/**
 * Design Philosophy: Modern Medical Aesthetic
 * - Clear information hierarchy with calm, professional visual language
 * - Soft transitions and careful spacing for accessibility
 * - Balance between data visualization and human care
 * - Color: Indigo primary (#6366f1) for trust and professionalism
 */

interface Question {
  id: number;
  text: string;
}

interface FactorDef {
  ids: number[];
  desc: string;
}

const questions: Question[] = [
  { id: 1, text: "头痛" },
  { id: 2, text: "神经过敏，心中不踏实" },
  { id: 3, text: "头脑中有不必要的想法或字句盘旋" },
  { id: 4, text: "头晕和昏倒" },
  { id: 5, text: "对异性的兴趣减退" },
  { id: 6, text: "对旁人责备求全" },
  { id: 7, text: "感到别人能控制您的思想" },
  { id: 8, text: "责怪别人制造麻烦" },
  { id: 9, text: "忘记性大" },
  { id: 10, text: "容易烦恼和激动" },
  { id: 11, text: "胸痛" },
  { id: 12, text: "害怕空旷的场所或街道" },
  { id: 13, text: "感到自己的精力下降，活动减慢" },
  { id: 14, text: "想结束自己的生命" },
  { id: 15, text: "听到旁人听不到的声音" },
  { id: 16, text: "发抖" },
  { id: 17, text: "感到大多数人都不可信任" },
  { id: 18, text: "胃口不好" },
  { id: 19, text: "容易哭泣" },
  { id: 20, text: "同异性相处时感到害羞不自在" },
  { id: 21, text: "感到受骗、中了圈套或有人想抓住您" },
  { id: 22, text: "无缘无故地突然感到害怕" },
  { id: 23, text: "自己不能控制地发脾气" },
  { id: 24, text: "怕单独出门" },
  { id: 25, text: "经常责怪自己" },
  { id: 26, text: "腰痛" },
  { id: 27, text: "感到难以完成任务" },
  { id: 28, text: "感到孤独" },
  { id: 29, text: "感到苦闷" },
  { id: 30, text: "过分担忧" },
  { id: 31, text: "对事物不感兴趣" },
  { id: 32, text: "感到害怕" },
  { id: 33, text: "我的感情容易受到伤害" },
  { id: 34, text: "旁人能知道您的私下想法" },
  { id: 35, text: "感到别人不理解您不同情您" },
  { id: 36, text: "感到人们对您不友好，不喜欢您" },
  { id: 37, text: "做事必须做得很慢以保证做得正确" },
  { id: 38, text: "心跳得很厉害" },
  { id: 39, text: "恶心或胃部不舒服" },
  { id: 40, text: "感到比不上他人" },
  { id: 41, text: "肌肉酸痛" },
  { id: 42, text: "感到有人在监视您谈论您" },
  { id: 43, text: "难以入睡" },
  { id: 44, text: "做事必须反复检查" },
  { id: 45, text: "难以作出决定" },
  { id: 46, text: "怕乘电车、公共汽车、地铁或火车" },
  { id: 47, text: "呼吸有困难" },
  { id: 48, text: "一阵阵发冷或发热" },
  { id: 49, text: "因为感到害怕而避开某些东西、场合或活动" },
  { id: 50, text: "脑子变空了" },
  { id: 51, text: "身体发麻或刺痛" },
  { id: 52, text: "喉咙有梗塞感" },
  { id: 53, text: "感到没有前途没有希望" },
  { id: 54, text: "不能集中注意" },
  { id: 55, text: "感到身体的某一部分软弱无力" },
  { id: 56, text: "感到紧张或容易紧张" },
  { id: 57, text: "感到手或脚发重" },
  { id: 58, text: "想到死亡的事" },
  { id: 59, text: "吃得太多" },
  { id: 60, text: "当别人看着您或谈论您时感到不自在" },
  { id: 61, text: "有一些不属于您自己的想法" },
  { id: 62, text: "有想打人或伤害他人的冲动" },
  { id: 63, text: "醒得太早" },
  { id: 64, text: "必须反复洗手、点数目或触摸某些东西" },
  { id: 65, text: "睡得不稳不深" },
  { id: 66, text: "有想摔坏或破坏东西的冲动" },
  { id: 67, text: "有一些别人没有的想法或念头" },
  { id: 68, text: "感到对别人神经过敏" },
  { id: 69, text: "在商店或电影院等人多的地方感到不自在" },
  { id: 70, text: "感到任何事情都很困难" },
  { id: 71, text: "一阵阵恐惧或惊恐" },
  { id: 72, text: "感到在公共场合吃东西很不舒服" },
  { id: 73, text: "经常与人争论" },
  { id: 74, text: "单独一人时神经很紧张" },
  { id: 75, text: "别人对您的成绩没有作出恰当的评价" },
  { id: 76, text: "即使和别人在一起也感到孤单" },
  { id: 77, text: "感到坐立不安心神不定" },
  { id: 78, text: "感到自己没有什么价值" },
  { id: 79, text: "感到熟悉的东西变成陌生或不像是真的" },
  { id: 80, text: "大叫或摔东西" },
  { id: 81, text: "害怕会在公共场合昏倒" },
  { id: 82, text: "感到别人想占您的便宜" },
  { id: 83, text: "为一些有关性的想法而很苦恼" },
  { id: 84, text: "您认为应该因为自己的过错而受到惩罚" },
  { id: 85, text: "感到要赶快把事情做完" },
  { id: 86, text: "感到自己的身体有严重问题" },
  { id: 87, text: "从未感到和其他人很亲近" },
  { id: 88, text: "感到自己有罪" },
  { id: 89, text: "感到自己的脑子有毛病" },
  { id: 90, text: "感到自己的脑子有毛病" },
];

const factorDefs: Record<string, FactorDef> = {
  躯体化: { ids: [1, 4, 12, 27, 40, 42, 48, 49, 52, 53, 56, 58], desc: "反映身体不适感，如头痛、心悸、肌肉酸痛及各种疼痛。" },
  强迫症状: { ids: [3, 9, 10, 28, 38, 45, 46, 51, 55, 65], desc: "反映难以摆脱的无意义思想、冲动、行为，以及认知障碍。" },
  人际敏感: { ids: [6, 21, 34, 36, 37, 41, 61, 69, 73], desc: "反映社交中的不自在感、自卑感及对他人的评价敏感。" },
  抑郁: { ids: [5, 14, 15, 20, 22, 26, 29, 30, 31, 32, 54, 71, 79], desc: "反映情绪低落、悲观、生活兴趣减退及动力下降。" },
  焦虑: { ids: [2, 17, 23, 33, 39, 57, 72, 78, 80, 86], desc: "反映神经过敏、紧张、烦躁、恐惧感及躯体焦虑表现。" },
  敌对: { ids: [11, 24, 63, 67, 74, 81], desc: "反映愤怒和冲动控制。包括烦恼、爆发脾气、争论及伤害冲动。" },
  恐怖: { ids: [13, 25, 47, 50, 70, 75, 82], desc: "反映对特定环境（如空旷场所、人群、交通工具）的非理性恐惧。" },
  偏执: { ids: [8, 18, 43, 68, 76, 83], desc: "反映思维倾向。包括猜疑、受骗感、不信任感及思维狭隘。" },
  精神病性: { ids: [7, 16, 35, 62, 77, 84, 85, 87, 88, 90], desc: "反映孤独感、被动体验、以及幻觉或特殊的思维逻辑。" },
  其他: { ids: [19, 44, 59, 60, 64, 66, 89], desc: "反映基础生理功能，如近期睡眠质量与饮食状况。" },
};

const options = ["无", "轻", "中", "重", "极重"];

export default function Home() {
  const [scores, setScores] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const questionRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Track scroll position to hide header content on mobile
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAnswer = (questionId: number, value: number): void => {
    setScores((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const saveMutation = trpc.assessment.save.useMutation();

  const handleSubmit = async (): Promise<void> => {
    const unanswered = questions.find((q) => !(q.id in scores));
    if (unanswered) {
      // Smart jump to first unanswered question
      const element = questionRefs.current[unanswered.id];
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        // Highlight the unanswered question
        element.classList.add("ring-2", "ring-red-500");
        setTimeout(() => {
          element.classList.remove("ring-2", "ring-red-500");
        }, 3000);
      }
      return;
    }

    // Calculate results
    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    const posCount = Object.values(scores).filter((v) => v >= 2).length;
    const avg = (total / questions.length).toFixed(2);

    const factors: Record<string, number> = {};
    for (const [name, def] of Object.entries(factorDefs)) {
      const sum = def.ids.reduce((a, id) => a + (scores[id] || 0), 0);
      factors[name] = sum / def.ids.length;
    }

    // Save to database
    if (saveMutation) {
      try {
        await saveMutation.mutateAsync({
          responses: questions.map((q) => scores[q.id] || 0),
          totalScore: total,
          positiveItemCount: posCount,
          averageScore: avg,
          factorScores: factors,
          isAnonymous: false,
        });
      } catch (error) {
        console.error("Failed to save assessment:", error);
        // Still show results even if save fails
      }
    }

    setShowResults(true);
    setTimeout(() => {
      document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };;

  const results = useMemo(() => {
    if (!showResults) return null;

    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    const posCount = Object.values(scores).filter((v) => v >= 2).length;
    const avg = (total / questions.length).toFixed(2);

    const factors: Record<string, number> = {};
    for (const [name, def] of Object.entries(factorDefs)) {
      const sum = def.ids.reduce((a, id) => a + (scores[id] || 0), 0);
      factors[name] = sum / def.ids.length;
    }

    return { total, posCount, avg, factors };
  }, [scores, showResults]);

  const progress = useMemo(() => {
    return Math.round((Object.keys(scores).length / questions.length) * 100);
  }, [scores]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header - Responsive sticky header */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        {/* Title - always visible */}
        <div className="max-w-4xl mx-auto px-4 py-3 sm:py-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600 flex-shrink-0" />
            <h1 className="text-xl sm:text-3xl font-bold text-slate-900">SCL-90 症状自评量表</h1>
          </div>
        </div>
        
        {/* Description and Privacy - hidden on scroll on mobile */}
        {scrollY <= 100 && (
          <div className="max-w-4xl mx-auto px-4 pb-4 sm:pb-6">
            <p className="text-slate-600 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
              症状自评量表（SCL-90）由 Derogatis 在 1973 年编制，是全球公认的心理健康筛查工具。本系统采用中国常模标准，评估涵盖躯体化、焦虑、抑郁等 10 个核心心理维度。
            </p>
            
            {/* Privacy Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 flex gap-2 sm:gap-3">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-blue-900">
                <strong>隐私保护声明：</strong>您的评估数据将被安全存储，采用匿名方式处理，不会用于发布。仅有系统管理员可访问您的个人信息，所有数据严格保密。
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-4 sm:py-8">
        {!showResults ? (
          <>
            {/* Instructions */}
            <Card className="mb-6 sm:mb-8 bg-slate-50 border-slate-200 p-4 sm:p-6">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2 text-sm sm:text-base">测评说明</h3>
                  <p className="text-slate-700 text-xs sm:text-sm">
                    请根据您<strong>最近一周</strong>的真实感受答题。请按第一直觉勾选最符合的一项。
                  </p>
                </div>
              </div>
            </Card>

            {/* Progress Bar */}
            <div className="mb-6 sm:mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs sm:text-sm font-medium text-slate-700">答题进度</span>
                <span className="text-xs sm:text-sm font-semibold text-indigo-600">{progress}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-3 sm:space-y-4 mb-24 sm:mb-32">
              {questions.map((q) => (
                <Card
                  key={q.id}
                  ref={(el) => {
                    if (el) questionRefs.current[q.id] = el;
                  }}
                  className={`p-4 sm:p-6 border-2 transition-all duration-200 ${
                    scores[q.id]
                      ? "border-indigo-300 bg-indigo-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="mb-3 sm:mb-4">
                    <h3 className="text-slate-900 font-medium text-sm sm:text-base">
                      <span className="text-indigo-600 font-bold">{q.id}.</span> {q.text}
                    </h3>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {options.map((opt, idx) => (
                      <label key={idx} className="cursor-pointer">
                        <input
                          type="radio"
                          name={`q${q.id}`}
                          value={idx + 1}
                          checked={scores[q.id] === idx + 1}
                          onChange={() => handleAnswer(q.id, idx + 1)}
                          className="sr-only"
                        />
                        <div
                          className={`p-2 sm:p-3 rounded-lg text-center text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                            scores[q.id] === idx + 1
                              ? "bg-indigo-600 text-white border-2 border-indigo-600"
                              : "bg-slate-100 text-slate-700 border-2 border-transparent hover:bg-slate-200"
                          }`}
                        >
                          {opt}
                        </div>
                      </label>
                    ))}
                  </div>
                </Card>
              ))}
            </div>

            {/* Citation */}
            <div className="text-center text-xs text-slate-500 mb-8">
              参考文献：金华,吴文源,张明园.中国正常人SCL-90评定结果的初步分析[J].中国神经精神疾病杂志, 1986(5):260-263.
            </div>
          </>
        ) : (
          /* Results View */
          <div id="results" className="space-y-8">
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center border-b-2 border-slate-200 pb-4">
                测评结果概览
              </h2>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 sm:gap-6 mb-8">
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 sm:p-6 border border-slate-200">
                  <div className="text-xs sm:text-sm text-slate-600 mb-2">总分</div>
                  <div className={`text-2xl sm:text-3xl font-bold ${results!.total >= 160 ? "text-red-600" : "text-indigo-600"}`}>
                    {results!.total}
                  </div>
                  <div className="text-xs text-slate-500 mt-2">参考值: &lt;160</div>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 sm:p-6 border border-slate-200">
                  <div className="text-xs sm:text-sm text-slate-600 mb-2">阳性项数</div>
                  <div className={`text-2xl sm:text-3xl font-bold ${results!.posCount >= 43 ? "text-red-600" : "text-indigo-600"}`}>
                    {results!.posCount}
                  </div>
                  <div className="text-xs text-slate-500 mt-2">参考值: &lt;43</div>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 sm:p-6 border border-slate-200">
                  <div className="text-xs sm:text-sm text-slate-600 mb-2">总均分</div>
                  <div className="text-2xl sm:text-3xl font-bold text-indigo-600">{results!.avg}</div>
                  <div className="text-xs text-slate-500 mt-2">平均每项得分</div>
                </div>
              </div>

              {/* Factor Analysis */}
              <h3 className="text-lg font-semibold text-slate-900 mb-4">维度因子分解析 (≥2.0 提示需关注)</h3>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8">
                {Object.entries(factorDefs).map(([name, def]) => {
                  const score = results!.factors[name];
                  const isHigh = score >= 2.0;
                  return (
                    <div
                      key={name}
                      className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${
                        isHigh
                          ? "bg-red-50 border-red-200"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="font-semibold text-slate-900 mb-1 text-sm sm:text-base">{name}</div>
                      <div className={`text-xl sm:text-2xl font-bold ${isHigh ? "text-red-600" : "text-indigo-600"}`}>
                        {score.toFixed(2)}
                      </div>
                      {isHigh && (
                        <div className="text-xs text-red-700 mt-2 flex items-start gap-1">
                          <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span>需要关注</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Analysis */}
              <div className="bg-slate-50 rounded-lg p-4 sm:p-6 border border-slate-200 mb-8">
                <h4 className="font-semibold text-slate-900 mb-4">评分偏高维度解释</h4>
                {Object.entries(factorDefs)
                  .filter(([name]) => results!.factors[name] >= 2.0)
                  .map(([name, def]) => (
                    <div key={name} className="mb-4 pb-4 border-b border-slate-200 last:border-b-0 last:mb-0 last:pb-0">
                      <div className="font-semibold text-slate-900 mb-2 text-red-600 text-sm sm:text-base">{name}</div>
                      <p className="text-slate-700 text-xs sm:text-sm">{def.desc}</p>
                    </div>
                  ))}
                {Object.entries(factorDefs).filter(([name]) => results!.factors[name] >= 2.0).length === 0 && (
                  <div className="text-green-700 flex items-center gap-2 text-sm sm:text-base">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>各项指标均在参考范围内。</span>
                  </div>
                )}
              </div>

              {/* Disclaimer */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-6">
                <h4 className="font-semibold text-slate-900 mb-3 text-sm sm:text-base">专业声明与局限性说明</h4>
                <ul className="text-xs sm:text-sm text-slate-700 space-y-2">
                  <li>
                    <strong>1. 主观自评工具：</strong>本量表为主观自评工具，结果反映的是受试者近一周内的主观感受，具有较强的时效性。
                  </li>
                  <li>
                    <strong>2. 筛查工具：</strong>测评得分（标红项）仅作为心理健康风险筛查的线索，不代表任何临床诊断结论。
                  </li>
                  <li>
                    <strong>3. 多重因素影响：</strong>心理状态受环境、即时压力、身体健康等多重因素影响。本报告不可替代精神科医生或临床心理学家的专业评估。
                  </li>
                  <li>
                    <strong>4. 寻求帮助：</strong>如您感到持续的心理痛苦或困扰，请务必前往专业医疗机构获取帮助。
                  </li>
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 sm:gap-4 justify-center flex-col sm:flex-row">
              <Button
                onClick={() => {
                  setScores({});
                  setShowResults(false);
                }}
                variant="outline"
                className="px-6 py-2 text-sm sm:text-base"
              >
                重新评估
              </Button>
              <Button
                onClick={() => {
                  const csv = generateCSV();
                  downloadCSV(csv);
                }}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-sm sm:text-base"
              >
                导出 CSV 详情
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Bar */}
      {!showResults && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 to-slate-800 border-t border-slate-700 p-4 sm:p-6">
          <div className="max-w-4xl mx-auto flex justify-between items-center flex-col sm:flex-row gap-3 sm:gap-0">
            <div className="text-white text-xs sm:text-sm">
              已完成 <span className="font-bold text-indigo-400">{Object.keys(scores).length}</span> / {questions.length} 题
            </div>
            <Button
              onClick={handleSubmit}
              className="px-6 sm:px-8 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold w-full sm:w-auto text-sm sm:text-base"
            >
              生成报告
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  function generateCSV(): string {
    let csv = "\uFEFF";
    csv += "【维度因子分析】\n";
    csv += "维度名称,因子分,评估结论\n";

    for (const [name, def] of Object.entries(factorDefs)) {
      const sum = def.ids.reduce((a, id) => a + (scores[id] || 0), 0);
      const avg = (sum / def.ids.length).toFixed(2);
      const status = parseFloat(avg) >= 2.0 ? "需关注" : "正常";
      csv += `${name},${avg},${status}\n`;
    }

    csv += "\n";
    csv += "【90项原始答卷详情】\n";
    csv += "题号,条目内容,所属维度,得分\n";

    for (const q of questions) {
      let dimension = "其他";
      for (const [name, def] of Object.entries(factorDefs)) {
        if (def.ids.includes(q.id)) {
          dimension = name;
          break;
        }
      }
      csv += `${q.id},${q.text},${dimension},${scores[q.id] || 0}\n`;
    }

    return csv;
  }

  function downloadCSV(csv: string) {
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SCL90测评报告_${new Date().toLocaleDateString()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
