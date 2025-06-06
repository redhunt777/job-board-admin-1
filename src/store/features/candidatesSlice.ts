import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { createClient } from '@/utils/supabase/client';
import { Tables } from '@/types/supabase'; // Adjust import path as needed

const supabase = createClient();

// Use Supabase generated types
export type JobApplication = Tables<'job_applications'>;
export type CandidateProfile = Tables<'candidate_profiles'>;
export type Job = Tables<'jobs'>;
export type Education = Tables<'education'>;
export type Experience = Tables<'experience'>;

// Enhanced type for joined data with proper nullable handling
export type CandidateWithApplication = {
    // Application fields
    application_id: string;
    applied_date: string;
    application_status: string;
    created_at: string;
    updated_at: string;

    // Candidate profile fields (matching actual database schema)
    profile_id: string;
    candidate_id: string | null;
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
    requirements: string[] | null;
    benefits: string[] | null;
    application_deadline: string | null;
    job_status: string | null;

    // Related data
    education?: Education[] | null; // Nullable array
    experience?: Experience[] | null; // Nullable array
};

// Improved filter types with proper constraints
export interface CandidateFilters {
    status: 'All' | 'pending' | 'accepted' | 'rejected';
    location: string;
    jobTitle: string;
    company: string;
    experienceRange: string; // e.g., "0-2", "3-5", "5+"
    salaryMin: number | null;
    salaryMax: number | null;
    skills: string;
    dateFrom: string;
    dateTo: string;
    gender: string;
    disability: boolean | null;
    noticePreriod: string;
}

// Sort options type
export type SortOption = 'name_asc' | 'name_desc' | 'date_asc' | 'date_desc' | 'salary_asc' | 'salary_desc';

// Stats interface
export interface ApplicationStats {
    totalApplications: number;
    pendingApplications: number;
    acceptedApplications: number;
    rejectedApplications: number;
    todayApplications: number;
    thisWeekApplications: number;
    thisMonthApplications: number;
}

// Async thunk to fetch job applications with enhanced error handling
export const fetchJobApplications = createAsyncThunk(
    'candidates/fetchJobApplications',
    async (
        filters: Partial<CandidateFilters> = {},
        { rejectWithValue }
    ) => {
        try {
            let query = supabase
                .from('job_applications')
                .select(`
          application_id,
          applied_date,
          application_status,
          created_at,
          updated_at,
          job_id,
          profile_id,
          candidate_profiles!job_applications_profile_id_fkey (
            profile_id,
            candidate_id,
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
              education_id,
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
            job_id,
            job_title,
            company_name,
            job_location,
            job_location_type,
            job_type,
            working_type,
            min_experience_needed,
            max_experience_needed,
            min_salary,
            max_salary,
            company_logo_url,
            job_description,
            requirements,
            benefits,
            application_deadline,
            status,
            created_at
          )
        `).order('applied_date', { ascending: false });

            // Apply filters with proper type checking
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
            query = query.limit(limit);

            const { data, error } = await query;

            if (error) {
                console.error('Supabase query error:', error);
                throw new Error(`Database query failed: ${error.message}`);
            }

            if (!data) {
                return [];
            }

            // Transform data with proper null checking and type safety
            const transformedData: CandidateWithApplication[] = data.map((item) => {
                const profile = item.candidate_profiles;
                const job = item.jobs;

                if (!profile || !job) {
                    throw new Error(`Missing related data for application ${item.application_id}`);
                }

                return {
                    // Application fields
                    application_id: item.application_id,
                    applied_date: item.applied_date,
                    application_status: item.application_status,
                    created_at: item.created_at,
                    updated_at: item.updated_at,

                    // Profile fields
                    profile_id: profile.profile_id,
                    candidate_id: profile.candidate_id,
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
                    job_id: job.job_id,
                    job_title: job.job_title,
                    company_name: job.company_name,
                    job_location: job.job_location,
                    job_location_type: job.job_location_type,
                    job_type: job.job_type,
                    working_type: job.working_type,
                    min_experience_needed: job.min_experience_needed,
                    max_experience_needed: job.max_experience_needed,
                    min_salary: job.min_salary,
                    max_salary: job.max_salary,
                    company_logo_url: job.company_logo_url,
                    job_description: job.job_description,
                    requirements: job.requirements,
                    benefits: job.benefits,
                    application_deadline: job.application_deadline,
                    job_status: job.status,

                    // Related data
                    education: profile.education || [],
                    experience: profile.experience || [],
                };
            });

            return transformedData;
        } catch (error) {
            console.log('fetchJobApplications error:', error);
            return rejectWithValue(
                error instanceof Error ? error.message : 'Unknown error occurred'
            );
        }
    }
);

// Enhanced async thunk to update application status
export const updateApplicationStatus = createAsyncThunk(
    'candidates/updateApplicationStatus',
    async (
        { applicationId, status }: { applicationId: string; status: string },
        { rejectWithValue }
    ) => {
        try {
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
                .eq('application_id', applicationId)
                .select('application_id, application_status, updated_at')
                .single();

            if (error) {
                throw new Error(`Failed to update application status: ${error.message}`);
            }

            if (!data) {
                throw new Error('No data returned from update operation');
            }

            return {
                applicationId: data.application_id,
                status: data.application_status,
                updatedAt: data.updated_at
            };
        } catch (error) {
            console.log('updateApplicationStatus error:', error);
            return rejectWithValue(
                error instanceof Error ? error.message : 'Failed to update application status'
            );
        }
    }
);

// Enhanced async thunk to fetch single candidate with related data
export const fetchCandidateByApplicationId = createAsyncThunk(
    'candidates/fetchCandidateByApplicationId',
    async (applicationId: string, { rejectWithValue }) => {
        try {
            const { data, error } = await supabase
                .from('job_applications')
                .select(`
          *,
          candidate_profiles!job_applications_profile_id_fkey (
            *,
            education (*),
            experience (*)
          ),
          jobs!job_applications_job_id_fkey (*)
        `)
                .eq('application_id', applicationId)
                .single();

            if (error) {
                throw new Error(`Failed to fetch candidate: ${error.message}`);
            }

            if (!data) {
                throw new Error('Candidate not found');
            }

            return data;
        } catch (error) {
            console.error('fetchCandidateByApplicationId error:', error);
            return rejectWithValue(
                error instanceof Error ? error.message : 'Failed to fetch candidate details'
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
            // Reset pagination when filters change
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
    },
    extraReducers: (builder) => {
        builder
            // Fetch job applications
            .addCase(fetchJobApplications.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchJobApplications.fulfilled, (state, action) => {
                state.loading = false;
                state.candidates = action.payload;
                state.stats = calculateStats(action.payload);
                state.lastFetched = new Date().toISOString();
                state.error = null;
            })
            .addCase(fetchJobApplications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.candidates = [];
            })

            // Update application status
            .addCase(updateApplicationStatus.pending, (state) => {
                state.error = null;
            })
            .addCase(updateApplicationStatus.fulfilled, (state, action) => {
                candidatesSlice.caseReducers.updateApplicationStatusInList(state, action);
                candidatesSlice.caseReducers.refreshStats(state);
            })
            .addCase(updateApplicationStatus.rejected, (state, action) => {
                state.error = action.payload as string;
            })

            // Fetch candidate by application ID
            .addCase(fetchCandidateByApplicationId.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCandidateByApplicationId.fulfilled, (state, action) => {
                state.loading = false;
                const item = action.payload;
                const profile = item.candidate_profiles;
                const job = item.jobs;

                if (profile && job) {
                    state.currentCandidate = {
                        // Application fields
                        application_id: item.application_id,
                        applied_date: item.applied_date,
                        application_status: item.application_status,
                        created_at: item.created_at,
                        updated_at: item.updated_at,

                        // Profile fields
                        profile_id: profile.profile_id,
                        candidate_id: profile.candidate_id,
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
                        job_id: job.job_id,
                        job_title: job.job_title,
                        company_name: job.company_name,
                        job_location: job.job_location,
                        job_location_type: job.job_location_type,
                        job_type: job.job_type,
                        working_type: job.working_type,
                        min_experience_needed: job.min_experience_needed,
                        max_experience_needed: job.max_experience_needed,
                        min_salary: job.min_salary,
                        max_salary: job.max_salary,
                        company_logo_url: job.company_logo_url,
                        job_description: job.job_description,
                        requirements: job.requirements,
                        benefits: job.benefits,
                        application_deadline: job.application_deadline,
                        job_status: job.status,

                        // Related data
                        education: profile.education || [],
                        experience: profile.experience || [],
                    };
                }
                state.error = null;
            })
            .addCase(fetchCandidateByApplicationId.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.currentCandidate = null;
            });
    },
});

export const {
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

// MEMOIZED SELECTORS - These are the fixed versions that prevent unnecessary re-renders

// Memoized selector for filtered candidates
export const selectFilteredCandidates = createSelector(
    [selectCandidates, selectFilters, selectSortBy],
    (candidates, filters, sortBy) => {
        // Ensure we always have an array
        if (!Array.isArray(candidates)) {
            return [];
        }

        let filteredCandidates = candidates.filter(candidate => {
            // Status filter
            if (filters.status !== 'All' && candidate.application_status !== filters.status) {
                return false;
            }

            // Location filter
            if (filters.location &&
                !candidate.address?.toLowerCase().includes(filters.location.toLowerCase()) &&
                !candidate.job_location?.toLowerCase().includes(filters.location.toLowerCase())) {
                return false;
            }

            // Job title filter
            if (filters.jobTitle &&
                !candidate.job_title.toLowerCase().includes(filters.jobTitle.toLowerCase())) {
                return false;
            }

            // Company filter
            if (filters.company &&
                !candidate.company_name?.toLowerCase().includes(filters.company.toLowerCase())) {
                return false;
            }

            // Salary filters
            if (filters.salaryMin && candidate.expected_ctc &&
                candidate.expected_ctc < filters.salaryMin) {
                return false;
            }

            if (filters.salaryMax && candidate.expected_ctc &&
                candidate.expected_ctc > filters.salaryMax) {
                return false;
            }

            // Date filters
            if (filters.dateFrom && new Date(candidate.applied_date) < new Date(filters.dateFrom)) {
                return false;
            }

            if (filters.dateTo && new Date(candidate.applied_date) > new Date(filters.dateTo)) {
                return false;
            }

            // Gender filter
            if (filters.gender && candidate.gender !== filters.gender) {
                return false;
            }

            // Disability filter
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
export const selectPaginatedCandidates = createSelector(
    [selectFilteredCandidates, selectPagination],
    (filteredCandidates, pagination) => {
        const { currentPage, candidatesPerPage } = pagination;
        const startIndex = (currentPage - 1) * candidatesPerPage;
        const endIndex = startIndex + candidatesPerPage;

        return filteredCandidates.slice(startIndex, endIndex);
    }
);

// Memoized selector to get candidate by application ID
export const selectCandidateByApplicationId = createSelector(
    [selectCandidates, (state: RootState, applicationId: string) => applicationId],
    (candidates, applicationId) =>
        candidates.find(candidate => candidate.application_id === applicationId)
);

export default candidatesSlice.reducer;