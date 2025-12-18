import { Activity } from "../types";

/**
 * Calcula o total de horas válidas considerando o limite por tipo de atividade.
 * @param activities Lista de atividades do aluno
 * @param limitPerType Limite máximo de horas permitido por cada tipo
 * @returns Total de horas válidas
 */
export const calculateValidHours = (
  activities: Activity[],
  limitPerType: number
): number => {
  const typeMap: Record<string, number> = {};

  // 1. Agrupa horas por tipo
  activities.forEach((act) => {
    typeMap[act.type] = (typeMap[act.type] || 0) + act.hours;
  });

  // 2. Soma aplicando o teto
  return Object.values(typeMap).reduce((acc, currentHours) => {
    return acc + Math.min(currentHours, limitPerType);
  }, 0);
};

/**
 * Retorna os dados detalhados para exibição (útil para o Perfil)
 */
export const getHoursBreakdown = (
  activities: Activity[],
  limitPerType: number
) => {
  const typeMap: Record<string, number> = {};
  
  activities.forEach((act) => {
    typeMap[act.type] = (typeMap[act.type] || 0) + act.hours;
  });

  return Object.entries(typeMap).map(([type, rawHours]) => ({
    type,
    rawHours,
    validHours: Math.min(rawHours, limitPerType),
    isCapped: rawHours > limitPerType
  }));
};