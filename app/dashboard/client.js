'use client';

import { useState, useEffect } from 'react';
import SidebarNavigation from '../../components/SidebarNavigation';
import { getTests, getMainCategoryDistribution, getGoals } from '../../lib/api';
import {
  ChevronRight,
  PresentationChart,
  BookOpen,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import GoalsSection from './GoalsSection';
import PerformanceChart from './PerformanceChart';
import PieChartSection from './PieChartSection';
import LatestScores from './LatestScores';
import { API_BASE_URL, API_ENDPOINTS } from '@/lib/api-config';


export function DashboardView() {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('Past Week');
  const [pieChartTestData, setPieChartTestData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [categoryTotal, setCategoryTotal] = useState(0);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [categoryError, setCategoryError] = useState(null);
  const [goals, setGoals] = useState([]);
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [goalsError, setGoalsError] = useState(null);
  const [averageMastery, setAverageMastery] = useState(null);
  const [masteryLoading, setMasteryLoading] = useState(true);
  const [masteryError, setMasteryError] = useState(null);

  // Fetch test data on component mount
  useEffect(() => {
    const fetchTestData = async () => {
      try {
        setLoading(true);
        const data = await getTests("limit=5&sort_order=desc");
        setPieChartTestData(data.tests || []);
      } catch (err) {
        console.error('Failed to fetch test data:', err);
        setError('Failed to load test data');
      } finally {
        setLoading(false);
      }
    };

    fetchTestData();
  }, []);

  // Fetch main category distribution
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setCategoryLoading(true);
        const data = await getMainCategoryDistribution();
        // Sort by count descending
        data.sort((a, b) => b.count - a.count);
        const total = data.reduce((sum, item) => sum + item.count, 0);
        const pieChartData = data.map(item => ({
          name: item.main_category,
          value: item.count,
          percentage: total > 0 ? ((item.count / total) * 100).toFixed(1) : 0,
        }));
        setCategoryData(pieChartData);
        setCategoryTotal(total);
        if (pieChartData.length > 0) {
          setSelectedSubject(pieChartData[0].name);
        }
      } catch (err) {
        setCategoryError('Failed to load category distribution');
      } finally {
        setCategoryLoading(false);
      }
    };
    fetchCategoryData();
  }, []);

  // Fetch goals
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        setGoalsLoading(true);
        const data = await getGoals();
        setGoals((data.goals || []).map(g => g.name));
      } catch (err) {
        setGoalsError('Failed to load goals');
      } finally {
        setGoalsLoading(false);
      }
    };
    fetchGoals();
  }, []);

  // Fetch average mastery
  useEffect(() => {
    const fetchAverageMastery = async () => {
      try {
        setMasteryLoading(true);
        setMasteryError(null);
        const res = await fetch(API_ENDPOINTS.AVERAGE_MASTERY);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setAverageMastery(Math.round((data.average_mastery || 0) * 100));
      } catch (err) {
        setMasteryError('Failed to load average mastery');
      } finally {
        setMasteryLoading(false);
      }
    };
    fetchAverageMastery();
  }, []);

  // Transform test data for display
  const latestScores = pieChartTestData.map(test => ({
    subject: test.category || 'All Categories',
    score: test.percentage || 0,
    date: new Date(test.created_at).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }),
    id: test.id
  }));

  return (
    <div className="flex h-screen bg-gradient-to-br from-white via-lime-50 to-lime-100">
      <SidebarNavigation currentPage="dashboard" />
      
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-lime-100">
            <h1 className="text-2xl font-semibold flex items-center gap-2 text-gray-900">
              📊 Main Dashboard
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <GoalsSection goals={goals} loading={goalsLoading} error={goalsError} />
            <PerformanceChart
              selectedSubject={selectedSubject}
              categories={categoryData}
              setSelectedSubject={setSelectedSubject}
              selectedTimeRange={selectedTimeRange}
              setSelectedTimeRange={setSelectedTimeRange}
            />
          </div>

          {/* Middle Row with Pie Chart and Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <PieChartSection
              pieChartData={categoryData}
              totalCount={categoryTotal}
              loading={categoryLoading}
              error={categoryError}
            />
            <div>
              <div className="relative bg-white rounded-xl p-6 mb-4 shadow-sm border border-lime-100 flex items-center justify-between">
                <div className="flex flex-col items-start justify-center">
                  <span className="text-5xl font-extrabold text-lime-600 leading-none">
                    {masteryLoading ? (
                      <span className="text-gray-400 text-3xl">...</span>
                    ) : masteryError ? (
                      <span className="text-red-500 text-lg">Err</span>
                    ) : (
                      <>{averageMastery}%</>
                    )}
                  </span>
                  <span className="text-base text-gray-500 font-medium mt-2">Mastery Score</span>
                </div>
                <div className="flex flex-col items-end justify-between h-full">
                  <BookOpen className="w-10 h-10 text-gray-300 mb-2" />
                </div>
              </div>
              <LatestScores
                latestScores={latestScores}
                loading={loading}
                error={error}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 