import { createAsyncThunk } from "@reduxjs/toolkit";
import { certificationApi } from "./certification-api";
import { CreateCertificationDTO, UpdateCertificationDTO } from "./certification-types";

export const getProfileCertificationsThunk = createAsyncThunk(
    "certifications/getProfile",
    async (profileId: string) => {
        return await certificationApi.getProfileCertifications(profileId);
    }
);

export const addCertificationThunk = createAsyncThunk(
    "certifications/add",
    async (dto: CreateCertificationDTO) => {
        return await certificationApi.add(dto);
    }
);

export const updateCertificationThunk = createAsyncThunk(
    "certifications/update",
    async ({ id, dto }: { id: string; dto: UpdateCertificationDTO }) => {
        return await certificationApi.update(id, dto);
    }
);

export const deleteCertificationThunk = createAsyncThunk(
    "certifications/delete",
    async (id: string) => {
        await certificationApi.remove(id);
        return id;
    }
);
