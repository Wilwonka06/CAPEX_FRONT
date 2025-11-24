import PropTypes from "prop-types";

export default function ModalShell({ iconClass = "", title = "", onClose, footer, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full relative animate-fade-in max-h-[90vh] flex flex-col overflow-hidden">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-white rounded-t-2xl flex items-center justify-between px-6 py-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <i className={`${iconClass} text-lg`}></i>
            </div>
            <h2 className="text-xl font-bold m-0">{title}</h2>
          </div>
          <button className="text-white/80 hover:text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition" onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        <div className="overflow-y-auto p-6 flex-1 bg-gray-50" style={{ maxHeight: 'calc(95vh - 120px)' }}>
          {children}
        </div>
        <div className="rounded-b-2xl flex justify-end px-6 py-3 bg-gray-50 border-t border-gray-200">
          {footer}
        </div>
      </div>
    </div>
  );
}

ModalShell.propTypes = {
  iconClass: PropTypes.string,
  title: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  footer: PropTypes.node,
  children: PropTypes.node
};