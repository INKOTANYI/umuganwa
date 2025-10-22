import Modal from '@/Components/Modal';
import { useEffect, useState } from 'react';

export default function SuccessModal({ message, open, onClose, autoCloseMs = 2500 }) {
    const [show, setShow] = useState(!!open);
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        setShow(!!open);
        if (open) {
            setProgress(100);
            const started = Date.now();
            const timer = setInterval(() => {
                const elapsed = Date.now() - started;
                const pct = Math.max(0, 100 - (elapsed / autoCloseMs) * 100);
                setProgress(pct);
                if (elapsed >= autoCloseMs) {
                    clearInterval(timer);
                    setShow(false);
                    onClose?.();
                }
            }, 50);
            return () => clearInterval(timer);
        }
    }, [open, autoCloseMs, onClose]);

    return (
        <Modal show={show} onClose={() => { setShow(false); onClose?.(); }} maxWidth="md">
            <div className="p-6">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                    </svg>
                </div>
                <h3 className="mb-1 text-center text-lg font-semibold text-gray-900">Success</h3>
                <p className="mb-6 text-center text-sm text-gray-600">{message || 'Action completed successfully.'}</p>
                <div className="mb-4 h-1 w-full overflow-hidden rounded bg-emerald-100">
                    <div className="h-1 bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex justify-center">
                    <button
                        type="button"
                        onClick={() => { setShow(false); onClose?.(); }}
                        className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                    >
                        OK
                    </button>
                </div>
            </div>
        </Modal>
    );
}
