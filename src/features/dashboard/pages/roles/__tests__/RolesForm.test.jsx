import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import CreateRole from '../components/CreateRole';
import EditRole from '../components/EditRole';

// Mock completo del servicio de roles
vi.mock('../API/rolesService', () => ({
    rolesService: {
        getAll: vi.fn().mockResolvedValue([]),
        getAvailablePermissions: vi.fn().mockResolvedValue([
            { id_permiso: 1, nombre: 'Gestión de Usuarios' },
            { id_permiso: 2, nombre: 'Productos' }
        ]),
        getAvailablePrivileges: vi.fn().mockResolvedValue([
            { id_privilegio: 1, nombre: 'Visualizar' },
            { id_privilegio: 2, nombre: 'Crear' },
            { id_privilegio: 3, nombre: 'Editar' },
            { id_privilegio: 4, nombre: 'Eliminar' }
        ]),
        create: vi.fn().mockResolvedValue({ success: true }),
        update: vi.fn().mockResolvedValue({ success: true })
    }
}));

// Mock de PrivilegesTable
vi.mock('../components/PrivilegesTable', () => ({
    default: ({ value = {}, onChange }) => (
        <div data-testid="mock-privileges-table">
            Mock PrivilegesTable
            <span data-testid="privileges-count">
                {Object.keys(value).length}
            </span>
            <button
                data-testid="mock-add-privilege"
                onClick={() => onChange('usuarios', 'Crear', true)}
            >
                Add Privilege
            </button>
        </div>
    )
}));

describe('CreateRole Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render without hanging', async () => {
        render(
            <CreateRole
                isOpen={true}
                onClose={vi.fn()}
                onCreate={vi.fn()}
                roles={[]}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Crear nuevo rol')).toBeInTheDocument();
        }, { timeout: 5000 });
    });

    it('should display form elements', async () => {
        render(
            <CreateRole
                isOpen={true}
                onClose={vi.fn()}
                onCreate={vi.fn()}
                roles={[]}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Nombre')).toBeInTheDocument();
            expect(screen.getByText('Descripción (opcional)')).toBeInTheDocument();
            expect(screen.getByTestId('mock-privileges-table')).toBeInTheDocument();
            expect(screen.getByText('Crear Rol')).toBeInTheDocument();
        });
    });

    it('should call onCreate when form is submitted', async () => {
        const mockOnCreate = vi.fn();
        const user = userEvent.setup();

        render(
            <CreateRole
                isOpen={true}
                onClose={vi.fn()}
                onCreate={mockOnCreate}
                roles={[]}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Crear nuevo rol')).toBeInTheDocument();
        });

        // Llenar el formulario
        const inputs = screen.getAllByRole('textbox');
        await user.type(inputs[0], 'Test Role');
        await user.type(inputs[1], 'Test Description');

        // Agregar privilegio
        const addPrivBtn = screen.getByTestId('mock-add-privilege');
        await user.click(addPrivBtn);

        // Submit
        const submitBtn = screen.getByText('Crear Rol');
        await user.click(submitBtn);

        await waitFor(() => {
            expect(mockOnCreate).toHaveBeenCalled();
        }, { timeout: 5000 });
    });
});

describe('EditRole Component', () => {
    const mockRole = {
        id: 1,
        name: 'TestRole',
        nombre: 'TestRole',
        description: 'Test Description',
        descripcion: 'Test Description',
        estado: 'Activo',
        privileges: {
            'Gestión de Usuarios': {
                'Visualizar': true
            }
        },
        permisos: [],
        privilegios: []
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render edit modal', async () => {
        render(
            <EditRole
                isOpen={true}
                onClose={vi.fn()}
                onEdit={vi.fn()}
                role={mockRole}
                roles={[]}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Editar rol')).toBeInTheDocument();
        }, { timeout: 5000 });
    });

    it('should call onEdit when submitted with valid data', async () => {
        const mockOnEdit = vi.fn().mockResolvedValue({});
        const user = userEvent.setup();

        // Otros roles para validación de nombre único
        const otherRoles = [
            { id: 2, name: 'OtherRole', nombre: 'OtherRole' }
        ];

        render(
            <EditRole
                isOpen={true}
                onClose={vi.fn()}
                onEdit={mockOnEdit}
                role={mockRole}
                roles={otherRoles}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Editar rol')).toBeInTheDocument();
        });

        // Modificar el nombre a un nombre válido (más de 3 caracteres, único)
        const inputs = screen.getAllByRole('textbox');
        const nameInput = inputs[0];

        await user.clear(nameInput);
        await user.type(nameInput, 'UpdatedValidRole');

        // Esperar para que se ejecute validación
        await new Promise(resolve => setTimeout(resolve, 500));

        // Submit
        const submitBtn = screen.getByText('Guardar Cambios');
        await user.click(submitBtn);

        await waitFor(() => {
            expect(mockOnEdit).toHaveBeenCalled();
            const callArg = mockOnEdit.mock.calls[0][0];
            expect(callArg).toHaveProperty('id', 1);
            expect(callArg).toHaveProperty('name');
            expect(callArg).toHaveProperty('description');
            expect(callArg).toHaveProperty('privileges');
        }, { timeout: 5000 });
    });
});
