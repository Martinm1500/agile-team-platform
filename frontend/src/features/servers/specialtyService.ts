import api from "../../lib/axios";
import type { Specialty } from "./serverTypes";

export const getSpecialtiesByProjectIdRequest = async (
  projectId: number
): Promise<Specialty[]> => {
  const res = await api.get<Specialty[]>(
    `/api/specialties/project/${projectId}`
  );
  return res.data;
};
