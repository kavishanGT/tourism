"use client";

import { useQuery } from "@tanstack/react-query";
import { getExperiences, type ExperienceListParams } from "@/lib/api/experiences";

export function useExperiences(params?: ExperienceListParams) {
  return useQuery({
    queryKey: ["experiences", params],
    queryFn: () => getExperiences(params),
  });
}
