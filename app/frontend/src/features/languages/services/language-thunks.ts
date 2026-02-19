import { createAsyncThunk } from "@reduxjs/toolkit";
import { languageApi } from "./language-api";
import { CreateLanguageDTO, UpdateLanguageDTO } from "./language-types";

export const getProfileLanguagesThunk = createAsyncThunk(
    "languages/getProfileLanguages",
    async (profileId: string) => {
        return await languageApi.getProfileLanguages(profileId);
    }
);

export const addLanguageThunk = createAsyncThunk(
    "languages/addLanguage",
    async (dto: CreateLanguageDTO) => {
        return await languageApi.addLanguage(dto);
    }
);

export const updateLanguageThunk = createAsyncThunk(
    "languages/updateLanguage",
    async ({ id, dto }: { id: string; dto: UpdateLanguageDTO }) => {
        return await languageApi.updateLanguage(id, dto);
    }
);

export const deleteLanguageThunk = createAsyncThunk(
    "languages/deleteLanguage",
    async (id: string) => {
        await languageApi.deleteLanguage(id);
        return id;
    }
);
