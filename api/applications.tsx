import axios from "axios";

export const getApplicantJobs = async (id: string) => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_PATH}/job/get-applicant-jobs?applicant_id=${id}`);
    return response.data;
}

export const getJobApplications = async (id: string) => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_PATH}/job/get-job-applicant?job_id=${id}`);
    return response.data;
}

export const getApplicationInfo = async (job_id: string, applicant_id: string) => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_PATH}/job/applicant-single?job_id=${job_id}&applicant_id=${applicant_id}`);
    return response.data;
}

export const rejectApplication = async (ids: string[]) => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_PATH}/job/applicant-reject`, { applicant_ids: ids });
    return response.data;
}
