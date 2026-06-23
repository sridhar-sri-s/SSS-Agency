import fs from 'fs';
import path from 'path';

const file = '/Users/sridhars/.gemini/antigravity/scratch/sss-agency/src/components/AdminViews.tsx';
let content = fs.readFileSync(file, 'utf8');

const additionalQueues = `

            {/* 2. COLLECTION REPORTS QUEUE */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign size={14} />
                <span>Salesman Collection Reports Validation Queue</span>
              </h4>
              <div className="border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#FAF9F6]">
                    <tr className="border-b border-neutral-200 text-[10px] text-neutral-500 font-bold uppercase">
                      <th className="p-3">Salesman User ID</th>
                      <th className="p-3">Beat Location</th>
                      <th className="p-3 text-right">Cash Drafts</th>
                      <th className="p-3 text-right">Cheque/IMPS</th>
                      {isAdmin && <th className="p-3 text-center">Images</th>}
                      <th className="p-3 text-center">Status Color</th>
                      <th className="p-3">Auditor Action Panel</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {collectionReports.map((report) => (
                      <tr key={report.id} className={\`hover:bg-neutral-50/45 transition-all \${getStatusClass(report.status)}\`}>
                        <td className="p-3">
                          <p className="font-bold text-neutral-950">{report.salesmanName}</p>
                          <span className="text-[10px] text-neutral-400 font-mono-sm">ID: {report.salesmanId}</span>
                        </td>
                        <td className="p-3 text-neutral-600 font-medium">{report.beatName}</td>
                        <td className="p-3 text-right font-mono-sm font-black text-neutral-900">₹{report.cashCollected.toFixed(2)}</td>
                        <td className="p-3 text-right font-mono-sm font-semibold text-neutral-700">₹{report.chequeCollected.toFixed(2)}</td>
                        {isAdmin && (
                          <td className="p-3 text-center">
                            {report.images && report.images.length > 0 ? (
                              <button onClick={() => setViewingImage(report.images?.[0] || null)} className="text-blue-600 underline font-semibold text-xs">View Image</button>
                            ) : <span className="text-xs text-neutral-400">-</span>}
                          </td>
                        )}
                        <td className="p-3 text-center">{getStatusBadge(report.status)}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => onVerifyCollectionReport(report.id, 'Verified')}
                              className="p-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold flex items-center gap-1"
                            >
                              <Check size={10} /> Verify
                            </button>
                            <button 
                              onClick={() => setActiveAuditItem({ id: report.id, type: 'collection_rep', remarks: report.remarks || '' })}
                              className="p-1 px-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold flex items-center gap-1"
                            >
                              <X size={10} /> Query
                            </button>
                          </div>
                          {report.remarks && (
                            <p className="text-[10px] text-rose-700 font-medium italic mt-1 flex items-center gap-1">
                              <MessageSquare size={10} /> Remarks: {report.remarks}
                            </p>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. RETURN REPORTS QUEUE */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1.5">
                <RefreshCcw size={14} />
                <span>Return Reports Validation Queue</span>
              </h4>
              <div className="border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#FAF9F6]">
                    <tr className="border-b border-neutral-200 text-[10px] text-neutral-500 font-bold uppercase">
                      <th className="p-3">Driver User ID</th>
                      <th className="p-3">Shop details</th>
                      <th className="p-3 text-right">Items & Total</th>
                      {isAdmin && <th className="p-3 text-center">Images</th>}
                      <th className="p-3 text-center">Status Color</th>
                      <th className="p-3">Auditor Action Panel</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {returnReports.map((report) => {
                      const totalMRP = getReturnTotalValue(report);
                      const itemsCount = getReturnItems(report).length;
                      return (
                      <tr key={report.id} className={\`hover:bg-neutral-50/45 transition-all \${getStatusClass(report.status)}\`}>
                        <td className="p-3">
                          <p className="font-bold text-neutral-950">{report.driverName}</p>
                          <span className="text-[10px] text-neutral-400 font-mono-sm">ID: {report.driverId}</span>
                        </td>
                        <td className="p-3">
                          <p className="text-neutral-800 font-bold leading-tight">{report.shopName}</p>
                          <span className="text-[10px] text-neutral-400 font-mono-sm uppercase">{report.shopNo}</span>
                        </td>
                        <td className="p-3 text-right">
                          <p className="font-semibold text-neutral-800">{itemsCount} Products</p>
                          <span className="text-[10px] font-mono-sm font-black text-rose-700">₹{totalMRP.toFixed(2)}</span>
                        </td>
                        {isAdmin && (
                          <td className="p-3 text-center">
                            {report.images && report.images.length > 0 ? (
                              <button onClick={() => setViewingImage(report.images?.[0] || null)} className="text-blue-600 underline font-semibold text-xs">View Image</button>
                            ) : <span className="text-xs text-neutral-400">-</span>}
                          </td>
                        )}
                        <td className="p-3 text-center">{getStatusBadge(report.status)}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => onVerifyReturnReport(report.id, 'Verified')}
                              className="p-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold flex items-center gap-1"
                            >
                              <Check size={10} /> Verify
                            </button>
                            <button 
                              onClick={() => setActiveAuditItem({ id: report.id, type: 'return_rep', remarks: report.remarks || '' })}
                              className="p-1 px-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold flex items-center gap-1"
                            >
                              <X size={10} /> Query
                            </button>
                          </div>
                          {report.remarks && (
                            <p className="text-[10px] text-rose-700 font-medium italic mt-1 flex items-center gap-1">
                              <MessageSquare size={10} /> Remarks: {report.remarks}
                            </p>
                          )}
                        </td>
                      </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. MILEAGE REPORTS QUEUE */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin size={14} />
                <span>Mileage Reports Validation Queue</span>
              </h4>
              <div className="border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#FAF9F6]">
                    <tr className="border-b border-neutral-200 text-[10px] text-neutral-500 font-bold uppercase">
                      <th className="p-3">Driver User ID</th>
                      <th className="p-3">Route Zone</th>
                      <th className="p-3">Odometer Readings</th>
                      <th className="p-3 text-right">Total Distance</th>
                      {isAdmin && <th className="p-3 text-center">Images</th>}
                      <th className="p-3 text-center">Status Color</th>
                      <th className="p-3">Auditor Action Panel</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {mileageReports.map((report) => (
                      <tr key={report.id} className={\`hover:bg-neutral-50/45 transition-all \${getStatusClass(report.status)}\`}>
                        <td className="p-3">
                          <p className="font-bold text-neutral-950">{report.driverName}</p>
                          <span className="text-[10px] text-neutral-400 font-mono-sm">ID: {report.driverId}</span>
                        </td>
                        <td className="p-3 text-neutral-600 font-medium">{report.routeZone}</td>
                        <td className="p-3 font-mono-sm text-neutral-500">
                          {report.startOdo} → {report.endOdo}
                        </td>
                        <td className="p-3 text-right font-mono-sm font-black text-neutral-900">
                          {(report.endOdo - report.startOdo).toFixed(1)} km
                        </td>
                        {isAdmin && (
                          <td className="p-3 text-center">
                            {report.images && report.images.length > 0 ? (
                              <button onClick={() => setViewingImage(report.images?.[0] || null)} className="text-blue-600 underline font-semibold text-xs">View Image</button>
                            ) : <span className="text-xs text-neutral-400">-</span>}
                          </td>
                        )}
                        <td className="p-3 text-center">{getStatusBadge(report.status)}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => onVerifyMileageReport(report.id, 'Verified')}
                              className="p-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold flex items-center gap-1"
                            >
                              <Check size={10} /> Verify
                            </button>
                            <button 
                              onClick={() => setActiveAuditItem({ id: report.id, type: 'mileage_rep', remarks: report.remarks || '' })}
                              className="p-1 px-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold flex items-center gap-1"
                            >
                              <X size={10} /> Query
                            </button>
                          </div>
                          {report.remarks && (
                            <p className="text-[10px] text-rose-700 font-medium italic mt-1 flex items-center gap-1">
                              <MessageSquare size={10} /> Remarks: {report.remarks}
                            </p>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
`;

// Insert additional queues right before the end of the Tasks list div.
// It ends with:
//               </div>
//             </div>
//
//           </div>
//         </div>
//
//         {viewingImage && (

const insertIndex = content.indexOf('{viewingImage && (');
if (insertIndex !== -1) {
  // Find the closing divs for the container before {viewingImage &&
  const targetTag = '          </div>\n        </div>\n';
  const beforeInsertIndex = content.lastIndexOf(targetTag, insertIndex);
  if (beforeInsertIndex !== -1) {
    const newContent = content.slice(0, beforeInsertIndex) + additionalQueues + '\\n' + content.slice(beforeInsertIndex);
    fs.writeFileSync(file, newContent);
    console.log('Successfully injected queues.');
  } else {
    console.log('Target closing tags not found.');
  }
} else {
  console.log('{viewingImage && ( not found');
}
