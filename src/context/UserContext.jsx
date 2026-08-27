import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const UserContext = createContext();

const emptyUser = {
    id: null,
    name: '',
    role: '',
    email: '',
    assignedRole: '',
    department: '',
    semester: '',
    teachingAssignments: [],
    phone: '',
    bio: '',
    profileImage: '',
    regdNo: '',
    accessInfo: {
        tier: '',
        canEditTimetable: false
    }
};

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(emptyUser);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const restoreSession = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const res = await axios.get('http://localhost:5000/api/auth/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                const userData = res.data;
                const canEdit = userData.assignedRole === 'TimeTable Management' || userData.role === 'TimeTable Management';

                setUser({
                    id: userData._id || userData.id,
                    name: userData.fullName || userData.name || '',
                    role: userData.role || '',
                    email: userData.email || '',
                    assignedRole: userData.assignedRole || '',
                    department: userData.department || '',
                    semester: userData.semester || '',
                    teachingAssignments: userData.teachingAssignments || [],
                    phone: userData.phone || '',
                    bio: userData.bio || '',
                    profileImage: userData.profileImage || '',
                    regdNo: userData.regdNo || '',
                    accessInfo: {
                        tier: userData.role,
                        canEditTimetable: canEdit
                    }
                });
            } catch (err) {
                console.error("Session restoration failed:", err);
                localStorage.removeItem('token');
            } finally {
                setLoading(false);
            }
        };

        restoreSession();
    }, []);

    const login = (userData) => {
        const canEdit = userData.assignedRole === 'TimeTable Management' || userData.role === 'TimeTable Management';

        setUser({
            id: userData.id && userData.id !== 'null' ? userData.id : null,
            name: userData.name || '',
            role: userData.role || '',
            email: userData.email || '',
            assignedRole: userData.assignedRole || '',
            department: userData.department || '',
            semester: userData.semester || '',
            teachingAssignments: userData.teachingAssignments || [],
            phone: userData.phone || '',
            bio: userData.bio || '',
            profileImage: userData.profileImage || '',
            regdNo: userData.regdNo || '',
            accessInfo: {
                tier: userData.tier || userData.role,
                canEditTimetable: canEdit
            }
        });
        setLoading(false); // CRITICAL: Stop loading once login is processed
    };

    const updateUser = (newDetails) => {
        setUser((prev) => ({ ...prev, ...newDetails }));
    };

    const logout = () => {
        setUser(emptyUser);
        localStorage.removeItem('token');
    };

    return (
        <UserContext.Provider value={{ user, updateUser, login, logout, loading }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
