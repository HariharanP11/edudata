import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import StatsCard from "@/components/StatsCard";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  GraduationCap,
  Building2,
  FileText,
  TrendingUp,
  Search,
  Briefcase,
  Award,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  LogIn,
  ArrowRight,
} from "lucide-react";
import { institutions, students, teachers, schemes, recentPlacements } from "@/data/mockData";
import { useTranslation } from "@/services/i18n";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const { t } = useTranslation();

  const totalStudents = institutions.reduce((acc, inst) => acc + inst.studentsCount, 0);
  const totalTeachers = institutions.reduce((acc, inst) => acc + inst.teachersCount, 0);
  const totalInstitutions = institutions.length;
  const totalSchemes = schemes.length;

  const filteredAndSortedInstitutions = institutions
    .filter((inst) =>
      inst.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sortField) {
        case "placementRate":
          aValue = a.placementRate;
          bValue = b.placementRate;
          break;
        case "performanceScore":
          aValue = a.performanceScore;
          bValue = b.performanceScore;
          break;
        case "studentsCount":
          aValue = a.studentsCount;
          bValue = b.studentsCount;
          break;
        case "teachersCount":
          aValue = a.teachersCount;
          bValue = b.teachersCount;
          break;
        case "nirfRank":
          aValue = a.nirfRank;
          bValue = b.nirfRank;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortOrder === "asc"
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      }
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted relative overflow-hidden">
      {/* Decorative Background Pattern - Dots */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 2px 2px, hsl(var(--primary)) 1px, transparent 0),
            radial-gradient(circle at 2px 2px, hsl(var(--secondary)) 1px, transparent 0)
          `,
          backgroundSize: '80px 80px, 120px 120px',
          backgroundPosition: '0 0, 40px 40px',
        }}
      ></div>
      
      {/* Geometric Pattern Overlay - Checkered */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(45deg, hsl(var(--primary)) 25%, transparent 25%),
            linear-gradient(-45deg, hsl(var(--primary)) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, hsl(var(--secondary)) 75%),
            linear-gradient(-45deg, transparent 75%, hsl(var(--secondary)) 75%)
          `,
          backgroundSize: '60px 60px',
          backgroundPosition: '0 0, 0 30px, 30px -30px, -30px 0px',
        }}
      ></div>

      {/* Hexagon Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--primary)) 2px, hsl(var(--primary)) 4px),
            repeating-linear-gradient(60deg, transparent, transparent 2px, hsl(var(--secondary)) 2px, hsl(var(--secondary)) 4px),
            repeating-linear-gradient(120deg, transparent, transparent 2px, hsl(var(--accent)) 2px, hsl(var(--accent)) 4px)
          `,
          backgroundSize: '100px 100px',
        }}
      ></div>

      {/* Wave Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(90deg, transparent, transparent 50px, hsl(var(--primary)) 50px, hsl(var(--primary)) 52px),
            repeating-linear-gradient(0deg, transparent, transparent 50px, hsl(var(--secondary)) 50px, hsl(var(--secondary)) 52px)
          `,
        }}
      ></div>

      {/* Diagonal Stripes */}
      <div 
        className="absolute inset-0 opacity-[0.01] pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            hsl(var(--primary)) 10px,
            hsl(var(--primary)) 11px
          )`,
        }}
      ></div>

      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Large gradient orbs - Main */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-0 w-72 h-72 bg-accent/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Additional gradient orbs */}
        <div className="absolute top-1/4 right-1/3 w-64 h-64 bg-primary/3 rounded-full blur-2xl animate-pulse delay-700"></div>
        <div className="absolute bottom-1/3 left-1/3 w-80 h-80 bg-secondary/3 rounded-full blur-2xl animate-pulse delay-300"></div>
        <div className="absolute top-3/4 right-1/5 w-56 h-56 bg-accent/3 rounded-full blur-2xl animate-pulse delay-900"></div>
        <div className="absolute top-1/6 left-1/2 w-48 h-48 bg-primary/4 rounded-full blur-2xl animate-pulse delay-1100"></div>
        <div className="absolute bottom-1/4 right-1/2 w-60 h-60 bg-secondary/4 rounded-full blur-2xl animate-pulse delay-400"></div>
        
        {/* Grid lines pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px',
          }}
        ></div>
        
        {/* Decorative circles - Large */}
        <div className="absolute top-20 right-20 w-32 h-32 border-2 border-primary/10 rounded-full animate-float"></div>
        <div className="absolute bottom-32 left-16 w-24 h-24 border-2 border-secondary/10 rounded-full animate-float delay-500"></div>
        <div className="absolute top-1/2 right-10 w-16 h-16 border-2 border-accent/10 rounded-full animate-float delay-1000"></div>
        <div className="absolute top-1/3 left-10 w-20 h-20 border-2 border-primary/8 rounded-full animate-float delay-300"></div>
        <div className="absolute bottom-1/4 right-1/3 w-28 h-28 border-2 border-secondary/8 rounded-full animate-float delay-700"></div>
        
        {/* Decorative circles - Medium */}
        <div className="absolute top-40 left-1/5 w-12 h-12 border border-primary/15 rounded-full animate-float delay-200"></div>
        <div className="absolute bottom-60 right-1/6 w-14 h-14 border border-secondary/15 rounded-full animate-float delay-600"></div>
        <div className="absolute top-2/3 left-2/3 w-10 h-10 border border-accent/15 rounded-full animate-float delay-800"></div>
        
        {/* Decorative dots - Small */}
        <div className="absolute top-40 left-1/4 w-2 h-2 bg-primary/20 rounded-full"></div>
        <div className="absolute bottom-40 right-1/4 w-3 h-3 bg-secondary/20 rounded-full"></div>
        <div className="absolute top-60 right-1/3 w-2 h-2 bg-accent/20 rounded-full"></div>
        <div className="absolute top-80 left-1/3 w-2.5 h-2.5 bg-primary/25 rounded-full"></div>
        <div className="absolute bottom-60 left-2/3 w-2 h-2 bg-secondary/25 rounded-full"></div>
        <div className="absolute top-1/4 right-2/5 w-3 h-3 bg-accent/20 rounded-full"></div>
        <div className="absolute bottom-1/5 left-1/5 w-2 h-2 bg-primary/20 rounded-full"></div>
        <div className="absolute top-3/5 right-1/4 w-2.5 h-2.5 bg-secondary/25 rounded-full"></div>
        
        {/* Geometric Shapes - Triangles */}
        <div 
          className="absolute top-32 right-1/4 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[35px] border-b-primary/10 animate-float delay-400"
        ></div>
        <div 
          className="absolute bottom-48 left-1/5 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[25px] border-t-secondary/10 animate-float delay-900"
        ></div>
        <div 
          className="absolute top-2/3 right-1/6 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[20px] border-b-accent/10 animate-float delay-600"
        ></div>
        
        {/* Geometric Shapes - Squares rotated */}
        <div className="absolute top-1/4 left-3/4 w-16 h-16 border-2 border-primary/10 rotate-45 animate-rotate-slow"></div>
        <div className="absolute bottom-1/3 right-1/5 w-12 h-12 border-2 border-secondary/10 rotate-45 animate-rotate-slow delay-500"></div>
        <div className="absolute top-2/5 left-1/6 w-10 h-10 border-2 border-accent/10 rotate-45 animate-rotate-slow delay-1000"></div>
        
        {/* Wavy lines */}
        <svg className="absolute top-0 left-0 w-full h-full opacity-[0.02] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,100 Q250,50 500,100 T1000,100" stroke="hsl(var(--primary))" strokeWidth="2" fill="none" />
          <path d="M0,200 Q250,150 500,200 T1000,200" stroke="hsl(var(--secondary))" strokeWidth="2" fill="none" />
          <path d="M0,300 Q250,250 500,300 T1000,300" stroke="hsl(var(--accent))" strokeWidth="2" fill="none" />
        </svg>
        
        {/* Radial gradient overlays */}
        <div 
          className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at top left, hsl(var(--primary) / 0.05), transparent 50%)'
          }}
        ></div>
        <div 
          className="absolute bottom-0 right-0 w-full h-full opacity-30 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at bottom right, hsl(var(--secondary) / 0.05), transparent 50%)'
          }}
        ></div>
        <div 
          className="absolute top-1/2 left-1/2 w-full h-full opacity-20 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at center, hsl(var(--accent) / 0.03), transparent 70%)'
          }}
        ></div>
      </div>

      {/* Subtle overlay for content readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/60 pointer-events-none z-[1]"></div>
      
      {/* Additional decorative mesh gradient */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(at 20% 30%, hsl(var(--primary) / 0.1) 0px, transparent 50%),
            radial-gradient(at 80% 70%, hsl(var(--secondary) / 0.1) 0px, transparent 50%),
            radial-gradient(at 50% 50%, hsl(var(--accent) / 0.05) 0px, transparent 50%)
          `,
        }}
      ></div>
      
      {/* Animated gradient overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none z-0 animate-gradient"
        style={{
          background: 'linear-gradient(135deg, hsl(var(--primary) / 0.1) 0%, hsl(var(--secondary) / 0.1) 50%, hsl(var(--accent) / 0.1) 100%)',
          backgroundSize: '200% 200%',
        }}
      ></div>

      <Navbar />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 relative z-10 bg-background/30 backdrop-blur-sm">
        <div className="text-center space-y-6">
          <div className="inline-block mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-2xl rounded-full"></div>
              <h1 className="relative text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                EduData Platform
              </h1>
            </div>
          </div>
          <div className="relative">
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-medium leading-relaxed">
              Unified Education Data Interface - One Nation, One Education Data
            </p>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-primary rounded-full"></div>
          </div>
          
          {/* Decorative Login Button */}
          <div className="pt-8 flex justify-center">
            <Link to="/login">
              <Button 
                size="lg"
                className="group relative overflow-hidden bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] hover:bg-[length:100%_auto] text-white font-bold text-lg px-8 py-6 rounded-full shadow-2xl hover:shadow-primary/50 transition-all duration-500 hover:scale-110 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                <div className="relative flex items-center gap-3">
                  <LogIn className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                  <span>Login to Access Dashboards</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Institution Search */}
      <section className="container mx-auto px-4 py-12 relative z-10">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-1 bg-gradient-primary rounded-full"></div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">{t("search.institutions")}</h2>
          </div>
          <p className="text-muted-foreground ml-4">Discover and explore educational institutions across the nation</p>
        </div>
        
        <div className="space-y-6 mb-8">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 rounded-lg blur-xl transition-opacity duration-300"></div>
            <div className="relative bg-card border-2 border-border rounded-lg p-1 shadow-lg">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary z-10" />
              <Input
                type="text"
                placeholder={t("search.placeholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 text-base border-0 focus-visible:ring-2 focus-visible:ring-primary/50 bg-transparent"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 items-center bg-card/50 backdrop-blur-sm p-4 rounded-lg border border-border shadow-sm">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg hover:bg-primary hover:text-primary-foreground transition-all duration-300 cursor-pointer group">
                <ArrowUpDown className="h-4 w-4 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <span className="text-sm font-medium text-foreground">Sort by:</span>
            </div>
            <Select value={sortField} onValueChange={setSortField}>
              <SelectTrigger className="w-[200px] bg-background border-2 border-border hover:border-primary hover:bg-primary/10 hover:text-primary transition-all duration-300">
                <SelectValue placeholder="Select field" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="placementRate">Placement Rate</SelectItem>
                <SelectItem value="performanceScore">Performance Score</SelectItem>
                <SelectItem value="studentsCount">Students Count</SelectItem>
                <SelectItem value="teachersCount">Teachers Count</SelectItem>
                <SelectItem value="nirfRank">NIRF Rank</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="default"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="flex items-center gap-2 border-2 border-border bg-background hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              {sortOrder === "asc" ? (
                <>
                  <ArrowUp className="h-4 w-4 transition-transform group-hover:scale-110" />
                  Low to High
                </>
              ) : (
                <>
                  <ArrowDown className="h-4 w-4 transition-transform group-hover:scale-110" />
                  High to Low
                </>
              )}
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedInstitutions.map((institution, index) => (
            <Card
              key={institution.id}
              className="group relative overflow-hidden border-2 border-border bg-card hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-elevated"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-primary opacity-0 group-hover:opacity-5 rounded-full blur-2xl transition-opacity duration-300"></div>
              <div className="relative p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-foreground mb-1 group-hover:text-primary transition-colors">
                      {institution.name}
                    </h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {institution.location}
                    </p>
                  </div>
                  <Badge className="bg-gradient-primary text-primary-foreground border-0 shadow-md hover:shadow-lg transition-shadow">
                    NIRF #{institution.nirfRank}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Students</p>
                    <p className="font-bold text-lg text-foreground flex items-center gap-1">
                      <GraduationCap className="h-4 w-4 text-primary" />
                      {institution.studentsCount.toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Teachers</p>
                    <p className="font-bold text-lg text-foreground flex items-center gap-1">
                      <Users className="h-4 w-4 text-secondary" />
                      {institution.teachersCount}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Placement Rate</p>
                    <p className="font-bold text-lg text-accent flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      {institution.placementRate}%
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Performance</p>
                    <p className="font-bold text-lg text-accent flex items-center gap-1">
                      <Award className="h-4 w-4" />
                      {institution.performanceScore}%
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats Overview */}
      <section className="container mx-auto px-4 py-12 relative z-10">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-1 bg-gradient-primary rounded-full"></div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">National Overview</h2>
          </div>
          <p className="text-muted-foreground ml-4">Comprehensive statistics and insights</p>
        </div>
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
      <section className="container mx-auto px-4 py-12 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-1 bg-gradient-primary rounded-full"></div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Recent Placements</h2>
            </div>
            <p className="text-muted-foreground ml-4">Latest career achievements</p>
          </div>
          <Badge className="bg-gradient-to-r from-accent to-accent/80 text-accent-foreground border-0 shadow-lg px-4 py-2">
            <TrendingUp className="mr-2 h-4 w-4 animate-pulse" />
            Live Updates
          </Badge>
        </div>
        <Card className="p-6 border-2 border-border shadow-lg bg-card/50 backdrop-blur-sm">
          <div className="space-y-3">
            {recentPlacements.map((placement, index) => (
              <div
                key={placement.id}
                className="group flex flex-col md:flex-row md:items-center justify-between p-5 rounded-lg border-2 border-border hover:border-primary/50 bg-background/50 hover:bg-background transition-all duration-300 hover:shadow-md"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="space-y-2">
                  <p className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                    {placement.studentName}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Building2 className="h-3 w-3" />
                    {placement.institutionName} • {placement.department}
                  </p>
                </div>
                <div className="mt-3 md:mt-0 flex items-center gap-4">
                  <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
                    {placement.company}
                  </Badge>
                  <div className="text-right">
                    <span className="text-lg font-bold text-accent block">
                      ₹{placement.package} LPA
                    </span>
                    <span className="text-xs text-muted-foreground hidden md:block">
                      {new Date(placement.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Top Schemes */}
      <section className="container mx-auto px-4 py-12 pb-20 relative z-10">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-1 bg-gradient-primary rounded-full"></div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Top Government Schemes</h2>
          </div>
          <p className="text-muted-foreground ml-4">Empowering education through government initiatives</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {schemes.slice(0, 4).map((scheme, index) => {
            const progress = (scheme.beneficiaries / (scheme.budget / 4000)) * 100;
            return (
              <Card 
                key={scheme.id} 
                className="group relative overflow-hidden border-2 border-border bg-card hover:border-secondary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-secondary/5 rounded-full blur-3xl group-hover:bg-secondary/10 transition-colors"></div>
                <div className="relative p-6 space-y-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-foreground mb-2 group-hover:text-secondary transition-colors">
                        {scheme.name}
                      </h3>
                      <Badge variant="outline" className="mt-1 border-2">
                        {scheme.type}
                      </Badge>
                    </div>
                    <Badge className="bg-gradient-to-r from-accent to-accent/80 text-accent-foreground border-0 shadow-md">
                      {scheme.status}
                    </Badge>
                  </div>
                  <div className="space-y-3 pt-2 border-t border-border">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">Beneficiaries</span>
                      <span className="font-bold text-lg text-foreground">
                        {scheme.beneficiaries.toLocaleString()}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <Progress value={progress} className="h-3 bg-muted" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span className="font-medium">Budget: ₹{(scheme.budget / 10000000).toFixed(1)}Cr</span>
                        <span className="font-semibold text-accent">{progress.toFixed(0)}% utilized</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed pt-2 border-t border-border">
                    {scheme.eligibilityCriteria}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

    </div>
  );
};

export default Index;
