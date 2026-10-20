import React from 'react';
import receiptImage from '../assets/talao-fiscal-oficial-agt.png';

export const LiveFiscalReceipt: React.FC = () => {
  return (
    <div className="flex justify-center items-center w-full py-2">
      <img
        src={receiptImage}
        alt="Talão Fiscal Oficial - Factura FT 2026/0007 Homologada pela AGT"
        className="max-w-[340px] sm:max-w-[380px] w-full h-auto object-contain rounded-2xl shadow-xl border border-slate-200/80 bg-white"
        loading="eager"
      />
    </div>
  );
};
