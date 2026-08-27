import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const OAuthSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useUser();

    useEffect(() => {
        const token = searchParams.get('token');
        const id = searchParams.get('id');
        const role = searchParams.get('role');
        const name = searchParams.get('name');
        const email = searchParams.get('email');
        const assignedRole = searchParams.get('assignedRole');
        const department = searchParams.get('department');
        const teachingAssignmentsStr = searchParams.get('teachingAssignments');
        let teachingAssignments = [];
        try {
            if (teachingAssignmentsStr) {
                teachingAssignments = JSON.parse(decodeURIComponent(teachingAssignmentsStr));
            }
        } catch (e) {
            console.error("Could not parse teaching assignments", e);
        }

        const regdNo = searchParams.get('regdNo');
        
        if (token && id && id !== 'null' && role) {
            // Persist the session
            localStorage.setItem('token', token);
            login({ 
                id, 
                role, 
                name, 
                email: email || '', 
                assignedRole, 
                department, 
                teachingAssignments, 
                phone: '', 
                bio: '', 
                profileImage: '',
                regdNo: regdNo || '' 
            });

            // Give a microdelay for aesthetic loading state, then route
            setTimeout(() => {
                const ROLE_PATHS = {
                    'Student': '/student',
                    'Faculty': '/faculty',
                    'HOD': '/hod',
                    'Principal': '/principal',
                    'Dean': '/dean',
                    'Registrar': '/registrar'
                };
                const destination = ROLE_PATHS[role] || `/${role.toLowerCase()}`;
                navigate(destination, { replace: true });
            }, 100);
        } else {
            // Missing params means failure
            navigate('/login?error=oauth_failed');
        }
    }, [searchParams, navigate, login]);

    return (
        <div className="min-h-screen bg-white dark:bg-background-dark flex flex-col items-center justify-center p-4">
            <div className="bg-white dark:bg-[#0F1419] p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-white/5 flex flex-col items-center text-center max-w-sm w-full">
                <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-6"></div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Authenticating</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Verifying your Google workspace credentials...</p>
            </div>
        </div>
    );
};

export default OAuthSuccess;
