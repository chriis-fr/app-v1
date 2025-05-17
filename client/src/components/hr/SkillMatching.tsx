import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Users, Star, TrendingUp, Award, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SkillMatch {
  employeeId: string;
  name: string;
  matchScore: number;
  skills: {
    name: string;
    level: number;
    relevance: number;
  }[];
}

interface SkillMatchingProps {
  projectRequirements: {
    skills: string[];
    experience: number;
  };
}

export function SkillMatching({ projectRequirements }: SkillMatchingProps) {
  const [matches, setMatches] = useState<SkillMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'match' | 'experience'>('match');

  useEffect(() => {
    // Simulate API call to get skill matches
    const fetchMatches = async () => {
      try {
        // TODO: Replace with actual API call
        const response = await fetch('/api/hr/skill-matches', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(projectRequirements),
        });
        const data = await response.json();
        setMatches(data);
      } catch (error) {
        console.error('Error fetching skill matches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [projectRequirements]);

  const getMatchColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.6) return 'bg-blue-500';
    if (score >= 0.4) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getSkillLevelColor = (level: number) => {
    if (level >= 4) return 'text-green-600';
    if (level >= 3) return 'text-blue-600';
    if (level >= 2) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </CardContent>
      </Card>
    );
  }

  const filteredMatches = selectedSkill === 'all'
    ? matches
    : matches.filter(match => 
        match.skills.some(skill => skill.name.toLowerCase() === selectedSkill.toLowerCase())
      );

  const sortedMatches = [...filteredMatches].sort((a, b) => {
    if (sortBy === 'match') {
      return b.matchScore - a.matchScore;
    }
    return b.skills.reduce((acc, skill) => acc + skill.level, 0) -
           a.skills.reduce((acc, skill) => acc + skill.level, 0);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="space-y-1">
            <Label>Filter by Skill</Label>
            <Select value={selectedSkill} onValueChange={setSelectedSkill}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select skill" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Skills</SelectItem>
                {projectRequirements.skills.map(skill => (
                  <SelectItem key={skill} value={skill}>
                    {skill}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Sort by</Label>
            <Select value={sortBy} onValueChange={(value: 'match' | 'experience') => setSortBy(value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="match">Match Score</SelectItem>
                <SelectItem value="experience">Experience Level</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <TrendingUp className="mr-2 h-4 w-4" />
          View Analytics
        </Button>
      </div>

      <div className="grid gap-4">
        {sortedMatches.map((match) => (
          <Card key={match.employeeId} className="overflow-hidden">
            <div className={`h-1 ${getMatchColor(match.matchScore)}`} />
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{match.name}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {Math.round(match.matchScore * 100)}% Match
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          {match.skills.length} Skills
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {match.skills.map((skill) => (
                      <div key={skill.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">{skill.name}</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Target className={`h-4 w-4 ${getSkillLevelColor(skill.level)}`} />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Level {skill.level} • {skill.relevance * 100}% relevant</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <span className={`text-sm font-medium ${getSkillLevelColor(skill.level)}`}>
                            Level {skill.level}
                          </span>
                        </div>
                        <Progress value={skill.relevance * 100} className="h-1" />
                      </div>
                    ))}
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  View Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 