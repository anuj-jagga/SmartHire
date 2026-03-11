import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/authStore';

// Role-based Dashboards
import CandidateDashboard from '../components/dashboards/CandidateDashboard';
import HRDashboard from '../components/dashboards/HRDashboard';
import AdminDashboard from '../components/dashboards/AdminDashboard';

const Dashboard = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();

    // Shared state
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    // Candidate API Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [minSalaryFilter, setMinSalaryFilter] = useState('');
    const [maxSalaryFilter, setMaxSalaryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Applications Pagination
    const [appPage, setAppPage] = useState(1);
    const [appTotalPages, setAppTotalPages] = useState(1);

    // Admin API States
    const [adminStats, setAdminStats] = useState(null);
    const [usersList, setUsersList] = useState([]);
    const [adminUserSearch, setAdminUserSearch] = useState('');
    const [adminUserRole, setAdminUserRole] = useState('');
    const [adminUserPage, setAdminUserPage] = useState(1);
    const [adminUserTotalPages, setAdminUserTotalPages] = useState(1);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {
                axios.defaults.headers.common['Authorization'] = `Bearer ${useAuthStore.getState().token}`;

                const jobsRes = await axios.get('/api/jobs', {
                    params: {
                        page: currentPage,
                        limit: 9,
                        search: searchQuery,
                        location: locationFilter,
                        minSalary: minSalaryFilter,
                        maxSalary: maxSalaryFilter,
                        status: statusFilter
                    }
                });

                setJobs(jobsRes.data.data || jobsRes.data);
                if (jobsRes.data.totalPages) {
                    setTotalPages(jobsRes.data.totalPages);
                }

                const appsRes = await axios.get('/api/applications', {
                    params: {
                        page: appPage,
                        limit: useAuthStore.getState().user?.role === 'HR' ? 10 : 1000
                    }
                });
                if (appsRes.data.applications) {
                    setApplications(appsRes.data.applications);
                    setAppTotalPages(appsRes.data.totalPages);
                } else {
                    setApplications(appsRes.data);
                }

                if (useAuthStore.getState().user?.role === 'Admin') {
                    try {
                        const statsRes = await axios.get('/api/admin/stats');
                        setAdminStats(statsRes.data);

                        const usersRes = await axios.get('/api/auth/users', {
                            params: {
                                page: adminUserPage,
                                limit: 10,
                                search: adminUserSearch,
                                role: adminUserRole
                            }
                        });
                        setUsersList(usersRes.data.data || usersRes.data);
                        if (usersRes.data.totalPages) {
                            setAdminUserTotalPages(usersRes.data.totalPages);
                        }
                    } catch (e) {
                        console.error('Failed fetching admin stats', e);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch dashboard data', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, navigate, currentPage, searchQuery, locationFilter, minSalaryFilter, maxSalaryFilter, statusFilter, appPage, adminUserPage, adminUserSearch, adminUserRole]);

    if (loading) return <div className="text-center py-20 text-xl animate-pulse">Loading dashboard...</div>;

    return (
        <div className="container mx-auto px-4 py-8 animate-fade-in relative">
            {user?.role === 'Candidate' && (
                <CandidateDashboard
                    user={user}
                    jobs={jobs}
                    applications={applications}
                    setApplications={setApplications}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    locationFilter={locationFilter}
                    setLocationFilter={setLocationFilter}
                    minSalaryFilter={minSalaryFilter}
                    setMinSalaryFilter={setMinSalaryFilter}
                    maxSalaryFilter={maxSalaryFilter}
                    setMaxSalaryFilter={setMaxSalaryFilter}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    totalPages={totalPages}
                />
            )}

            {user?.role === 'HR' && (
                <HRDashboard
                    user={user}
                    jobs={jobs}
                    setJobs={setJobs}
                    applications={applications}
                    setApplications={setApplications}
                    appPage={appPage}
                    setAppPage={setAppPage}
                    appTotalPages={appTotalPages}
                />
            )}

            {user?.role === 'Admin' && (
                <AdminDashboard
                    user={user}
                    adminStats={adminStats}
                    usersList={usersList}
                    setUsersList={setUsersList}
                    adminUserSearch={adminUserSearch}
                    setAdminUserSearch={setAdminUserSearch}
                    adminUserRole={adminUserRole}
                    setAdminUserRole={setAdminUserRole}
                    adminUserPage={adminUserPage}
                    setAdminUserPage={setAdminUserPage}
                    adminUserTotalPages={adminUserTotalPages}
                />
            )}
        </div>
    );
};

export default Dashboard;
