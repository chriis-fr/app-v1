import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Users, Star } from 'lucide-react';

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

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          AI Skill Matching
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {matches.map((match) => (
            <div key={match.employeeId} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{match.name}</span>
                </div>
                <Badge variant="default" className="bg-blue-500 text-white">
                  {Math.round(match.matchScore * 100)}% Match
                </Badge>
              </div>
              <Progress value={match.matchScore * 100} className="h-2" />
              <div className="grid grid-cols-2 gap-4">
                {match.skills.map((skill) => (
                  <div key={skill.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{skill.name}</span>
                      <span className="text-sm text-muted-foreground">
                        Level {skill.level}
                      </span>
                    </div>
                    <Progress value={skill.relevance * 100} className="h-1" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 