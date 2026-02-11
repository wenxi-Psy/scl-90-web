import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, Activity, AlertCircle, Loader2 } from "lucide-react";

const FACTOR_COLORS: Record<string, string> = {
  躯体化: "#ef4444",
  强迫症状: "#f97316",
  人际敏感: "#eab308",
  抑郁: "#3b82f6",
  焦虑: "#8b5cf6",
  敌对: "#ec4899",
  恐怖: "#06b6d4",
  偏执: "#14b8a6",
  精神病性: "#f59e0b",
  其他: "#6b7280",
};

export default function Analytics() {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  
  // Fetch overview data
  const { data: overview, isLoading: overviewLoading } = trpc.analytics.getOverview.useQuery();
  
  // Fetch period-specific data
  const { data: periodData, isLoading: periodLoading } = trpc.analytics.getByPeriod.useQuery({
    period,
    limit: 12,
  });

  const isLoading = overviewLoading || periodLoading;

  // Prepare chart data
  const trendData = useMemo(() => {
    return overview?.recentTrend || [];
  }, [overview]);

  const factorData = useMemo(() => {
    if (!overview?.factorPrevalence) return [];
    return Object.entries(overview.factorPrevalence).map(([name, value]) => ({
      name,
      value: typeof value === "number" ? value : 0,
    }));
  }, [overview]);

  const periodChartData = useMemo(() => {
    if (!periodData?.data) return [];
    return periodData.data.map((item) => ({
      date: item.date,
      assessments: item.totalAssessments,
      avgScore: item.averageTotalScore,
      users: item.totalUsers,
    }));
  }, [periodData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-slate-600">加载分析数据中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-slate-900">数据分析仪表板</h1>
          </div>
          <p className="text-slate-600 text-sm">
            实时查看 SCL-90 评估数据统计、趋势分析和心理维度分布
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-white border-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-2">总评估数</p>
                <p className="text-3xl font-bold text-indigo-600">
                  {overview?.totalAssessments || 0}
                </p>
              </div>
              <Activity className="w-5 h-5 text-indigo-600 opacity-50" />
            </div>
          </Card>

          <Card className="p-6 bg-white border-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-2">参与用户</p>
                <p className="text-3xl font-bold text-blue-600">
                  {overview?.totalUsers || 0}
                </p>
              </div>
              <Users className="w-5 h-5 text-blue-600 opacity-50" />
            </div>
          </Card>

          <Card className="p-6 bg-white border-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-2">平均总分</p>
                <p className="text-3xl font-bold text-purple-600">
                  {overview?.averageTotalScore || "0.00"}
                </p>
              </div>
              <TrendingUp className="w-5 h-5 text-purple-600 opacity-50" />
            </div>
          </Card>

          <Card className="p-6 bg-white border-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-2">平均阳性项数</p>
                <p className="text-3xl font-bold text-orange-600">
                  {overview?.averagePositiveItems || "0.00"}
                </p>
              </div>
              <AlertCircle className="w-5 h-5 text-orange-600 opacity-50" />
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Trend Chart */}
          <Card className="lg:col-span-2 p-6 bg-white border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">近期评估趋势</h2>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#f1f5f9" }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="assessments"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ fill: "#6366f1", r: 4 }}
                    name="评估数"
                  />
                  <Line
                    type="monotone"
                    dataKey="avgScore"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={{ fill: "#f97316", r: 4 }}
                    name="平均分"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-500">
                暂无数据
              </div>
            )}
          </Card>

          {/* Factor Distribution */}
          <Card className="p-6 bg-white border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">维度分布</h2>
            {factorData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={factorData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {factorData.map((entry) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={FACTOR_COLORS[entry.name] || "#6b7280"}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-500">
                暂无数据
              </div>
            )}
          </Card>
        </div>

        {/* Period Analysis */}
        <Card className="p-6 bg-white border-slate-200">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">周期分析</h2>
            <Tabs value={period} onValueChange={(v) => setPeriod(v as "daily" | "weekly" | "monthly")}>
              <TabsList>
                <TabsTrigger value="daily">日</TabsTrigger>
                <TabsTrigger value="weekly">周</TabsTrigger>
                <TabsTrigger value="monthly">月</TabsTrigger>
              </TabsList>

              <TabsContent value={period} className="mt-6">
                {periodChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={periodChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "1px solid #475569",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "#f1f5f9" }}
                      />
                      <Legend />
                      <Bar
                        dataKey="assessments"
                        fill="#6366f1"
                        name="评估数"
                        radius={[8, 8, 0, 0]}
                      />
                      <Bar
                        dataKey="users"
                        fill="#3b82f6"
                        name="用户数"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[400px] flex items-center justify-center text-slate-500">
                    暂无 {period === "daily" ? "日" : period === "weekly" ? "周" : "月"} 数据
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </Card>

        {/* Data Quality Notice */}
        <Card className="mt-8 p-6 bg-blue-50 border border-blue-200">
          <div className="flex gap-4">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">数据说明</h3>
              <p className="text-sm text-blue-800">
                此仪表板展示的是汇总统计数据，所有个人信息已完全匿名化。数据仅用于学术研究和质量改进目的。
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
