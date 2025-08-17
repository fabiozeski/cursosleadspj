import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Clock, 
  Award, 
  TrendingUp,
  Target,
  Calendar,
  Flame,
  BarChart3,
  Trophy,
  Activity
} from "lucide-react";
import { useStudentMetrics } from "@/hooks/useStudentMetrics";
import { useAuth } from "@/hooks/useAuth";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer 
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const StudentMetrics = () => {
  const { profile } = useAuth();
  const { data: metrics, isLoading } = useStudentMetrics();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-6">
        <div className="text-center text-muted-foreground">
          Erro ao carregar métricas
        </div>
      </div>
    );
  }

  const completionRate = metrics.enrolledCoursesCount > 0 
    ? (metrics.completedCoursesCount / metrics.enrolledCoursesCount) * 100 
    : 0;

  const weeklyProgress = metrics.weeklyGoalHours > 0 
    ? (metrics.weeklyStudiedHours / metrics.weeklyGoalHours) * 100 
    : 0;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'course_enrolled':
        return <BookOpen className="w-4 h-4" />;
      case 'lesson_completed':
        return <Award className="w-4 h-4" />;
      case 'course_completed':
        return <Trophy className="w-4 h-4" />;
      case 'certificate_earned':
        return <Award className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'course_enrolled':
        return 'bg-primary/10 text-primary';
      case 'lesson_completed':
        return 'bg-success/10 text-success';
      case 'course_completed':
        return 'bg-warning/10 text-warning';
      case 'certificate_earned':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="bg-gradient-hero rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Bem vindo(a), {profile?.first_name || 'Estudante'}!
        </h1>
        <p className="text-white/90 text-lg">
          Portal do aluno - Explore e aprenda com nossos cursos.
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Cursos Inscritos
                </p>
                <p className="text-3xl font-bold mt-2">{metrics.enrolledCoursesCount}</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Horas Estudadas
                </p>
                <p className="text-3xl font-bold mt-2">{metrics.totalStudyTimeHours}h</p>
              </div>
              <div className="p-3 rounded-lg bg-warning/10 text-warning">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Certificados
                </p>
                <p className="text-3xl font-bold mt-2">{metrics.certificatesEarned}</p>
              </div>
              <div className="p-3 rounded-lg bg-success/10 text-success">
                <Award className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Sequência Atual
                </p>
                <p className="text-3xl font-bold mt-2">{metrics.currentStreak} dias</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-100 text-orange-600">
                <Flame className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">{activity.title}</h4>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {new Date(activity.date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            ))}
            
            {metrics.recentActivity.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma atividade recente encontrada
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentMetrics;