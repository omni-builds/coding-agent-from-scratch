export const planHasCoderWork = (plan: string) =>
  /##\s*Coder[\s\S]*?- \[[ ]\]/i.test(plan);
