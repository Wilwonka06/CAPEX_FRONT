import { describe, it, expect } from 'vitest';
import { validateRole } from '../../../../../shared/validations';

describe('Validations Test', () => {
    it('should validate role correctly', () => {
        const result = validateRole({ nombre: 'Test' }, {});
        expect(result).toBeDefined();
    });
});
