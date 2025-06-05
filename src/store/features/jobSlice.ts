import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();
// Async thunk to fetch all jobs (for server-side or client-side)
export const fetchJobs = createAsyncThunk(
    'jobs/fetchJobs',
    async (filters: Record<string, any> = {}, { rejectWithValue }) => {
        try {
            let query = supabase
                .from('jobs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(18);

            // Apply filters if provided
            if (filters.location) {
                query = query.ilike('job_location', `%${filters.location}%`);
            }
            if (filters.jobType) {
                query = query.eq('job_type', filters.jobType);
            }
            if (filters.company) {
                query = query.ilike('company_name', `%${filters.company}%`);
            }
            if (filters.salaryMin) {
                query = query.gte('min_salary', filters.salaryMin);
            }

            const { data, error } = await query;

            if (error) throw error;
            return data;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : String(error));
        }
    }
);

// Async thunk to fetch single job by ID (fallback when not in store)
export const fetchJobById = createAsyncThunk(
    'jobs/fetchJobById',
    async (jobId: string | number, { getState, rejectWithValue }) => {
        try {
            // First check if job exists in store
            const state = getState() as { jobs: typeof initialState };
            const existingJob = state.jobs.jobs.find((job: Job) => job.job_id === jobId);

            if (existingJob) {
                return existingJob;
            }

            // If not in store, fetch from database
            const { data, error } = await supabase
                .from('jobs')
                .select('*')
                .eq('job_id', String(jobId))
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : String(error));
        }
    }
);

// Async thunk to create a new job
export const createJob = createAsyncThunk(
    'jobs/createJob',
    async (jobData: Job, { rejectWithValue }) => {
        try {
            const { data, error } = await supabase
                .from('jobs')
                .insert(jobData)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error: any) {
            return rejectWithValue(error instanceof Error ? error.message : String(error));
        }
    }
);

// Async thunk to update job
export const updateJob = createAsyncThunk(
    'jobs/updateJob',
    async ({ job_id, updates }: { job_id: string; updates: Partial<Job> }, { rejectWithValue }) => {
        try {
            const { data, error } = await supabase
                .from('jobs')
                .update(updates)
                .eq('job_id', job_id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : String(error));
        }
    }
);

// Async thunk to delete job
export const deleteJob = createAsyncThunk(
    'jobs/deleteJob',
    async (job_Id: string, { rejectWithValue }) => {
        try {
            const { error } = await supabase
                .from('jobs')
                .delete()
                .eq('job_id', job_Id);

            if (error) throw error;
            return job_Id;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : String(error));
        }
    }
);

type Job = {
    admin_id: string
    application_deadline: string | null
    benefits: string[] | null
    company_logo_url: string | null
    company_name: string | null
    created_at: string | null
    job_description: string | null
    job_id: string
    job_location: string | null
    job_location_type: string | null
    job_title: string
    job_type: string | null
    max_experience_needed: number | null
    max_salary: number | null
    min_experience_needed: number | null
    min_salary: number | null
    requirements: string[] | null
    status: string | null
    updated_at: string | null
    working_type: string | null
};

interface JobState {
    jobs: Job[];
    currentJob: Job | null;
    loading: boolean;
    error: string | null;
    filters: {
        location: string;
        jobType: string;
        company: string;
        salaryMin: number | null;
    };
    pagination: {
        currentPage: number;
        totalPages: number;
        totalJobs: number;
        jobsPerPage: number;
    };
}

const initialState: JobState = {
    jobs: [],
    currentJob: null,
    loading: false,
    error: null,
    filters: {
        location: '',
        jobType: '',
        company: '',
        salaryMin: null,
    },
    pagination: {
        currentPage: 1,
        totalPages: 1,
        totalJobs: 0,
        jobsPerPage: 10,
    },
};

const jobSlice = createSlice({
    name: 'jobs',
    initialState,
    reducers: {
        // Set jobs from server-side data
        setJobs: (state, action) => {
            state.jobs = action.payload;
            state.loading = false;
            state.error = null;
        },

        // Set current job for detailed view
        setCurrentJob: (state, action) => {
            const jobId = action.payload;
            const job = state.jobs.find(job => job.job_id === jobId);
            if (job) {
                state.currentJob = job;
            }
        },

        // Clear current job
        clearCurrentJob: (state) => {
            state.currentJob = null;
        },

        // Update filters
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },

        // Clear filters
        clearFilters: (state) => {
            state.filters = initialState.filters;
        },

        // Set loading state
        setLoading: (state, action) => {
            state.loading = action.payload;
        },

        // Clear error
        clearError: (state) => {
            state.error = null;
        },

        // Update pagination
        setPagination: (state, action) => {
            state.pagination = { ...state.pagination, ...action.payload };
        },

        // Add single job to jobs array (useful for real-time updates)
        addJob: (state, action) => {
            state.jobs.unshift(action.payload);
        },

        // Remove job from jobs array
        removeJob: (state, action) => {
            state.jobs = state.jobs.filter(job => job.job_id !== action.payload);
        },

        // Update job in jobs array
        updateJobInList: (state, action) => {
            const index = state.jobs.findIndex(job => job.job_id === action.payload.job_id);
            if (index !== -1) {
                state.jobs[index] = action.payload;
            }
            // Also update current job if it's the same
            if (state.currentJob && state.currentJob.job_id === action.payload.job_id) {
                state.currentJob = action.payload;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch jobs cases
            .addCase(fetchJobs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchJobs.fulfilled, (state, action) => {
                state.loading = false;
                state.jobs = action.payload;
                state.error = null;
            })
            .addCase(fetchJobs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Fetch job by ID cases
            .addCase(fetchJobById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchJobById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentJob = action.payload;

                // Add to jobs array if not already present
                const existsInList = state.jobs.find(job => job.job_id === action.payload.job_id);
                if (!existsInList) {
                    state.jobs.push(action.payload);
                }
                state.error = null;
            })
            .addCase(fetchJobById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Create job cases
            .addCase(createJob.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createJob.fulfilled, (state, action) => {
                state.loading = false;
                state.jobs.unshift(action.payload);
                state.error = null;
            })
            .addCase(createJob.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Update job cases
            .addCase(updateJob.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateJob.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.jobs.findIndex(job => job.job_id === action.payload.job_id);
                if (index !== -1) {
                    state.jobs[index] = action.payload;
                }
                if (state.currentJob && state.currentJob.job_id === action.payload.job_id) {
                    state.currentJob = action.payload;
                }
                state.error = null;
            })
            .addCase(updateJob.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Delete job cases
            .addCase(deleteJob.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteJob.fulfilled, (state, action) => {
                state.loading = false;
                state.jobs = state.jobs.filter(job => job.job_id !== action.payload);
                if (state.currentJob && state.currentJob.job_id === action.payload) {
                    state.currentJob = null;
                }
                state.error = null;
            })
            .addCase(deleteJob.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const {
    setJobs,
    setCurrentJob,
    clearCurrentJob,
    setFilters,
    clearFilters,
    setLoading,
    clearError,
    setPagination,
    addJob,
    removeJob,
    updateJobInList,
} = jobSlice.actions;

// Define RootState type for selectors
type RootState = { jobs: JobState };

// Selectors
export const selectJobs = (state: RootState) => state.jobs.jobs;
export const selectCurrentJob = (state: RootState) => state.jobs.currentJob;
export const selectJobsLoading = (state: RootState) => state.jobs.loading;
export const selectJobsError = (state: RootState) => state.jobs.error;
export const selectFilters = (state: RootState) => state.jobs.filters;
export const selectPagination = (state: RootState) => state.jobs.pagination;

// Get job by ID selector
export const selectJobById = (state: RootState, jobId: string) =>
    state.jobs.jobs.find(job => job.job_id === jobId);

// Get filtered jobs selector
export const selectFilteredJobs = (state: RootState) => {
    const { jobs, filters } = state.jobs;

    return jobs.filter(job => {
        const matchesLocation = !filters.location ||
            job.job_location?.toLowerCase().includes(filters.location.toLowerCase());
        const matchesJobType = !filters.jobType || job.job_type === filters.jobType;
        const matchesCompany = !filters.company ||
            job.company_name?.toLowerCase().includes(filters.company.toLowerCase());
        const matchesSalary = !filters.salaryMin || (job.min_salary !== null && job.min_salary >= filters.salaryMin);

        return matchesLocation && matchesJobType && matchesCompany && matchesSalary;
    });
};

export default jobSlice.reducer;