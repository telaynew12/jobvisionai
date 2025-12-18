import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/AuthContext";
import Button from "./Button";
import Card from "./Card";

const Dashboard = () => {
  const { userId } = useParams();
  const { user, logout } = useAuth();

  console.log('Dashboard rendering:', { userId, user }); // Debug log
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    jobsApplied: 0,
    interviewsScheduled: 0,
    coursesCompleted: 0,
    skillsLearned: 0
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const quickActions = [
    { icon: "🔍", title: "Find Jobs", description: "Browse AI-matched opportunities", link: "/jobs" },
    { icon: "📚", title: "Continue Learning", description: "Resume your AI courses", link: "/learning" },
    { icon: "🎯", title: "Skill Assessment", description: "Test your current skills", link: "/assessment" },
    { icon: "📊", title: "Career Insights", description: "View your progress analytics", link: "/analytics" }
  ];

  // Fetch user dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Since we're in a protected route, user should be authenticated
        if (!user) {
          throw new Error('User not authenticated');
        }

        // Validate that we have the correct user for this dashboard
        if (user.id !== userId) {
          console.warn(`User ID mismatch: expected ${userId}, got ${user.id}`);
          // For now, just show data for the authenticated user
        }

        // For now, we'll use mock data that simulates real API calls
        // In a real implementation, these would be actual API calls

        // Simulate fetching user statistics
        setStats({
          jobsApplied: Math.floor(Math.random() * 20) + 1,
          interviewsScheduled: Math.floor(Math.random() * 5),
          coursesCompleted: Math.floor(Math.random() * 10),
          skillsLearned: Math.floor(Math.random() * 15) + 1
        });

        // Simulate fetching recent job applications
        const mockJobs = [
          {
            id: 1,
            title: "Senior Frontend Developer",
            company: "TechCorp Inc.",
            status: "Applied",
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          },
          {
            id: 2,
            title: "Full Stack Engineer",
            company: "StartupXYZ",
            status: "Interview",
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          },
          {
            id: 3,
            title: "React Developer",
            company: "DevSolutions",
            status: "Applied",
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          }
        ];
        setRecentJobs(mockJobs);

        // Simulate fetching learning progress
        const mockCourses = [
          { id: 1, title: "Advanced React Patterns", progress: 75, duration: "8 hours", enrolled: true },
          { id: 2, title: "Node.js Backend Development", progress: 30, duration: "12 hours", enrolled: true },
          { id: 3, title: "AI/ML Fundamentals", progress: 0, duration: "15 hours", enrolled: false },
          { id: 4, title: "Python for Data Science", progress: 45, duration: "10 hours", enrolled: true }
        ];
        setRecommendedCourses(mockCourses);

        // Simulate fetching upcoming interviews
        const mockInterviews = [
          {
            id: 1,
            company: "TechCorp Inc.",
            position: "Senior Frontend Developer",
            date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            time: "2:00 PM",
            type: "Technical Interview"
          },
          {
            id: 2,
            company: "StartupXYZ",
            position: "Full Stack Engineer",
            date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            time: "10:00 AM",
            type: "Behavioral Interview"
          }
        ];
        setUpcomingInterviews(mockInterviews);

      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Show loading while checking authentication or fetching data
  if (loading || (!user && !error)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="animate-spin w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Dashboard</h2>
            <p className="text-gray-600">Fetching your personalized data...</p>
          </div>
        </Card>
      </div>
    );
  }

  // Error component - but still show basic dashboard
  if (error) {
    console.warn('Dashboard error:', error);
    // Don't block the dashboard, just show a warning
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Debug indicator - small version */}
      <div className="bg-blue-600 text-white px-4 py-2 text-center text-sm">
        ✅ Dashboard loaded for {user?.name || `User ${userId}`}
      </div>


      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Notification */}
        {error && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
              <div>
                <p className="text-yellow-800 font-medium">Some data may not be available</p>
                <p className="text-yellow-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name || `User ${userId}`}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your career journey today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0V8a2 2 0 01-2 2H8a2 2 0 01-2-2V6m8 0H8"></path>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.jobsApplied}</h3>
            <p className="text-gray-600 text-sm">Jobs Applied</p>
          </Card>

          <Card className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.interviewsScheduled}</h3>
            <p className="text-gray-600 text-sm">Interviews Scheduled</p>
          </Card>

          <Card className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.coursesCompleted}</h3>
            <p className="text-gray-600 text-sm">Courses Completed</p>
          </Card>

          <Card className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.skillsLearned}</h3>
            <p className="text-gray-600 text-sm">Skills Learned</p>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Recent Activity & Quick Actions */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Job Applications */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Job Applications</h2>
                <Link to="/jobs" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View All →
                </Link>
              </div>
              <div className="space-y-4">
                {recentJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{job.title}</h3>
                      <p className="text-sm text-gray-600">{job.company}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        job.status === 'Interview' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {job.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">{job.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Learning Progress */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Continue Learning</h2>
                <Link to="/learning" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View All →
                </Link>
              </div>
              <div className="space-y-4">
                {recommendedCourses.map((course) => (
                  <div key={course.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{course.title}</h3>
                      <span className="text-sm text-gray-500">{course.duration}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600">{course.progress}% Complete</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column - Upcoming Interviews & Quick Actions */}
          <div className="space-y-8">
            {/* Upcoming Interviews */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Upcoming Interviews</h2>
              <div className="space-y-4">
                {upcomingInterviews.map((interview) => (
                  <div key={interview.id} className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-1">{interview.position}</h3>
                    <p className="text-sm text-gray-600 mb-2">{interview.company}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{interview.date} at {interview.time}</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {interview.type}
                      </span>
                    </div>
                  </div>
                ))}
                {upcomingInterviews.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No upcoming interviews</p>
                )}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 gap-3">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    to={action.link}
                    className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-2xl mr-3">{action.icon}</span>
                    <div>
                      <h3 className="font-medium text-gray-900 text-sm">{action.title}</h3>
                      <p className="text-xs text-gray-600">{action.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>

            {/* AI Insights */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Career Insights</h2>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">
                    Welcome back, {user?.name || 'valued user'}! You've applied to {stats.jobsApplied} positions this month.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">
                    {stats.interviewsScheduled > 0
                      ? `Great news! You have ${stats.interviewsScheduled} upcoming interview${stats.interviewsScheduled > 1 ? 's' : ''}.`
                      : 'Keep applying! Our AI is constantly finding new matches for your profile.'
                    }
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">
                    {recommendedCourses.filter(c => c.progress > 0).length > 0
                      ? `You're making great progress on ${recommendedCourses.filter(c => c.progress > 0).length} course${recommendedCourses.filter(c => c.progress > 0).length > 1 ? 's' : ''}!`
                      : 'Consider starting a new course to boost your skills and job matches.'
                    }
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">
                    Your profile has been viewed by {Math.floor(Math.random() * 50) + 10} recruiters this week.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
