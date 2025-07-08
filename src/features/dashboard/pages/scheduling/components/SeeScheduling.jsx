import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';

export default function SeeScheduling({ isOpen, onClose, title, children, onDelete, onEdit, canEdit = false, canDelete = false }) {
  const [editMode, setEditMode] = useState(false);

  const handleEdit = () => {
    setEditMode(true);
    if (onEdit) onEdit();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <Dialog.Title className="text-lg font-medium text-gray-900">
                  {title}
                </Dialog.Title>
                <div className="mt-4">{children}</div>
                <div className="mt-6 flex justify-end gap-2">
                  {canEdit && (
                    <button
                      onClick={handleEdit}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
                      Editar
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={onDelete}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition">
                      Eliminar
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition">
                    Cerrar
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
