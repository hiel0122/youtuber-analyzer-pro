import { toast as s } from "sonner";

const base = { duration: 2200 } as const;

export const toast = {
  success: (m: string) => s.success(m, { ...base }),
  error:   (m: string) => s.error(m,   { ...base, duration: 2600 }),
  info:    (m: string) => s.message(m, { ...base, duration: 2000 }),
  warn:    (m: string) => s.warning(m, { ...base, duration: 2400 }),
};
