import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock de localStorage (necesario para tests en JSDOM)
global.localStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};

// Mock de console para reducir ruido
global.console = {
    ...console,
    log: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    // Mantener error para debugging
    error: console.error,
};
