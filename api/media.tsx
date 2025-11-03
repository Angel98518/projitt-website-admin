import axios from "axios";

export const uploadMedia = async (data: any): Promise<any> => {
    return axios.post(`${process.env.NEXT_PUBLIC_BASE_PATH}/media/add`, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const getFileFromServer = async (page: number): Promise<any> => {
    return axios.get(`${process.env.NEXT_PUBLIC_BASE_PATH}/media/all?per_page=5&page=${page}&pagination=1`);
};
