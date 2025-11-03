import axios from "axios";

export const addJobDetails = async (data: any) => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_PATH}/employee/add`, data);
    return response.data;
}

export const updateRoleStep = async (data: any) => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_PATH}/employee/update/step-2`, data);
    return response.data;
}

export const updateCompensationStep = async (data: any) => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_PATH}/employee/update/step-3`, data);
    return response.data;
}

export const updateOnboardingStep = async (data: any) => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_PATH}/employee/update/step-4`, data);
    return response.data;
}

export const addTeam = async (data: any) => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_PATH}/team/add`, data);
    return response.data;
}

export const getEmployees = async (data?: any) => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_PATH}/employee/list-with-filters`, { params: data });
    return response.data;
}

export const getTeams = async (data?: any) => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_PATH}/team/list-with-filters`, { params: data });
    return response.data;
}

export const editTeam = async (data: any) => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_PATH}/team/edit`, data);
    return response.data;
}

export const deleteTeam = async (data: any) => {
    const response = await axios.delete(`${process.env.NEXT_PUBLIC_BASE_PATH}/team/delete`, { data });
    return response.data;
}

export const mergeTeam = async (data: any) => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_PATH}/team/merge`, data);
    return response.data;
}