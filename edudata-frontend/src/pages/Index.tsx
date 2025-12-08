import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import StatsCard from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  GraduationCap,
  Building2,
  FileText,
  TrendingUp,
  Search,
  Briefcase,
  Award,
} from "lucide-react";
import { institutions, students, teachers, schemes, recentPlacements } from "@/data/mockData";
import { useTranslation } from "@/services/i18n";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { t } = useTranslation();

  const totalStudents = institutions.reduce((acc, inst) => acc + inst.studentsCount, 0);
  const totalTeachers = institutions.reduce((acc, inst) => acc + inst.teachersCount, 0);
  const totalInstitutions = institutions.length;
  const totalSchemes = schemes.length;

  const filteredInstitutions = institutions.filter((inst) =>
    inst.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <Navbar />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            EduData Platform
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Unified Education Data Interface - One Nation, One Education Data
          </p>
          
          {/* Revolutionary Demo Button */}
          <div className="mb-6">
            <Link to="/revolutionary-demo">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg px-8 py-4 rounded-full shadow-2xl animate-pulse">
                🚀 Revolutionary Demo 🚀
              </Button>
            </Link>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <Link to="/login?role=student">
              <Button className="bg-gradient-primary hover:opacity-90">
                <GraduationCap className="mr-2 h-4 w-4" />
                Student Portal
              </Button>
            </Link>
            <Link to="/login?role=teacher">
              <Button variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Teacher Portal
              </Button>
            </Link>
            <Link to="/login?role=institution">
              <Button variant="outline">
                <Building2 className="mr-2 h-4 w-4" />
                Institution Portal
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6 text-foreground">National Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Students"
            value={totalStudents.toLocaleString()}
            description="Across all institutions"
            icon={GraduationCap}
            trend="+12% from last year"
            trendUp={true}
          />
          <StatsCard
            title="Total Teachers"
            value={totalTeachers.toLocaleString()}
            description="Faculty members"
            icon={Users}
            trend="+8% from last year"
            trendUp={true}
          />
          <StatsCard
            title="Institutions"
            value={totalInstitutions}
            description="Registered institutes"
            icon={Building2}
          />
          <StatsCard
            title="Active Schemes"
            value={totalSchemes}
            description="Government programs"
            icon={FileText}
            trend="4 launched this year"
            trendUp={true}
          />
        </div>
      </section>

      {/* Recent Placements */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Briefcase className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Recent Placements</h2>
          </div>
          <Badge className="bg-accent text-accent-foreground">
            <TrendingUp className="mr-1 h-3 w-3" />
            Live Updates
          </Badge>
        </div>
        <Card className="p-6">
          <div className="space-y-4">
            {recentPlacements.map((placement) => (
              <div
                key={placement.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">{placement.studentName}</p>
                  <p className="text-sm text-muted-foreground">
                    {placement.institutionName} • {placement.department}
                  </p>
                </div>
                <div className="mt-2 md:mt-0 flex items-center space-x-4">
                  <Badge variant="secondary">{placement.company}</Badge>
                  <span className="text-sm font-semibold text-accent">
                    ₹{placement.package} LPA
                  </span>
                  <span className="text-xs text-muted-foreground hidden md:block">
                    {new Date(placement.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Top Schemes */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-2 mb-6">
          <Award className="h-6 w-6 text-secondary" />
          <h2 className="text-2xl font-bold text-foreground">Top Government Schemes</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {schemes.slice(0, 4).map((scheme) => {
            const progress = (scheme.beneficiaries / (scheme.budget / 4000)) * 100;
            return (
              <Card key={scheme.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{scheme.name}</h3>
                      <Badge variant="outline" className="mt-1">
                        {scheme.type}
                      </Badge>
                    </div>
                    <Badge className="bg-accent text-accent-foreground">{scheme.status}</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Beneficiaries</span>
                      <span className="font-medium text-foreground">
                        {scheme.beneficiaries.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Budget: ₹{(scheme.budget / 10000000).toFixed(1)}Cr</span>
                      <span>{progress.toFixed(0)}% utilized</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{scheme.eligibilityCriteria}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Institution Search */}
      <section className="container mx-auto px-4 py-8 pb-16">
        <h2 className="text-2xl font-bold mb-6 text-foreground">{t("search.institutions")}</h2>
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t("search.placeholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInstitutions.map((institution) => (
            <Card
              key={institution.id}
              className="p-6 hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-foreground">{institution.name}</h3>
                    <p className="text-sm text-muted-foreground">{institution.location}</p>
                  </div>
                  <Badge className="bg-primary text-primary-foreground">
                    NIRF #{institution.nirfRank}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Students</p>
                    <p className="font-semibold text-foreground">
                      {institution.studentsCount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Teachers</p>
                    <p className="font-semibold text-foreground">
                      {institution.teachersCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Placement Rate</p>
                    <p className="font-semibold text-accent">{institution.placementRate}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Performance</p>
                    <p className="font-semibold text-accent">{institution.performanceScore}%</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
