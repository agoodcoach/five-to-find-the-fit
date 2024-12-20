'use client'

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const CATEGORIES = ['Academics', 'Athletics', 'Financial', 'Geography', 'Social'];
const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];

const PRESET_FACTORS = {
  Academics: [
    "School has my desired major",
    "Level of academic challenge",
    "Class sizes"
  ],
  Athletics: [
    "Level of play", 
    "Ability to win/compete for championships",
    "Perception of how soon I might see playing time"
  ],
  Financial: [
    "Could we afford school without athletic scholarship?",
    "Access to other financial aid (merit, needs-based, etc)",
    "Have a firm dollar figure in mind we can't exceed"
  ],
  Geography: [
    "Distance from home",
    "Setting - major city, college town, or rural area",
    "Climate/weather"
  ],
  Social: [
    "Size of campus",
    "Number of students",
    "Extracurricular activities"
  ]
};

export default function FiveToFindTheFit() {
  // Continuconst [initialRanking, setInitialRanking] = useState(CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: '' }), {}));
  const [factorScores, setFactorScores] = useState({});

  const calculatedData = useMemo(() => {
    const categoryAverages = CATEGORIES.reduce((acc, category) => {
      const categoryScores = Object.entries(factorScores)
        .filter(([key]) => key.startsWith(category))
        .map(([_, score]) => Number(score))
        .filter(score => !isNaN(score));

      const average = categoryScores.length > 0
        ? categoryScores.reduce((sum, score) => sum + score, 0) / categoryScores.length
        : 0;

      return { ...acc, [category]: average };
    }, {});

    const dataRanking = [...CATEGORIES].sort((a, b) => categoryAverages[b] - categoryAverages[a]);
    const initialOrder = [...CATEGORIES].sort((a, b) => Number(initialRanking[a]) - Number(initialRanking[b]));

    const rankingComparison = CATEGORIES.map(category => ({
      category,
      initialRank: Number(initialRanking[category]) || 0,
      dataRank: dataRanking.indexOf(category) + 1,
      averageScore: categoryAverages[category]
    }));

    const allFactors = Object.entries(factorScores)
      .map(([key, score]) => {
        const [category, ...rest] = key.split('-');
        return {
          name: rest.join('-'),
          score: Number(score),
          category
        };
      })
      .filter(factor => !isNaN(factor.score) && factor.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return {
      categoryAverages,
      topFactors: allFactors,
      rankingComparison
    };
  }, [factorScores, initialRanking]);

  const handleScoreChange = (category, factor, score) => {
    setFactorScores(prev => ({
      ...prev,
      [`${category}-${factor}`]: score
    }));
  };

  const exportResults = () => {
    const formattedResults = `Five To Find The Fit - Results\n
Initial Rankings:
${Object.entries(initialRanking)
  .map(([category, rank]) => `${category}: ${rank || '-'}`)
  .join('\n')}

Category Rankings Based on Factor Scores:
${calculatedData.rankingComparison
  .sort((a, b) => a.dataRank - b.dataRank)
  .map(item => `${item.category}: ${item.averageScore.toFixed(1)} (Initial Rank: ${item.initialRank || '-'}, Calculated Rank: ${item.dataRank})`)
  .join('\n')}

Top 5 Most Important Factors:
${calculatedData.topFactors
  .map(factor => `${factor.name}: ${factor.score}/10`)
  .join('\n')}

Generated at: ${new Date().toLocaleString()}
Tool by Alan Good (alangood.com)`;

    const blob = new Blob([formattedResults], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'five-to-find-the-fit-results.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const pieData = CATEGORIES.map(category => ({
    name: category,
    value: calculatedData.categoryAverages[category] || 0
  }));

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Five To Find The Fit
            <div className="text-base font-normal mt-1">
              by <a href="https://alangood.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 underline">Alan Good</a>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* Step 1: Initial Rankings */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold border-b pb-2">Step 1: Initial Rankings (1-5)</h2>
              <p className="text-sm text-gray-600">Place the five categories in order of importance for you. Set a timer for 60 seconds and go with your gut feel!</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {CATEGORIES.map((category) => (
                  <div key={category} className="space-y-2">
                    <Label>{category}</Label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={initialRanking[category]}
                      onChange={(e) => {
                        setInitialRanking(prev => ({
                          ...prev,
                          [category]: e.target.value
                        }));
                      }}
                      placeholder="Rank 1-5"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: Factor Ratings */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold border-b pb-2">Step 2: Rate Factors (1-10)</h2>
              <p className="text-sm text-gray-600">Rate each factor on a scale of 1-10, in terms of how important it will be to your recruiting process and final decision. Feel free to add up to 5 factors for each category.</p>
              
              {CATEGORIES.map((category) => (
                <div key={category} className="space-y-4">
                  <h3 className="text-lg font-bold text-primary">{category}</h3>
                  <div className="space-y-2">
                    {/* Preset Factors */}
                    {PRESET_FACTORS[category].map((factor) => (
                      <div key={factor} className="grid grid-cols-[1fr,80px] gap-4 items-center">
                        <div className="font-medium truncate">{factor}</div>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          value={factorScores[`${category}-${factor}`] || ''}
                          onChange={(e) => handleScoreChange(category, factor, e.target.value)}
                          placeholder="1-10"
                          className="w-20 justify-self-end"
                        />
                      </div>
                    ))}
                    
                    {/* Custom Factor Inputs */}
                    <div className="mt-4 pt-4 border-t">
                      <Label className="text-sm text-gray-600">Additional Factors (Optional)</Label>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="grid grid-cols-[1fr,80px] gap-4 items-center mt-2">
                          <Input
                            placeholder="Enter your own factor"
                            value={factorScores[`${category}-custom-${i}-name`] || ''}
                            onChange={(e) => handleScoreChange(category, `custom-${i}-name`, e.target.value)}
                          />
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            value={factorScores[`${category}-custom-${i}-score`] || ''}
                            onChange={(e) => handleScoreChange(category, `custom-${i}-score`, e.target.value)}
                            placeholder="1-10"
                            className="w-20 justify-self-end"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Results Dashboard */}
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-2">
                <h2 className="text-xl font-bold">Results Dashboard</h2>
                <Button 
                  onClick={exportResults}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export Results
                </Button>
              </div>
              
              {/* Rankings Comparison */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold">Rankings Comparison</h3>
                <div className="mt-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Category</th>
                        <th className="text-center py-2">Initial Rank</th>
                        <th className="text-center py-2">Calculated Rank</th>
                        <th className="text-right py-2">Average Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calculatedData.rankingComparison
                        .sort((a, b) => a.dataRank - b.dataRank)
                        .map((item) => (
                          <tr key={item.category} className="border-b">
                            <td className="py-2">{item.category}</td>
                            <td className="text-center">{item.initialRank || '-'}</td>
                            <td className="text-center">{item.dataRank}</td>
                            <td className="text-right">{item.averageScore.toFixed(1)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <div>
                  <h3 className="text-lg font-bold mb-4">Category Weights</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Top Factors */}
                <div className="space-y-2">
                  <h3 className="text-lg font-bold">Top 5 Factors</h3>
                  {calculatedData.topFactors.map((factor, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span>{factor.name}</span>
                      <span className="text-sm text-gray-600">({factor.score}/10)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
