// src/presentation/styles/constants.ts
export const buttonStyles = {
    primary: 'bg-cyan-500 text-white hover:bg-cyan-600 px-4 py-2 rounded-lg transition-colors duration-200',
    secondary: 'bg-slate-700 text-gray-300 hover:bg-slate-600 px-4 py-2 rounded-lg transition-colors duration-200',
} as const;

export const cardStyles = {
    base: 'bg-slate-800 rounded-lg border border-slate-700',
    padded: 'bg-slate-800 rounded-lg border border-slate-700 p-6',
} as const;