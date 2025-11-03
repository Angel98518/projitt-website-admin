import axios from "axios";

export const addNewDetailJob = async (data: any) => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_PATH}/job/add`, data);
    return response.data;
}

export const getJobPostings = async (data: any) => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_PATH}/job/list-with-filters`, { params: data });
    return response.data;
}

export const editJobDescription = async (data: any) => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_PATH}/job/edit-description`, data);
    return response.data;
}

export const editDetailJob = async (data: any) => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_PATH}/job/edit`, data);
    return response.data;
}

export const getJobDetails = async (id: string) => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_PATH}/job/single/${id}`);
    return response.data;
}

export const deleteJob = async (ids: string[]) => {
    const response = await axios.delete(`${process.env.NEXT_PUBLIC_BASE_PATH}/job/delete`, { data: { ids } });
    return response.data;
}

export const publishJob = async (id: string) => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_PATH}/job/publish`, { id });
    return response.data;
}

export const duplicateJob = async (id: string) => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_PATH}/job/duplicate/${id}`);
    return response.data;
}

export const changeJobStatus = async (id: string, status: string) => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_PATH}/job/change-status`, { ids: [id], status });
    return response.data;
}

export const changeJobStatusMultiple = async (ids: string[], status: string) => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_PATH}/job/change-status`, { ids, status });
    return response.data;
}

export const addStageApi = async (stageName: string, type: number, subType: number, jobId: number | null) => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_PATH}/job/stage-add`, { name: stageName, type_id: type, sub_type_id: subType, job_id: jobId });
    return response.data;
}

export const removeStageApi = async (id: number) => {
    const response = await axios.delete(`${process.env.NEXT_PUBLIC_BASE_PATH}/job/stage-delete`, { data: { ids: [id] } });
    return response.data;
}

export const getDescription = async () => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_PATH}/job/intellisense-search`);
    return response.data;
}

export const getPipeline = async (jobId: number) => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_PATH}/job/stage`, { params: { job_id: jobId } });
    return response.data;
}

export const savePipelineApi = async (jobId: number, pipeline: any) => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_PATH}/job/stage-change-order`, { job_id: jobId, order: pipeline });
    return response.data;
}

// Question management APIs
export const addQuestionItem = async (data: {
    question_name: string;
    answer_type: string;
    options?: string[] | null;
    is_required: boolean;
    tags: string[];
}): Promise<{
    status: boolean;
    message: string;
    data: {
        id: number;
        question_name: string;
        answer_type: string;
        options: string[] | null;
        is_required: boolean;
        correct_answer: string | null;
        tags: string[];
        created_at: string;
        updated_at: string;
    };
}> => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_PATH}/question/add`, data);
    return response.data;
}

export const editQuestionItem = async (data: {
    id: number;
    question_name: string;
    answer_type: string;
    options?: string[] | null;
    is_required: boolean;
    tags: string[];
}): Promise<{
    status: boolean;
    message: string;
    data: {
        id: number;
        question_name: string;
        answer_type: string;
        options: string[] | null;
        is_required: boolean;
        correct_answer: string | null;
        tags: string[];
        created_at: string;
        updated_at: string;
    };
}> => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_PATH}/question/edit`, data);
    return response.data;
}

export const editJobQuestions = async (data: {
    id: number;
    question_ids: number[];
}): Promise<{
    status: boolean;
    message: string;
    data: unknown;
}> => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_PATH}/job/edit-questions`, data);
    return response.data;
}

// Get all questions with filters
export const getAllQuestions = async (): Promise<{
    status: boolean;
    message: string;
    data: Array<{
        id: number;
        question_name: string;
        answer_type: string;
        options: string[] | null;
        is_required: boolean;
        tags: string[];
    }>;
}> => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_PATH}/question/list-with-filters`);
    return response.data;
}


export const getAssessments = async () => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_PATH}/assessment/list-with-filters`);
    return response.data;
}

export const getAssessmentDetails = async (id: string) => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_PATH}/assessment/single/${id}`);
    return response.data;
}

export const createAssessment = async (data: any) => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_PATH}/assessment/add`, data);
    return response.data;
}

export const editAssessment = async (data: any) => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_PATH}/assessment/edit`, data);
    return response.data;
}

export const deleteAssessment = async (id: string) => {
    const response = await axios.delete(`${process.env.NEXT_PUBLIC_BASE_PATH}/assessment/delete/${id}`);
    return response.data;
}

export const closeAssessment = async (id: string) => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_PATH}/assessment/close`, { id });
    return response.data;
}

export const unpublishAssessment = async (id: string) => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_PATH}/assessment/unpublish`, { id });
    return response.data;
}

export const editJobMedia = async (data: {
    id: string;
    media_ids: number[];
}): Promise<{
    status: boolean;
    message: string;
    data: unknown;
}> => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_PATH}/job/edit-media`, data);
    return response.data;
}
