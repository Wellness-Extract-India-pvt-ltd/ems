import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    type: '',
    status: '',
};

const assetFilterSlice = createSlice({
    name: 'assetFilter',
    initialState,
    reducers: {
        setFilters: (state, action) => {
            const { type = '', status = '' } = action.payload || {};
            state.type = type;
            state.status = status;
        },
        resetFilters: (state) => {
            state.type = '';
            state.status = '';
        },
    },
});

export const { setFilters, resetFilters } = assetFilterSlice.actions;
export default assetFilterSlice.reducer;
