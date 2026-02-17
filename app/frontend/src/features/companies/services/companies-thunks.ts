import { createAsyncThunk } from "@reduxjs/toolkit";
import { companiesApi } from "./companies-api";
import { CreateCompanyDTO, UpdateCompanyDTO } from "./companies-types";

export const getMyCompaniesThunk = createAsyncThunk(
    "companies/getMyCompanies",
    async (_, { rejectWithValue }) => {
        try {
            const response = await companiesApi.getMyCompanies();
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.userMessage || "Erreur lors de la récupération des entreprises");
        }
    }
);

export const createCompanyThunk = createAsyncThunk(
    "companies/createCompany",
    async (dto: CreateCompanyDTO, { rejectWithValue }) => {
        try {
            const response = await companiesApi.createCompany(dto);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.userMessage || "Erreur lors de la création de l'entreprise");
        }
    }
);

export const updateCompanyThunk = createAsyncThunk(
    "companies/updateCompany",
    async ({ id, dto }: { id: string; dto: UpdateCompanyDTO }, { rejectWithValue }) => {
        try {
            const response = await companiesApi.updateCompany(id, dto);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.userMessage || "Erreur lors de la mise à jour de l'entreprise");
        }
    }
);

export const deleteCompanyThunk = createAsyncThunk(
    "companies/deleteCompany",
    async (id: string, { rejectWithValue }) => {
        try {
            await companiesApi.deleteCompany(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Erreur lors de la suppression de l'entreprise");
        }
    }
);
