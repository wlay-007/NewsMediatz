import {
  createSlice,
  PayloadAction,
  createAsyncThunk,
  AnyAction,
} from "@reduxjs/toolkit";

type Posts = {
  id: string;
  title: string;
  body: string;
  userId: number;
  tags: string[];
  reactions: number;
};

type PostsState = {
  list: Posts[];
  loading: boolean;
  error: string | null;
};
export const fetchPosts = createAsyncThunk<
  Posts[],
  { limit: number; skip: number },
  { rejectValue: string }
>("posts/fetchPosts", async function ({ limit, skip }, { rejectWithValue }) {
  const response = await fetch(
    `https://dummyjson.com/posts?limit=${limit}&skip=${skip}`
  );

  if (!response.ok) {
    return rejectWithValue("Server Error!");
  }

  const data = await response.json();

  return data.posts;
});

const initialState: PostsState = {
  list: [],
  loading: false,
  error: null,
};

const postSlise = createSlice({
  name: "posts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.list = state.list.concat(action.payload);
        state.loading = false;
      })
      .addMatcher(isError, (state, action: PayloadAction<string>) => {
        state.error = action.payload;
        state.loading = false;
      });
  },
});

export default postSlise.reducer;

function isError(action: AnyAction) {
  return action.type.endsWith("rejected");
}
