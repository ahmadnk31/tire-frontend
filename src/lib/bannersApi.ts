import apiClient from "./api";

export const bannersApi = {
  async getAll() {
    return apiClient.get("/banners");
  },
  async create(banner, token) {
    return apiClient.post("/banners", banner, token);
  },
  async update(id, banner, token) {
    return apiClient.put(`/banners/${id}`, banner, token);
  },
  async remove(id) {
    return apiClient.delete(`/banners/${id}`);
  },
};
