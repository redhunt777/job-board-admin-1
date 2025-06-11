import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { createClient } from '@/utils/supabase/client';
import { Tables } from '@/types/supabase';

const supabase = createClient();

// Types from your existing code
export type JobApplication = Tables<'job_applications'>;
export type CandidateProfile = Tables<'candidates_profiles'>;
export type Job = Tables<'jobs'>;
export type Education = Tables<'education'>;
export type Experience = Tables<'experience'>;

// Enhanced user context type
export interface UserContext {
    userId: string;
    organizationId: string;
    roles: string[]; // ['admin', 'hr', 'ta']
}

// Enhanced type for joined data with proper nullable handling
export type CandidateWithApplication = {
    // Application fields
    application_id: string;
    applied_date: string;
    application_status: string;
    created_at: string;
    updated_at: string;

    // Candidate profile fields
    id: string;
    auth_id: string | null;
    name: string;
    candidate_email: string;
    mobile_number: string | null;
    address: string | null;
    gender: string | null;
    disability: boolean | null;
    resume_link: string | null;
    portfolio_url: string | null;
    linkedin_url: string | null;
    additional_doc_link: string | null;
    current_ctc: number | null;
    expected_ctc: number | null;
    notice_period: string | null;
    dob: string | null;

    // Job fields
    job_id: string;
    job_title: string;
    company_name: string | null;
    job_location: string | null;
    job_location_type: string | null;
    job_type: string | null;
    working_type: string | null;
    min_experience_needed: number | null;
    max_experience_needed: number | null;
    min_salary: number | null;
    max_salary: number | null;
    company_logo_url: string | null;
    job_description: string | null;
    application_deadline: string | null;
    job_status: string | null;

    // Related data
    education?: Education[] | null;
    experience?: Experience[] | null;

    // Access control flag
    hasAccess?: boolean;
};

export interface CandidateFilters {
    status: 'All' | 'pending' | 'accepted' | 'rejected';
    location: string;
    jobTitle: string;
    company: string;
    experienceRange: string;
    salaryMin: number | null;
    salaryMax: number | null;
    skills: string;
    dateFrom: string;
    dateTo: string;
    gender: string;
    disability: boolean | null;
    noticePreriod: string;
}

export type SortOption = 'name_asc' | 'name_desc' | 'date_asc' | 'date_desc' | 'salary_asc' | 'salary_desc';

export interface ApplicationStats {
    totalApplications: number;
    pendingApplications: number;
    acceptedApplications: number;
    rejectedApplications: number;
    todayApplications: number;
    thisWeekApplications: number;
    thisMonthApplications: number;
}

// Enhanced async thunk with role-based access control
export const fetchJobApplicationsWithAccess = createAsyncThunk(
    'candidates/fetchJobApplicationsWithAccess',
    async (
        {
            filters = {},
            userContext
        }: {
            filters?: Partial<CandidateFilters>;
            userContext: UserContext;
        },
        { rejectWithValue }
    ) => {
        try {
            const { userId, organizationId, roles } = userContext;

            // Check if user has admin or hr role (full access)
            const hasFullAccess = roles.includes('admin') || roles.includes('hr');

            let query = supabase
                .from('job_applications')
                .select(`
          id,
          applied_date,
          application_status,
          created_at,
          updated_at,
          job_id,
          candidate_id,
          candidates_profiles!job_applications_candidate_id_fkey (
            id,
            auth_id,
            name,
            candidate_email,
            mobile_number,
            address,
            gender,
            disability,
            resume_link,
            portfolio_url,
            linkedin_url,
            additional_doc_link,
            current_ctc,
            expected_ctc,
            notice_period,
            created_at,
            updated_at,
            dob,
            education (
              id,
              profile_id,
              degree,
              college_university,
              field_of_study,
              grade_percentage,
              is_current,
              start_date,
              end_date
            ),
            experience (
              experience_id,
              profile_id,
              company_name,
              job_title,
              job_type,
              start_date,
              end_date,
              currently_working
            )
          ),
          jobs!job_applications_job_id_fkey (
            id,
            title,
            company_name,
            location,
            job_location_type,
            job_type,
            working_type,
            min_experience_needed,
            max_experience_needed,
            salary_min,
            salary_max,
            company_logo_url,
            description,
            application_deadline,
            status,
            created_at,
            organization_id
          )
        `);

            // For TA role, only show jobs they have access to
            if (!hasFullAccess && roles.includes('ta')) {
                // First, get accessible job IDs for this TA
                const { data: accessibleJobs, error: accessError } = await supabase
                    .from('job_access_control')
                    .select('job_id')
                    .eq('user_id', userId)
                    .eq('access_type', 'granted');

                if (accessError) {
                    throw new Error(`Failed to fetch job access: ${accessError.message}`);
                }

                const jobIds = accessibleJobs?.map(job => job.job_id).filter((id): id is string => id !== null) || [];

                if (jobIds.length === 0) {
                    // No accessible jobs, return empty array
                    return [];
                }

                // Filter applications by accessible job IDs
                query = query.in('job_id', jobIds);
            }

            // Apply organization filter for all roles
            // Note: We'll filter by organization through the jobs table

            // Apply other filters
            if (filters.status && filters.status !== 'All') {
                query = query.eq('application_status', filters.status);
            }

            if (filters.dateFrom) {
                query = query.gte('applied_date', filters.dateFrom);
            }

            if (filters.dateTo) {
                query = query.lte('applied_date', filters.dateTo);
            }

            // Add pagination support
            const limit = 50;
            query = query.limit(limit).order('applied_date', { ascending: false });

            const { data, error } = await query;

            if (error) {
                console.error('Supabase query error:', error);
                throw new Error(`Database query failed: ${error.message}`);
            }

            if (!data) {
                return [];
            }

            // Transform and filter data based on organization
            const transformedData: CandidateWithApplication[] = data
                .filter((item) => {
                    // Filter by organization
                    return item.jobs?.organization_id === organizationId;
                })
                .map((item) => {
                    const profile = item.candidates_profiles;
                    const job = item.jobs;

                    if (!profile || !job) {
                        throw new Error(`Missing related data for application ${item.id}`);
                    }

                    return {
                        // Application fields
                        application_id: item.id,
                        applied_date: item.applied_date,
                        application_status: item.application_status,
                        created_at: item.created_at,
                        updated_at: item.updated_at,

                        // Profile fields
                        id: profile.id,
                        auth_id: profile.auth_id,
                        name: profile.name,
                        candidate_email: profile.candidate_email,
                        mobile_number: profile.mobile_number,
                        address: profile.address,
                        gender: profile.gender,
                        disability: profile.disability,
                        resume_link: profile.resume_link,
                        portfolio_url: profile.portfolio_url,
                        linkedin_url: profile.linkedin_url,
                        additional_doc_link: profile.additional_doc_link,
                        current_ctc: profile.current_ctc,
                        expected_ctc: profile.expected_ctc,
                        notice_period: profile.notice_period,
                        dob: profile.dob,

                        // Job fields
                        job_id: job.id,
                        job_title: job.title,
                        company_name: job.company_name,
                        job_location: job.location,
                        job_location_type: job.job_location_type,
                        job_type: job.job_type,
                        working_type: job.working_type,
                        min_experience_needed: job.min_experience_needed,
                        max_experience_needed: job.max_experience_needed,
                        min_salary: job.salary_min,
                        max_salary: job.salary_max,
                        company_logo_url: job.company_logo_url,
                        job_description: job.description,
                        application_deadline: job.application_deadline,
                        job_status: job.status,

                        // Related data
                        education: profile.education || [],
                        experience: profile.experience || [],

                        // Access control
                        hasAccess: true, // If we reach here, user has access
                    };
                });

            return transformedData;
        } catch (error) {
            console.log('fetchJobApplicationsWithAccess error:', error);
            return rejectWithValue(
                error instanceof Error ? error.message : 'Unknown error occurred'
            );
        }
    }
);

// Helper function to check if user can access a specific job
export const checkJobAccess = createAsyncThunk(
    'candidates/checkJobAccess',
    async (
        { jobId, userContext }: { jobId: string; userContext: UserContext },
        { rejectWithValue }
    ) => {
        try {
            const { userId, roles } = userContext;

            // Admin and HR have access to all jobs
            if (roles.includes('admin') || roles.includes('hr')) {
                return { jobId, hasAccess: true };
            }

            // For TA, check job_access_control table
            if (roles.includes('ta')) {
                const { data, error } = await supabase
                    .from('job_access_control')
                    .select('access_type')
                    .eq('job_id', jobId)
                    .eq('user_id', userId)
                    .single();

                if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
                    throw new Error(`Failed to check job access: ${error.message}`);
                }

                return {
                    jobId,
                    hasAccess: data?.access_type === 'granted' || false
                };
            }

            return { jobId, hasAccess: false };
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Failed to check job access'
            );
        }
    }
);

// Enhanced async thunk to update application status with access control
export const updateApplicationStatusWithAccess = createAsyncThunk(
    'candidates/updateApplicationStatusWithAccess',
    async (
        {
            applicationId,
            status,
            userContext
        }: {
            applicationId: string;
            status: string;
            userContext: UserContext;
        },
        { rejectWithValue }
    ) => {
        try {
            const { userId, roles } = userContext;

            // Check if user has permission to update application status
            if (!roles.includes('admin') && !roles.includes('hr') && !roles.includes('ta')) {
                throw new Error('Insufficient permissions to update application status');
            }

            // For TA, check if they have access to the specific job
            if (roles.includes('ta') && !roles.includes('admin') && !roles.includes('hr')) {
                // First get the job_id for this application
                const { data: appData, error: appError } = await supabase
                    .from('job_applications')
                    .select('job_id')
                    .eq('id', applicationId)
                    .single();

                if (appError) {
                    throw new Error(`Failed to fetch application: ${appError.message}`);
                }

                // Check if TA has access to this job
                const { data: accessData, error: accessError } = await supabase
                    .from('job_access_control')
                    .select('access_type')
                    .eq('job_id', appData.job_id)
                    .eq('user_id', userId)
                    .single();

                if (accessError && accessError.code !== 'PGRST116') {
                    throw new Error(`Failed to check job access: ${accessError.message}`);
                }

                if (!accessData || accessData.access_type !== 'granted') {
                    throw new Error('You do not have access to update this application');
                }
            }

            // Validate status
            const validStatuses = ['pending', 'accepted', 'rejected'];
            const normalizedStatus = status.toLowerCase();

            if (!validStatuses.includes(normalizedStatus)) {
                throw new Error(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
            }

            const { data, error } = await supabase
                .from('job_applications')
                .update({
                    application_status: normalizedStatus,
                    updated_at: new Date().toISOString()
                })
                .eq('id', applicationId)
                .select('id, application_status, updated_at')
                .single();

            if (error) {
                throw new Error(`Failed to update application status: ${error.message}`);
            }

            if (!data) {
                throw new Error('No data returned from update operation');
            }

            return {
                applicationId: data.id,
                status: data.application_status,
                updatedAt: data.updated_at
            };
        } catch (error) {
            console.log('updateApplicationStatusWithAccess error:', error);
            return rejectWithValue(
                error instanceof Error ? error.message : 'Failed to update application status'
            );
        }
    }
);

// Enhanced state interface
interface CandidatesState {
    candidates: CandidateWithApplication[];
    currentCandidate: CandidateWithApplication | null;
    loading: boolean;
    error: string | null;
    filters: CandidateFilters;
    sortBy: SortOption;
    pagination: {
        currentPage: number;
        totalPages: number;
        totalCandidates: number;
        candidatesPerPage: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
    stats: ApplicationStats;
    lastFetched: string | null;
    userContext: UserContext | null;
    accessibleJobs: string[]; // For TA users
}

const initialState: CandidatesState = {
    candidates: [],
    currentCandidate: null,
    loading: false,
    error: null,
    filters: {
        status: 'All',
        location: '',
        jobTitle: '',
        company: '',
        experienceRange: '',
        salaryMin: null,
        salaryMax: null,
        skills: '',
        dateFrom: '',
        dateTo: '',
        gender: '',
        disability: null,
        noticePreriod: '',
    },
    sortBy: 'date_desc',
    pagination: {
        currentPage: 1,
        totalPages: 1,
        totalCandidates: 0,
        candidatesPerPage: 20,
        hasNextPage: false,
        hasPreviousPage: false,
    },
    stats: {
        totalApplications: 0,
        pendingApplications: 0,
        acceptedApplications: 0,
        rejectedApplications: 0,
        todayApplications: 0,
        thisWeekApplications: 0,
        thisMonthApplications: 0,
    },
    lastFetched: null,
    userContext: null,
    accessibleJobs: [],
};

// Utility function to calculate stats
const calculateStats = (candidates: CandidateWithApplication[]): ApplicationStats => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    return {
        totalApplications: candidates.length,
        pendingApplications: candidates.filter(c => c.application_status === 'pending').length,
        acceptedApplications: candidates.filter(c => c.application_status === 'accepted').length,
        rejectedApplications: candidates.filter(c => c.application_status === 'rejected').length,
        todayApplications: candidates.filter(c =>
            new Date(c.applied_date) >= today
        ).length,
        thisWeekApplications: candidates.filter(c =>
            new Date(c.applied_date) >= weekAgo
        ).length,
        thisMonthApplications: candidates.filter(c =>
            new Date(c.applied_date) >= monthAgo
        ).length,
    };
};

const candidatesSlice = createSlice({
    name: 'candidates',
    initialState,
    reducers: {
        setUserContext: (state, action) => {
            state.userContext = action.payload;
        },

        setCurrentCandidate: (state, action) => {
            const applicationId = action.payload;
            const candidate = state.candidates.find(c => c.application_id === applicationId);
            state.currentCandidate = candidate || null;
        },

        clearCurrentCandidate: (state) => {
            state.currentCandidate = null;
        },

        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
            state.pagination.currentPage = 1;
        },

        clearFilters: (state) => {
            state.filters = initialState.filters;
            state.pagination.currentPage = 1;
        },

        setSortBy: (state, action) => {
            state.sortBy = action.payload;
        },

        setLoading: (state, action) => {
            state.loading = action.payload;
        },

        clearError: (state) => {
            state.error = null;
        },

        setPagination: (state, action) => {
            const newPagination = { ...state.pagination, ...action.payload };
            newPagination.hasNextPage = newPagination.currentPage < newPagination.totalPages;
            newPagination.hasPreviousPage = newPagination.currentPage > 1;
            state.pagination = newPagination;
        },

        updateApplicationStatusInList: (state, action) => {
            const { applicationId, status, updatedAt } = action.payload;

            // Update in candidates list
            const candidateIndex = state.candidates.findIndex(c => c.application_id === applicationId);
            if (candidateIndex !== -1) {
                state.candidates[candidateIndex].application_status = status;
                state.candidates[candidateIndex].updated_at = updatedAt;
            }

            // Update current candidate if it matches
            if (state.currentCandidate && state.currentCandidate.application_id === applicationId) {
                state.currentCandidate.application_status = status;
                state.currentCandidate.updated_at = updatedAt;
            }
        },

        refreshStats: (state) => {
            state.stats = calculateStats(state.candidates);
        },

        setAccessibleJobs: (state, action) => {
            state.accessibleJobs = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch job applications with access control
            .addCase(fetchJobApplicationsWithAccess.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchJobApplicationsWithAccess.fulfilled, (state, action) => {
                state.loading = false;
                state.candidates = action.payload;
                state.stats = calculateStats(action.payload);
                state.lastFetched = new Date().toISOString();
                state.error = null;
            })
            .addCase(fetchJobApplicationsWithAccess.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.candidates = [];
            })

            // Update application status with access control
            .addCase(updateApplicationStatusWithAccess.pending, (state) => {
                state.error = null;
            })
            .addCase(updateApplicationStatusWithAccess.fulfilled, (state, action) => {
                candidatesSlice.caseReducers.updateApplicationStatusInList(state, action);
                candidatesSlice.caseReducers.refreshStats(state);
            })
            .addCase(updateApplicationStatusWithAccess.rejected, (state, action) => {
                state.error = action.payload as string;
            })

            // Check job access
            .addCase(checkJobAccess.fulfilled, (state, action) => {
                const { jobId, hasAccess } = action.payload;
                if (hasAccess && !state.accessibleJobs.includes(jobId)) {
                    state.accessibleJobs.push(jobId);
                }
            });
    },
});

export const {
    setUserContext,
    setCurrentCandidate,
    clearCurrentCandidate,
    setFilters,
    clearFilters,
    setSortBy,
    setLoading,
    clearError,
    setPagination,
    updateApplicationStatusInList,
    refreshStats,
    setAccessibleJobs,
} = candidatesSlice.actions;

// Enhanced selectors with proper typing
type RootState = { candidates: CandidatesState };

// Basic selectors
export const selectCandidates = (state: RootState) => state.candidates.candidates;
export const selectCurrentCandidate = (state: RootState) => state.candidates.currentCandidate;
export const selectCandidatesLoading = (state: RootState) => state.candidates.loading;
export const selectCandidatesError = (state: RootState) => state.candidates.error;
export const selectFilters = (state: RootState) => state.candidates.filters;
export const selectSortBy = (state: RootState) => state.candidates.sortBy;
export const selectPagination = (state: RootState) => state.candidates.pagination;
export const selectStats = (state: RootState) => state.candidates.stats;
export const selectLastFetched = (state: RootState) => state.candidates.lastFetched;
export const selectUserContext = (state: RootState) => state.candidates.userContext;
export const selectAccessibleJobs = (state: RootState) => state.candidates.accessibleJobs;

// Role-based access selectors
export const selectUserRoles = (state: RootState) => state.candidates.userContext?.roles || [];
export const selectHasFullAccess = (state: RootState) => {
    const roles = selectUserRoles(state);
    return roles.includes('admin') || roles.includes('hr');
};
export const selectIsTAOnly = (state: RootState) => {
    const roles = selectUserRoles(state);
    return roles.includes('ta') && !roles.includes('admin') && !roles.includes('hr');
};

// Memoized selector for filtered candidates with access control
export const selectFilteredCandidatesWithAccess = createSelector(
    [selectCandidates, selectFilters, selectSortBy, selectUserContext],
    (candidates, filters, sortBy, userContext) => {
        if (!Array.isArray(candidates) || !userContext) {
            return [];
        }

        const { roles } = userContext;
        const hasFullAccess = roles.includes('admin') || roles.includes('hr');

        let filteredCandidates = candidates.filter(candidate => {
            // Access control: If user is TA only, check if they have access to this job
            if (!hasFullAccess && roles.includes('ta')) {
                if (!candidate.hasAccess) {
                    return false;
                }
            }

            // Apply other filters
            if (filters.status !== 'All' && candidate.application_status !== filters.status) {
                return false;
            }

            if (filters.location &&
                !candidate.address?.toLowerCase().includes(filters.location.toLowerCase()) &&
                !candidate.job_location?.toLowerCase().includes(filters.location.toLowerCase())) {
                return false;
            }

            if (filters.jobTitle &&
                !candidate.job_title.toLowerCase().includes(filters.jobTitle.toLowerCase())) {
                return false;
            }

            if (filters.company &&
                !candidate.company_name?.toLowerCase().includes(filters.company.toLowerCase())) {
                return false;
            }

            if (filters.salaryMin && candidate.expected_ctc &&
                candidate.expected_ctc < filters.salaryMin) {
                return false;
            }

            if (filters.salaryMax && candidate.expected_ctc &&
                candidate.expected_ctc > filters.salaryMax) {
                return false;
            }

            if (filters.dateFrom && new Date(candidate.applied_date) < new Date(filters.dateFrom)) {
                return false;
            }

            if (filters.dateTo && new Date(candidate.applied_date) > new Date(filters.dateTo)) {
                return false;
            }

            if (filters.gender && candidate.gender !== filters.gender) {
                return false;
            }

            if (filters.disability !== null && candidate.disability !== filters.disability) {
                return false;
            }

            return true;
        });

        // Apply sorting
        filteredCandidates.sort((a, b) => {
            switch (sortBy) {
                case 'name_asc':
                    return a.name.localeCompare(b.name);
                case 'name_desc':
                    return b.name.localeCompare(a.name);
                case 'date_asc':
                    return new Date(a.applied_date).getTime() - new Date(b.applied_date).getTime();
                case 'date_desc':
                    return new Date(b.applied_date).getTime() - new Date(a.applied_date).getTime();
                case 'salary_asc':
                    return (a.expected_ctc || 0) - (b.expected_ctc || 0);
                case 'salary_desc':
                    return (b.expected_ctc || 0) - (a.expected_ctc || 0);
                default:
                    return 0;
            }
        });

        return filteredCandidates;
    }
);

// Memoized selector for paginated candidates
export const selectPaginatedCandidatesWithAccess = createSelector(
    [selectFilteredCandidatesWithAccess, selectPagination],
    (filteredCandidates, pagination) => {
        const { currentPage, candidatesPerPage } = pagination;
        const startIndex = (currentPage - 1) * candidatesPerPage;
        const endIndex = startIndex + candidatesPerPage;

        return filteredCandidates.slice(startIndex, endIndex);
    }
);

export default candidatesSlice.reducer;