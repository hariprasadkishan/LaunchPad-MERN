import api from './api'

export const getIdeas = () => api.get('/ideas').then(r => r.data)
export const getIdea = (id) => api.get(`/ideas/${id}`).then(r => r.data)
export const createIdea = (data) => api.post('/ideas', data).then(r => r.data)
export const updateIdea = (id, data) => api.put(`/ideas/${id}`, data).then(r => r.data)
export const deleteIdea = (id) => api.delete(`/ideas/${id}`).then(r => r.data)
