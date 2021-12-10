import { selectMedias } from '../Utils/selectors'
import { createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

const initialState = {
  status: 'void',
  data: null,
  error:null
}

const { actions, reducer } = createSlice({
  name: 'medias',
  initialState,
  reducers: {
    fetching: (draft, action) => {
      if (draft.status === 'void') {
        draft.status = 'pending'
        return
      }
      if (draft.status === 'rejected') {
        draft.error = null
        draft.status = 'pending'
        return
      }
      if (draft.status === 'resolved') {
        draft.status = 'updating'
        return
      }
      return
    },
    resolved: (draft, action) => {
      if (draft.status === 'pending' || draft.status === 'updating') {
        draft.status = 'resolved'
        draft.data = action.payload
        return
      }
      return
    },
    rejected: (draft, action) => {
      if (draft.status === 'pending' || draft.status === 'updating') {
        draft.status = 'rejected'
        draft.data = null
        draft.error = action.payload
        return
      }
      return
    },
  },
})

//exemple pour éviter warning
export async function login(store, body) {
  const status = selectMedias(store.getState()).status
  const axiosBody = {
    method: 'post',
    url: `http://localhost:3001/api/auth/login`,
    data: body,
  }
  if (status === 'pending' || status === 'updating') {
    return
  }
  store.dispatch(actions.fetching())
  try {
    const response = await axios(axiosBody)
    const data = await response.data.body
    store.dispatch(actions.resolved(data))
  } catch (error) {
    store.dispatch(actions.rejected(error))
  }
}

export default reducer