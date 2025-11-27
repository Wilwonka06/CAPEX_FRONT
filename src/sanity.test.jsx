import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('Sanity Check', () => {
    it('should render a div', () => {
        render(<div data-testid="test">Hello</div>);
        expect(screen.getByTestId('test')).toBeInTheDocument();
    });
});
