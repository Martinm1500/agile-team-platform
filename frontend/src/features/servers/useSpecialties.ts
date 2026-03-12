import { useAppDispatch } from "../../hooks/redux";
import { useCallback } from "react";
import { getSpecialties } from "./specialtiesSlice";

export const useSpecialties = () => {
  const dispatch = useAppDispatch();

  const fetchSpecialties = useCallback(
    async (projectId: number) => {
      try {
        await dispatch(getSpecialties(projectId)).unwrap();
      } catch (error) {
        console.error("Error al obtener especialidades:", error);
      }
    },
    [dispatch]
  );

  return { fetchSpecialties };
};
