import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store'; // Import des types du store

// 1. On crée une version typée de useDispatch qui connaît nos Thunks
export const useAppDispatch = () => useDispatch<AppDispatch>();

// 2. On crée une version typée de useSelector qui connaît la structure de notre State
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;