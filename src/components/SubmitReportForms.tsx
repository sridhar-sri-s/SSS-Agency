import React, { useState } from 'react';
import { 
  Plus, Trash2, Camera, Keyboard, Calendar, 
  MapPin, AlertTriangle, CheckCircle, Info, Send, Clock, DollarSign, Package
} from 'lucide-react';
import { TeamMember, SalesReport, DamageReport, CollectionReport, PackingLog, ReturnReport, MileageReport, MarketCollection } from '../types';

interface SubmitReportFormsProps {
  currentRole: TeamMember;
  usersList: TeamMember[];
  onAddSalesReport: (report: SalesReport) => void;
  onAddDamageReport: (report: DamageReport) => void;
  onAddCollectionReport: (report: CollectionReport) => void;
  onAddPackingLog: (log: PackingLog) => void;
  onAddReturnReport: (report: ReturnReport) => void;
  onAddMileageReport: (report: MileageReport) => void;
  onAddMarketCollection: (collection: MarketCollection) => void;
}

export default function SubmitReportForms({
  currentRole,
  usersList,
  onAddSalesReport,
  onAddDamageReport,
  onAddCollectionReport,
  onAddPackingLog,
  onAddReturnReport,
  onAddMileageReport,
  onAddMarketCollection
}: SubmitReportFormsProps) {

  // derived packers from usersList
  const activePackers = usersList.filter(u => u.role === 'Packing');
  
  const [successMsg, setSuccessMsg] = useState('');
  const triggerSuccessMsg = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const handleSimulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      triggerSuccessMsg(`Document ${e.target.files[0].name} uploaded successfully!`);
      e.target.value = '';
    }
  };

  const renderUploadAlternate = () => (
    <div className="mt-6 flex flex-col md:flex-row items-center gap-4 bg-[#F5F5F7] p-3 rounded-lg border border-dashed border-[#D2D2D7]">
      <div className="flex-1 text-xs text-[#86868B] font-medium leading-relaxed">
        <strong className="text-[#1D1D1F]">Alternate Input Method:</strong> Instead of typing the values above, you can directly upload a photo of the receipt or paper log to automatically fill the form.
      </div>
      <button 
        type="button"
        onClick={() => fileInputRef.current?.click()} 
        className="shrink-0 flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-[#D2D2D7] text-[#1D1D1F] px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm"
      >
        <Camera size={14} className="text-[#0071E3]" />
        <span>Upload Document</span>
      </button>
    </div>
  );

  // --- SALESMAN WORKFLOWS ---
  const [salesTab, setSalesTab] = useState<'daily' | 'damage' | 'collection'>('daily');
  
  // Daily reports state
  const [dailySales, setDailySales] = useState('');
  const [dailyBeat, setDailyBeat] = useState(currentRole.detail || 'Downtown Metro');
  const [dailyDate, setDailyDate] = useState(new Date().toISOString().split('T')[0]);

  // Images
  const [reportImages, setReportImages] = useState<File[]>([]);
  
  // Image handling
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setReportImages([...reportImages, ...Array.from(e.target.files)]);
    }
  };

  // Damage reports state
  const [dmgShopNo, setDmgShopNo] = useState('');
  const [dmgShopName, setDmgShopName] = useState('');
  const [dmgItems, setDmgItems] = useState<{ id: string, product: string, quantity: number, mrp: number }[]>([]);
  const [dmgCurProduct, setDmgCurProduct] = useState('');
  const [dmgCurQty, setDmgCurQty] = useState('');
  const [dmgCurMRP, setDmgCurMRP] = useState('');
  const [dmgDate, setDmgDate] = useState(new Date().toISOString().split('T')[0]);

  const addDamageItem = () => {
    if (!dmgCurProduct || !dmgCurQty || !dmgCurMRP) return;
    setDmgItems([...dmgItems, { id: 'di-' + Date.now(), product: dmgCurProduct, quantity: parseInt(dmgCurQty), mrp: parseFloat(dmgCurMRP) }]);
    setDmgCurProduct('');
    setDmgCurQty('');
    setDmgCurMRP('');
  };

  // Salesmen collection reports state
  const [collAmount, setCollAmount] = useState('');
  const [collBeat, setCollBeat] = useState(currentRole.detail || 'Downtown Metro');
  const [collDate, setCollDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSalesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const imageNames = reportImages.map(f => URL.createObjectURL(f)); // MOCK URL

    if (salesTab === 'daily') {
      if (!dailySales) return alert('Please enter total sales amount');
      onAddSalesReport({
        id: 'sr-' + Date.now(),
        date: dailyDate,
        salesmanId: currentRole.id,
        salesmanName: currentRole.name,
        totalSales: parseFloat(dailySales),
        beatName: dailyBeat,
        status: 'Pending',
        timestamp: 'Oct 24, 09:15 AM', // mock current timestamp
        images: imageNames
      });
      setDailySales('');
      setReportImages([]);
      triggerSuccessMsg('Daily sales report submitted successfully!');
    } else if (salesTab === 'damage') {
      if (!dmgShopName || dmgItems.length === 0) return alert('Please complete the damage report form and add at least one product');
      onAddDamageReport({
        id: 'dr-' + Date.now(),
        date: dmgDate,
        salesmanId: currentRole.id,
        salesmanName: currentRole.name,
        shopNo: dmgShopNo || 'SH-' + Math.floor(100 + Math.random() * 900),
        shopName: dmgShopName,
        items: dmgItems,
        status: 'Pending',
        images: imageNames
      });
      setDmgShopNo('');
      setDmgShopName('');
      setDmgItems([]);
      setReportImages([]);
      triggerSuccessMsg('Damage report logged for Accounts verification!');
    } else if (salesTab === 'collection') {
      if (!collAmount) return alert('Please enter collection amount');
      onAddCollectionReport({
        id: 'cr-' + Date.now(),
        date: collDate,
        salesmanId: currentRole.id,
        salesmanName: currentRole.name,
        beatName: collBeat,
        collectionAmount: parseFloat(collAmount),
        status: 'Pending',
        images: imageNames
      });
      setCollAmount('');
      setReportImages([]);
      triggerSuccessMsg('Collection amount report saved successfully!');
    }
  };


  // --- PACKER WORKFLOWS ---
  const [selectedPackerId, setSelectedPackerId] = useState('');
  const [pPacked, setPPacked] = useState('');
  const [pLunchStart, setPLunchStart] = useState('12:00 PM');
  const [pLunchEnd, setPLunchEnd] = useState('12:30 PM');
  const [pCheckout, setPCheckout] = useState('05:00 PM');
  const [pStatus, setPStatus] = useState<'Packing' | 'On Break' | 'Checked Out'>('Packing');

  const handlePackingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackerId) return alert('Please select a packer to log data for');
    if (!pPacked) return alert('Please fill in packed products');
    
    const packer = activePackers.find(p => p.id === selectedPackerId);
    if (!packer) return;

    onAddPackingLog({
      id: 'pl-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      memberId: packer.id,
      memberName: packer.name,
      station: parseInt(packer.detail?.replace(/\D/g, '') || '1'),
      productsPacked: parseInt(pPacked),
      lunchStart: pLunchStart,
      lunchEnd: pLunchEnd,
      checkoutTime: pCheckout,
      status: pStatus,
      efficiency: Math.floor(82 + Math.random() * 17) // realistic simulated efficiency
    });
    setPPacked('');
    setSelectedPackerId('');
    triggerSuccessMsg('Log recorded! Stations performance updated.');
  };


  // --- DRIVER WORKFLOWS ---
  const [driverTab, setDriverTab] = useState<'returns' | 'mileage' | 'collections'>('returns');
  const [isQuickCapture, setIsQuickCapture] = useState(false);

  // Return product state
  const [retShopNo, setRetShopNo] = useState('');
  const [retShopName, setRetShopName] = useState('');
  const [retProduct, setRetProduct] = useState('');
  const [retQty, setRetQty] = useState('');
  const [retMRP, setRetMRP] = useState('');
  const [retReason, setRetReason] = useState('');

  // Mileage state
  const [milRoute, setMilRoute] = useState(currentRole.detail || 'Route Alpha-04');
  const [milStart, setMilStart] = useState('124500');
  const [milEnd, setMilEnd] = useState('');
  const [milFuel, setMilFuel] = useState('');

  // Market collection state
  const [colType, setColType] = useState<'Cash' | 'IMPS' | 'Cheque'>('Cash');
  const [colAmt, setColAmt] = useState('');
  const [colShopNo, setColShopNo] = useState('');
  const [colShopName, setColShopName] = useState('');
  const [colRefNo, setColRefNo] = useState('');
  const [colCheqDate, setColCheqDate] = useState(new Date().toISOString().split('T')[0]);

  const handleDriverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (driverTab === 'returns') {
      if (!retShopName || !retProduct || !retQty || !retMRP) {
        return alert('Please complete the product returns fields');
      }
      onAddReturnReport({
        id: 'ret-' + Date.now(),
        date: new Date().toISOString().split('T')[0],
        driverId: currentRole.id,
        driverName: currentRole.name,
        shopNo: retShopNo || 'SH-' + Math.floor(1000 + Math.random() * 9000),
        shopName: retShopName,
        productName: retProduct,
        quantity: parseInt(retQty),
        mrp: parseFloat(retMRP),
        status: 'Pending',
        remarks: retReason || 'Standard returns log'
      });
      // reset
      setRetShopNo('');
      setRetShopName('');
      setRetProduct('');
      setRetQty('');
      setRetMRP('');
      setRetReason('');
      triggerSuccessMsg('Market returns logged successfully!');
    } else if (driverTab === 'mileage') {
      if (!milEnd) return alert('Please enter ending odometer value');
      onAddMileageReport({
        id: 'mil-' + Date.now(),
        date: new Date().toISOString().split('T')[0],
        driverId: currentRole.id,
        driverName: currentRole.name,
        routeId: milRoute,
        startOdo: parseInt(milStart),
        endOdo: parseInt(milEnd),
        fuelExpenses: milFuel ? parseFloat(milFuel) : 0,
        status: 'Pending'
      });
      setMilEnd('');
      setMilFuel('');
      triggerSuccessMsg('Mileage log saved! Total odometer mileage logged.');
    } else if (driverTab === 'collections') {
      if (!colAmt || !colShopName) return alert('Please enter collection amount and shop name');
      onAddMarketCollection({
        id: 'dc-' + Date.now(),
        date: new Date().toISOString().split('T')[0],
        driverId: currentRole.id,
        driverName: currentRole.name,
        type: colType,
        amount: parseFloat(colAmt),
        shopNo: colShopNo || 'SH-' + Math.floor(100 + Math.random() * 900),
        shopName: colShopName,
        referenceNo: colType !== 'Cash' ? (colRefNo || 'REF-' + Math.floor(100000 + Math.random() * 900000)) : undefined,
        chequeDate: colType === 'Cheque' ? colCheqDate : undefined,
        status: 'Pending'
      });
      setColAmt('');
      setColShopNo('');
      setColShopName('');
      setColRefNo('');
      triggerSuccessMsg('Payment collection recorded! Available for Accounts verification.');
    }
  };

  return (
    <div id="forms-wrapper" className="max-w-2xl mx-auto space-y-6">
      
      {/* Hidden file input for simulate upload */}
      <input type="file" ref={fileInputRef} onChange={handleSimulateUpload} className="hidden" accept="image/*,.pdf" />

      {/* Success Banner */}
      {successMsg && (
        <div id="success-banner" className="bg-[#E4F9EC] text-emerald-800 p-4 rounded-xl border border-emerald-200 animate-in fade-in slide-in-from-top duration-300 flex items-center gap-3 shadow-sm-light">
          <CheckCircle className="text-emerald-500 shrink-0" size={20} />
          <div>
            <h4 className="font-semibold text-sm">Submission Complete</h4>
            <p className="text-xs opacity-90">{successMsg}</p>
          </div>
        </div>
      )}

      {/* Main Form container based on active switcher persona */}
      <div id="form-container" className="bg-white rounded-2xl shadow-sm border border-[#D2D2D7] overflow-hidden">
        
        {/* Header Block showcasing Current User details */}
        <div className="bg-[#F5F5F7] px-6 py-4.5 border-b border-[#D2D2D7] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={currentRole.avatar} 
              alt={currentRole.name} 
              className="w-10 h-10 rounded-full object-cover border border-[#D2D2D7]" 
            />
            <div>
              <p className="font-semibold text-[#1D1D1F] text-sm">Logging for: {currentRole.name}</p>
              <span className="text-[11px] text-[#0071E3] bg-[#0071E3]/5 border border-[#0071E3]/15 px-2 py-0.5 rounded-full font-semibold inline-block mt-0.5">
                {currentRole.role} Workflow / {currentRole.detail}
              </span>
            </div>
          </div>
          <span className="text-xs text-[#86868B] font-mono">ID: {currentRole.id}</span>
        </div>

        {/* --- SALESMAN SUBMISSION SCREEN --- */}
        {currentRole.role === 'Salesman' && (
          <div id="salesman-form-panel">
            <div className="flex border-b border-[#D2D2D7]">
              <button 
                type="button"
                onClick={() => setSalesTab('daily')}
                className={`flex-1 py-3 text-xs font-semibold border-b-2 text-center transition-colors ${
                  salesTab === 'daily' 
                    ? 'border-[#0071E3] text-[#0071E3] bg-[#0071E3]/5' 
                    : 'border-transparent text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7]'
                }`}
              >
                1. Sales Report
              </button>
              <button 
                type="button"
                onClick={() => setSalesTab('damage')}
                className={`flex-1 py-3 text-xs font-semibold border-b-2 text-center transition-colors ${
                  salesTab === 'damage' 
                    ? 'border-[#0071E3] text-[#0071E3] bg-[#0071E3]/5' 
                    : 'border-transparent text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7]'
                }`}
              >
                2. Damage Log
              </button>
              <button 
                type="button"
                onClick={() => setSalesTab('collection')}
                className={`flex-1 py-3 text-xs font-semibold border-b-2 text-center transition-colors ${
                  salesTab === 'collection' 
                    ? 'border-[#0071E3] text-[#0071E3] bg-[#0071E3]/5' 
                    : 'border-transparent text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7]'
                }`}
              >
                3. Collection Report
              </button>
            </div>

            <form onSubmit={handleSalesSubmit} className="p-6 space-y-5">
              {salesTab === 'daily' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-500 mb-1.5">Beat Name</label>
                      <input 
                        type="text" 
                        value={dailyBeat} 
                        onChange={(e) => setDailyBeat(e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm text-neutral-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-500 mb-1.5">Report Date</label>
                      <input 
                        type="date" 
                        value={dailyDate} 
                        onChange={(e) => setDailyDate(e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm text-neutral-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1.5">Total Sales Volume (₹)</label>
                    <div className="relative">
                      <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input 
                        type="number" 
                        step="0.01"
                        placeholder="0.00"
                        value={dailySales} 
                        onChange={(e) => setDailySales(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-lg text-sm text-neutral-800 font-mono-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" 
                      />
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-1">Aggregated gross market checkout figures for the selected beat area.</p>
                  </div>
                </>
              )}

              {salesTab === 'damage' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-500 mb-1.5">Shop Number (Optional)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. SH-401" 
                        value={dmgShopNo} 
                        onChange={(e) => setDmgShopNo(e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm text-neutral-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-500 mb-1.5">Shop Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Corner Grocery" 
                        value={dmgShopName} 
                        onChange={(e) => setDmgShopName(e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm text-neutral-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" 
                      />
                    </div>
                  </div>
                  <div className="border border-neutral-200 p-4 rounded-xl space-y-4">
                    <h4 className="text-sm font-semibold text-neutral-800">Add Damaged Product</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-neutral-500 mb-1.5">Product / SKU</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Premium Blend Tea 500g" 
                          value={dmgCurProduct} 
                          onChange={(e) => setDmgCurProduct(e.target.value)}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm text-neutral-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-neutral-500 mb-1.5">Quantity</label>
                        <input 
                          type="number" 
                          placeholder="e.g. 5" 
                          value={dmgCurQty} 
                          onChange={(e) => setDmgCurQty(e.target.value)}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm text-neutral-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" 
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-neutral-500 mb-1.5">MRP Value (₹)</label>
                        <div className="relative">
                          <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                          <input 
                            type="number" 
                            step="0.01" 
                            placeholder="0.00" 
                            value={dmgCurMRP} 
                            onChange={(e) => setDmgCurMRP(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 border border-neutral-300 rounded-lg text-sm text-neutral-800 font-mono-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" 
                          />
                        </div>
                      </div>
                      <div className="flex items-end mb-0.5">
                        <button type="button" onClick={addDamageItem} className="w-full text-xs font-bold text-[#0071E3] bg-[#0071E3]/10 hover:bg-[#0071E3]/20 py-2.5 rounded-lg transition-colors">
                          Add Item
                        </button>
                      </div>
                    </div>
                    {dmgItems.length > 0 && (
                      <div className="mt-4 border-t pt-4">
                        <p className="text-xs font-medium text-neutral-500 mb-2">Added Items ({dmgItems.length})</p>
                        <ul className="space-y-2">
                          {dmgItems.map((item, idx) => (
                            <li key={idx} className="flex justify-between items-center text-xs bg-neutral-50 p-2 rounded-md border border-neutral-200">
                              <span>{item.quantity}x {item.product}</span>
                              <span className="font-mono-sm font-semibold">₹{item.mrp.toFixed(2)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </>
              )}

              {salesTab === 'collection' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-500 mb-1.5">Beat Division</label>
                      <input 
                        type="text" 
                        value={collBeat} 
                        onChange={(e) => setCollBeat(e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm text-neutral-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-500 mb-1.5">Date of Collection</label>
                      <input 
                        type="date" 
                        value={collDate} 
                        onChange={(e) => setCollDate(e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm text-neutral-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1.5">Collection Amount Recovered (₹)</label>
                    <div className="relative">
                      <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input 
                        type="number" 
                        step="0.01"
                        placeholder="0.00"
                        value={collAmount} 
                        onChange={(e) => setCollAmount(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-lg text-sm text-neutral-800 font-mono-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" 
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="pt-4 border-t border-neutral-100 space-y-3">
                <label className="block text-xs font-medium text-neutral-500">Capture / Upload Evidence (Optional)</label>
                <div className="flex flex-col gap-2">
                  <label className="cursor-pointer bg-neutral-50 hover:bg-neutral-100 text-[#0071E3] py-2.5 rounded-lg border border-dashed border-[#0071E3]/30 flex items-center justify-center gap-2 transition-colors">
                    <Camera size={16} />
                    <span className="text-xs font-semibold">Add Image</span>
                    <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                  </label>
                  {reportImages.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {reportImages.map((file, i) => (
                        <div key={i} className="relative w-12 h-12 shrink-0 border border-neutral-200 rounded-md overflow-hidden bg-neutral-100 flex items-center justify-center">
                          <img src={URL.createObjectURL(file)} alt="Evidence" className="object-cover w-full h-full" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex justify-end gap-3">
                <button 
                  type="reset" 
                  onClick={() => {
                    setDailySales('');
                    setDmgShopName('');
                    setDmgCurProduct('');
                    setDmgCurMRP('');
                    setCollAmount('');
                    setReportImages([]);
                    setDmgItems([]);
                  }}
                  className="px-4 py-2 border border-neutral-200 text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-xs font-semibold transition-colors"
                >
                  Clear Fields
                </button>
              </div>

              {renderUploadAlternate()}
              
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
                <button 
                  type="submit" 
                  className="px-5 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <Send size={14} />
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        )}

        {/* --- PACKING SUPERVISOR SUBMISSION SCREEN --- */}
        {currentRole.role === 'Packing' && (
          <form onSubmit={handlePackingSubmit} className="p-6 space-y-5">
            <h3 className="text-sm font-bold text-neutral-800 border-b border-neutral-100 pb-2 flex items-center gap-2">
              <Package size={16} className="text-amber-500" />
              <span>Packing Force Operational Logs</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-neutral-500 mb-1.5">Select Packing Staff</label>
                <select 
                  value={selectedPackerId} 
                  onChange={(e) => setSelectedPackerId(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm text-neutral-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                  required
                >
                  <option value="" disabled>-- Select Staff Member --</option>
                  {activePackers.map(p => (
                    <option key={p.id} value={p.id}>{p.name} - {p.detail}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1.5">Products Packed Today (# of products/lines)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 1150"
                  value={pPacked} 
                  required
                  onChange={(e) => setPPacked(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm text-neutral-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" 
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1.5">Current Duty Status</label>
                <select 
                  value={pStatus}
                  onChange={(e) => setPStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm text-neutral-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="Packing">Active (Packing)</option>
                  <option value="On Break">Lunch/Break</option>
                  <option value="Checked Out">Shift checkout completed</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1.5 uppercase">Lunch Start</label>
                <input 
                  type="text" 
                  value={pLunchStart} 
                  onChange={(e) => setPLunchStart(e.target.value)}
                  placeholder="e.g. 12:00 PM"
                  className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg text-xs text-neutral-800 focus:border-blue-500 selection:bg-blue-100 outline-none bg-white font-mono-sm" 
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1.5 uppercase">Lunch End</label>
                <input 
                  type="text" 
                  value={pLunchEnd} 
                  onChange={(e) => setPLunchEnd(e.target.value)}
                  placeholder="e.g. 12:30 PM"
                  className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg text-xs text-neutral-800 focus:border-blue-500 outline-none bg-white font-mono-sm" 
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1.5 uppercase">Checkout Time</label>
                <input 
                  type="text" 
                  value={pCheckout} 
                  onChange={(e) => setPCheckout(e.target.value)}
                  placeholder="e.g. 05:00 PM"
                  className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg text-xs text-neutral-800 focus:border-blue-500 outline-none bg-white font-mono-sm" 
                />
              </div>
            </div>

            <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 p-3 rounded-lg text-indigo-900 text-xs">
              <Info size={16} className="text-indigo-500 shrink-0" />
              <span>Lunch Duration is tracked. Packing logs update the overall corporate target metrics immediately.</span>
            </div>

            {renderUploadAlternate()}

            <div className="pt-4 border-t border-neutral-100 flex justify-end gap-3">
              <button 
                type="submit" 
                className="px-5 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
              >
                <Send size={14} />
                Save Packing Log
              </button>
            </div>
          </form>
        )}

        {/* --- DELIVERY WORKER MONITOR & SUBMISSION --- */}
        {currentRole.role === 'Delivery' && (
          <div id="driver-form-panel">
            <div className="flex border-b border-[#D2D2D7]">
              <button 
                type="button"
                onClick={() => setDriverTab('returns')}
                className={`flex-1 py-3 text-xs font-semibold border-b-2 text-center transition-colors ${
                  driverTab === 'returns' 
                    ? 'border-[#0071E3] text-[#0071E3] bg-[#0071E3]/5' 
                    : 'border-transparent text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7]'
                }`}
              >
                1. Market Returns
              </button>
              <button 
                type="button"
                onClick={() => setDriverTab('mileage')}
                className={`flex-1 py-3 text-xs font-semibold border-b-2 text-center transition-colors ${
                  driverTab === 'mileage' 
                    ? 'border-[#0071E3] text-[#0071E3] bg-[#0071E3]/5' 
                    : 'border-transparent text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7]'
                }`}
              >
                2. Mileage Log
              </button>
              <button 
                type="button"
                onClick={() => setDriverTab('collections')}
                className={`flex-1 py-3 text-xs font-semibold border-b-2 text-center transition-colors ${
                  driverTab === 'collections' 
                    ? 'border-[#0071E3] text-[#0071E3] bg-[#0071E3]/5' 
                    : 'border-transparent text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7]'
                }`}
              >
                3. Market Collections
              </button>
            </div>

            {/* Quick Capture vs Typing Header details matching designs */}
            {driverTab === 'returns' && (
              <div className="grid grid-cols-2 gap-3 p-6 pb-2">
                <button
                  type="button"
                  onClick={() => setIsQuickCapture(true)}
                  className={`p-3 rounded-xl border flex items-center gap-3 text-left transition-all ${
                    isQuickCapture 
                      ? 'border-blue-600 bg-blue-50/30' 
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${isQuickCapture ? 'bg-blue-600 text-white' : 'bg-neutral-100 text-neutral-600'}`}>
                    <Camera size={18} />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-neutral-800">Quick Photo Capture</h5>
                    <p className="text-[10px] text-neutral-500">Scan slips with AI engine</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setIsQuickCapture(false)}
                  className={`p-3 rounded-xl border flex items-center gap-3 text-left transition-all ${
                    !isQuickCapture 
                      ? 'border-blue-600 bg-blue-50/30' 
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${!isQuickCapture ? 'bg-blue-600 text-white' : 'bg-neutral-100 text-neutral-600'}`}>
                    <Keyboard size={18} />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-neutral-800">Manual Entry</h5>
                    <p className="text-[10px] text-neutral-500">Type detailed specifications</p>
                  </div>
                </button>
              </div>
            )}

            <form onSubmit={handleDriverSubmit} className="p-6 space-y-4 pt-4">
              
              {driverTab === 'returns' && (
                <>
                  {isQuickCapture ? (
                    <div className="border-2 border-dashed border-neutral-300 rounded-2xl p-8 text-center bg-neutral-50 flex flex-col items-center justify-center space-y-3 cursor-pointer hover:bg-neutral-100 transition-colors">
                      <div className="w-12 h-12 bg-neutral-200 text-neutral-600 rounded-full flex items-center justify-center">
                        <Camera size={24} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-neutral-700">Scan Slips, Receipts, or Invoices</p>
                        <p className="text-[11px] text-neutral-500 mt-1">Upload an image for automatic OCR & AI form completion.</p>
                      </div>
                      <span className="text-[10px] text-blue-600 bg-blue-100 px-3 py-1 rounded-full font-semibold">Simulated Scanner</span>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-neutral-500 mb-1.5">Shop Number</label>
                          <input 
                            type="text" 
                            placeholder="e.g. SH-0921"
                            value={retShopNo}
                            required
                            onChange={(e) => setRetShopNo(e.target.value)}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm text-neutral-800 focus:border-blue-500 outline-none" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-neutral-500 mb-1.5">Shop Name</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Corner Mart"
                            value={retShopName}
                            required
                            onChange={(e) => setRetShopName(e.target.value)}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm text-neutral-800 focus:border-blue-500 outline-none" 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="col-span-1 md:col-span-2">
                          <label className="block text-xs font-medium text-neutral-500 mb-1.5">Returned Product Name</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Premium Blend Coffee"
                            value={retProduct}
                            required
                            onChange={(e) => setRetProduct(e.target.value)}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm text-neutral-800 focus:border-blue-500 outline-none" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-neutral-500 mb-1.5">Quantity</label>
                          <input 
                            type="number" 
                            placeholder="12"
                            value={retQty}
                            required
                            onChange={(e) => setRetQty(e.target.value)}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm text-neutral-800 focus:border-blue-500 outline-none" 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-neutral-500 mb-1.5">MRP Per Unit (₹)</label>
                          <input 
                            type="number" 
                            step="0.01"
                            placeholder="e.g. 24.99"
                            value={retMRP}
                            required
                            onChange={(e) => setRetMRP(e.target.value)}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm text-neutral-800 font-mono-sm focus:border-blue-500 outline-none" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-neutral-500 mb-1.5">Reason for return</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Damaged Packaging"
                            value={retReason}
                            onChange={(e) => setRetReason(e.target.value)}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm text-neutral-800 focus:border-blue-500 outline-none" 
                          />
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {driverTab === 'mileage' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-500 mb-1.5">Assigned Route</label>
                      <input 
                        type="text" 
                        value={milRoute} 
                        onChange={(e) => setMilRoute(e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm text-neutral-800 focus:border-blue-500 outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-500 mb-1.5">Starting Odometer (km)</label>
                      <input 
                        type="number" 
                        value={milStart} 
                        onChange={(e) => setMilStart(e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm text-neutral-800 font-mono-sm focus:border-blue-500 outline-none bg-neutral-50" 
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-500 mb-1.5">Ending Odometer (km)</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 124810"
                        value={milEnd} 
                        required
                        onChange={(e) => setMilEnd(e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm text-neutral-800 font-mono-sm focus:border-blue-500 outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-500 mb-1.5">Fuel Expenses (₹ spent today)</label>
                      <div className="relative">
                        <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input 
                          type="number" 
                          step="0.01"
                          placeholder="e.g. 45.00"
                          value={milFuel} 
                          onChange={(e) => setMilFuel(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 border border-neutral-300 rounded-lg text-sm text-neutral-800 font-mono-sm focus:border-blue-500 outline-none" 
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {driverTab === 'collections' && (
                <>
                  <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 mb-4">
                    <label className="block text-xs font-medium text-neutral-500 mb-1.5">Reconciliation Type</label>
                    <div className="flex gap-4">
                      {['Cash', 'IMPS', 'Cheque'].map((t) => (
                        <label key={t} className="flex items-center gap-2 text-xs font-bold text-neutral-800">
                          <input 
                            type="radio" 
                            name="colType" 
                            value={t} 
                            checked={colType === t}
                            onChange={() => {
                              setColType(t as any);
                              // set default simulated details
                              if (t === 'IMPS') setColRefNo('IMPS' + Math.floor(100000 + Math.random() * 899999));
                              else if (t === 'Cheque') setColRefNo('CHQ-' + Math.floor(10000 + Math.random() * 89999));
                              else setColRefNo('');
                            }}
                            className="text-blue-600 focus:ring-blue-500" 
                          />
                          {t} Format
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-500 mb-1.5">Shop Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Metro Plaza"
                        value={colShopName}
                        required
                        onChange={(e) => setColShopName(e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm text-neutral-800 focus:border-blue-500 outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-500 mb-1.5">Shop Number</label>
                      <input 
                        type="text" 
                        placeholder="e.g. SH-021"
                        value={colShopNo}
                        onChange={(e) => setColShopNo(e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm text-neutral-800 focus:border-blue-500 outline-none" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-500 mb-1.5">Collection Amount Total (₹)</label>
                      <div className="relative">
                        <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input 
                          type="number" 
                          step="0.01"
                          placeholder="e.g. 1250.00"
                          value={colAmt}
                          required
                          onChange={(e) => setColAmt(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 border border-neutral-300 rounded-lg text-sm text-neutral-800 font-mono-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" 
                        />
                      </div>
                    </div>

                    {colType !== 'Cash' && (
                      <div>
                        <label className="block text-xs font-medium text-neutral-500 mb-1.5">
                          {colType === 'IMPS' ? 'IMPS Number' : 'Cheque Number'}
                        </label>
                        <input 
                          type="text" 
                          placeholder={colType === 'IMPS' ? 'e.g. IMPS9823749823' : 'e.g. CHQ-004921'}
                          value={colRefNo}
                          required
                          onChange={(e) => setColRefNo(e.target.value)}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm text-neutral-800 font-mono-sm focus:border-blue-500 outline-none" 
                        />
                      </div>
                    )}
                  </div>

                  {colType === 'Cheque' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-neutral-500 mb-1.5">Cheque Date</label>
                        <input 
                          type="date" 
                          value={colCheqDate} 
                          onChange={(e) => setColCheqDate(e.target.value)}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm text-neutral-800 focus:border-blue-500 outline-none font-mono-sm" 
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {renderUploadAlternate()}

              <div className="pt-4 border-t border-neutral-100 flex justify-end gap-3">
                <button 
                  type="submit" 
                  className="px-5 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <Send size={14} />
                  Submit Log Entry
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
